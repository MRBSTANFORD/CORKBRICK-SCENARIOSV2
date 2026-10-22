/**
 * Rationale: Add global CORS preflight middleware (OPTIONS 204) to resolve Google HTTP 405 Method Not Allowed
 * in Chromium browsers (Chrome & Edge) when sending custom Authorization and JSON headers.
 * Reference Task: Resolve Google HTTP 405 error in Google Chrome and Microsoft Edge.
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Modality, GenerateVideosOperation } from '@google/genai';

const app = express();

// CORS preflight handling for Chrome, Edge, Firefox, and Safari
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));

const PORT = Number(process.env.PORT) || 3000;

// Health check endpoint for Cloud Run container lifecycle probes
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

const getGenAIClient = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  let customKey = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    customKey = authHeader.slice(7).trim();
  }
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API Key. Please provide one via "Setup Key" or set GEMINI_API_KEY environment variable.');
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
};

function fileToGenerativePart(base64Data: string, mimeType: string) {
  let cleanMime = mimeType || 'image/jpeg';
  if (cleanMime === 'image/jpg') cleanMime = 'image/jpeg';
  const data = base64Data && base64Data.includes(',') ? base64Data.split(',')[1] : (base64Data || '');
  return {
    inlineData: {
      data,
      mimeType: cleanMime,
    },
  };
}

// Edit Image
app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { images, prompt, systemPrompt, modelName, aiProvider } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one image.' });
    }

    if (aiProvider === 'huggingface') {
      const authHeader = req.headers.authorization;
      const hfToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!hfToken) throw new Error("Hugging Face API token is required. Please add your token in 'Setup Key'.");

      const hfModel = (modelName && modelName.includes('/')) ? modelName : "black-forest-labs/FLUX.1-schnell";
      const hfPrompt = `${systemPrompt} | Scene to generate: ${prompt}`;

      let hfResponse: Response;
      try {
        hfResponse = await fetch(`https://router.huggingface.co/hf-inference/models/${hfModel}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: hfPrompt }),
        });
      } catch {
        hfResponse = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: hfPrompt }),
        });
      }

      if (!hfResponse.ok) {
        let errJson: any = { error: `Hugging Face inference error (${hfResponse.status})` };
        try { errJson = await hfResponse.json(); } catch {}
        throw new Error(errJson.error || errJson.message || "Hugging Face model error or model is still loading. Please try again.");
      }

      const contentType = hfResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        let errJson: any = { error: "Hugging Face returned an error object instead of an image." };
        try { errJson = await hfResponse.json(); } catch {}
        throw new Error(errJson.error || errJson.message || "Hugging Face returned an error object instead of an image.");
      }

      const arrayBuffer = await hfResponse.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      return res.json({ generatedImageBase64: `data:image/jpeg;base64,${base64Data}` });
    }

    const ai = getGenAIClient(req);
    const imageParts = images.map((image: any) => fileToGenerativePart(image.dataUrl, image.mimeType));
    const fullPrompt = `${systemPrompt}\n\n---\n\nUser prompt: "${prompt}"`;
    const textPart = { text: fullPrompt };

    // Set of candidate models with automatic fallback
    const modelsToTry = [modelName || 'gemini-2.5-flash-image'];
    if (modelsToTry[0] === 'gemini-2.5-flash-image') {
      modelsToTry.push('gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image');
    } else if (modelsToTry[0] === 'gemini-3.1-flash-lite-image') {
      modelsToTry.push('gemini-2.5-flash-image', 'gemini-3.1-flash-image');
    }

    let lastError: any = null;
    for (const currentModel of modelsToTry) {
      try {
        console.log(`[edit-image] Calling Gemini model: ${currentModel}`);
        const geminiResponse = await ai.models.generateContent({
          model: currentModel,
          contents: { parts: [...imageParts, textPart] },
          config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of geminiResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return res.json({ generatedImageBase64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
          }
        }

        // Check if model returned an explanation/refusal text
        const textParts = (geminiResponse.candidates?.[0]?.content?.parts || [])
          .filter((p: any) => p.text)
          .map((p: any) => p.text)
          .join(' ')
          .trim();
        if (textParts) {
          throw new Error(`AI generated text instead of an image: "${textParts}"`);
        }
        throw new Error(`No image was generated by ${currentModel}.`);
      } catch (geminiError: any) {
        lastError = geminiError;
        console.warn(`[edit-image] Attempt with ${currentModel} failed:`, geminiError.message);
        // If quota or billing failure on Google Cloud project, all models under that project share the quota
        if (geminiError.message?.includes('429') || geminiError.message?.includes('Quota exceeded') || geminiError.message?.includes('RESOURCE_EXHAUSTED')) {
          break;
        }
      }
    }

    throw lastError || new Error('No image was generated in the response.');
  } catch (error: any) {
    console.error('Error in edit-image:', error);
    let msg = error.message || "An unknown error occurred";
    if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("limit: 0")) {
      msg = "Gemini image quota exceeded. Note: Google AI Studio requires a linked Google Cloud billing account for image generation models (even within the free credit tier). Please verify billing or use the 100% free Hugging Face option.";
    } else if (msg.includes("403") || msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      msg = "Your Gemini API key is invalid or lacks necessary permissions. Please check your key in 'Setup Key'.";
    } else if (msg.includes("Image generation is not available in your country")) {
      msg = "Gemini image generation is restricted by region on this key. Please provide your Gemini API key in 'Setup Key', or switch to Hugging Face.";
    }
    res.status(500).json({ error: msg });
  }
});

// Generate Description
app.post('/api/gemini/generate-description', async (req, res) => {
  try {
    const { editedImageBase64, mimeType, userPrompt, textModelName, aiProvider } = req.body;
    if (aiProvider === 'huggingface') {
       return res.json({ description: `(Hugging Face) ${userPrompt}` });
    }
    const ai = getGenAIClient(req);
    
    const imagePart = fileToGenerativePart(editedImageBase64, mimeType);
    const textPart = {
      text: `You are a creative marketing assistant for 'Corkbrick', a modular furniture brand.
        A user provided this prompt: "${userPrompt}".
        Based on the user's prompt and the image provided, write a short, powerful, and inspiring marketing description for the resulting scene.
        Focus on the versatility and appeal of the Corkbrick solution in this new environment. The description should be 1-2 sentences long.`
    };

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: { parts: [imagePart, textPart] },
    });
    
    res.json({ description: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error in generate-description:', error);
    let msg = error.message || "An error occurred";
    if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED")) {
      msg = "Rate limit reached. Please wait a minute.";
    }
    res.status(500).json({ error: msg });
  }
});

// Live Validate API Key endpoint
app.post('/api/gemini/validate-key', async (req, res) => {
  try {
    const { aiProvider, apiKey } = req.body;
    const cleanKey = (apiKey || '').trim();

    if (!cleanKey) {
      return res.status(400).json({ valid: false, message: 'Please provide an API key or token to validate.' });
    }

    if (aiProvider === 'huggingface') {
      try {
        const hfRes = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${cleanKey}` }
        });
        if (hfRes.ok) {
          const who: any = await hfRes.json();
          return res.json({
            valid: true,
            provider: 'huggingface',
            accountName: who.name || 'User',
            canGenerateImages: true,
            message: `Hugging Face token verified for ${who.name || 'user'}. Ready for FLUX generation!`
          });
        } else {
          return res.status(400).json({
            valid: false,
            provider: 'huggingface',
            message: `Hugging Face rejected this token (HTTP ${hfRes.status}). Please verify token permissions.`
          });
        }
      } catch (hfErr: any) {
        return res.status(400).json({
          valid: false,
          provider: 'huggingface',
          message: `Network error verifying Hugging Face token: ${hfErr.message}`
        });
      }
    }

    // Google Gemini Validation
    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    // Step 1: Test basic key validity and text reasoning with gemini-3.8-flash
    let textOk = false;
    try {
      const textPing = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Hello',
      });
      if (textPing) textOk = true;
    } catch (textErr: any) {
      const errStr = textErr.message || '';
      console.warn('[validate-key] Text model ping failed:', errStr);
      if (errStr.includes('API key not valid') || errStr.includes('403') || errStr.includes('API_KEY_INVALID')) {
        return res.status(400).json({
          valid: false,
          status: 'INVALID_KEY',
          message: 'Google rejected this API key. Please check for typos or ensure the key is active in Google AI Studio.'
        });
      }
      if (errStr.includes('IP') || errStr.includes('referer') || errStr.includes('restricted')) {
        return res.status(400).json({
          valid: false,
          status: 'KEY_RESTRICTED',
          message: 'This key has application or HTTP Referrer restrictions in Google Cloud Console. Remove HTTP referrer restrictions to allow server requests.'
        });
      }
      if (errStr.includes('429') || errStr.includes('Quota exceeded') || errStr.includes('RESOURCE_EXHAUSTED')) {
        return res.status(400).json({
          valid: false,
          status: 'QUOTA_EXCEEDED',
          message: 'Gemini rate limit or quota exceeded on this project.'
        });
      }
      return res.status(400).json({
        valid: false,
        status: 'ERROR',
        message: `Google validation error: ${errStr}`
      });
    }

    // Step 2: Test image model capability and quota status
    let imageOk = true;
    let imageNotice = '';
    try {
      const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const imagePing = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: dummyBase64, mimeType: 'image/png' } },
            { text: 'test' }
          ]
        },
        config: { responseModalities: [Modality.IMAGE] },
      });
      if (!imagePing) imageOk = false;
    } catch (imgErr: any) {
      const imgErrStr = imgErr.message || '';
      console.warn('[validate-key] Image model ping check:', imgErrStr);
      if (imgErrStr.includes('limit: 0') || imgErrStr.includes('RESOURCE_EXHAUSTED') || imgErrStr.includes('Quota exceeded')) {
        imageOk = false;
        imageNotice = 'Google requires a linked Google Cloud billing account for image generation models (limit: 0 on projects without billing). Link a billing account in Google Cloud, or use the free Hugging Face option.';
      }
    }

    return res.json({
      valid: true,
      canGenerateText: textOk,
      canGenerateImages: imageOk,
      imageNotice,
      message: imageOk 
        ? '✓ Key verified with Google! Text and Image generation are active.'
        : `Key verified for text reasoning. Note: ${imageNotice}`
    });
  } catch (err: any) {
    console.error('Error in validate-key:', err);
    res.status(500).json({ valid: false, message: err.message || 'Validation service error' });
  }
});

// Generate Filename
app.post('/api/gemini/generate-filename', async (req, res) => {
  try {
    const { description, textModelName, aiProvider } = req.body;
    if (aiProvider === 'huggingface') {
       return res.json({ filename: `corkbrick-scenario-${Date.now()}` });
    }
    const ai = getGenAIClient(req);

    const textPart = {
      text: `You are a file naming assistant.
        Based on the following description of an image, create a short, descriptive, file-safe filename.
        The filename should be in kebab-case (e.g., 'modern-living-room-beach-view') and be no more than 5-6 words long.
        Do not include any file extension.
        
        Description: "${description}"`
    };

    const response = await ai.models.generateContent({
      model: textModelName,
      contents: { parts: [textPart] },
    });
    
    const filename = (response.text || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
      
    res.json({ filename: filename || 'corkbrick-scenario' });
  } catch (error: any) {
    console.error('Error in generate-filename:', error);
    let msg = error.message || "An error occurred";
    if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED")) {
      msg = "Rate limit reached. Please wait a minute.";
    }
    res.status(500).json({ error: msg });
  }
});

// Generate Video - Start
app.post('/api/gemini/generate-video', async (req, res) => {
  try {
    const ai = getGenAIClient(req);
    const { base64ImageData, mimeType, modelName, prompt } = req.body;
    
    const operation = await ai.models.generateVideos({
      model: modelName,
      prompt: prompt,
      image: {
        imageBytes: base64ImageData.split(',')[1],
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error in generate-video:', error);
    
    let msg = error.message || "";
    if (msg.includes("403") || msg.includes("permission") || msg.includes("API key not valid")) {
      msg = "Your API key does not have permission for Video Generation. This requires a Google Cloud project with billing enabled.";
    } else if (msg.includes("404") || msg.includes("not found")) {
      msg = "The Video Generation model (Veo) is currently unavailable in your region or for your specific API key.";
    } else if (msg.includes("quota") || msg.includes("429")) {
      msg = "You have reached the temporary rate limit for video generation. Please wait a few minutes before trying again.";
    }
    
    res.status(500).json({ error: msg });
  }
});

// Generate Video - Poll
app.post('/api/gemini/video-status', async (req, res) => {
  try {
    const ai = getGenAIClient(req);
    const { operationName } = req.body;
    
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    res.json({ done: updated.done });
  } catch (error: any) {
    console.error('Error in video-status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Video - Download
app.post('/api/gemini/video-download', async (req, res) => {
  try {
    const ai = getGenAIClient(req);
    const { operationName } = req.body;
    
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error('Video URI not found on completed operation.');

    // We must fetch it with the api key
    const customKey = req.headers.authorization?.replace('Bearer ', '');
    const apiKey = customKey || process.env.GEMINI_API_KEY || '';

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
        throw new Error('Failed to download video file.');
    }

    res.setHeader('Content-Type', 'video/mp4');
    videoRes.body!.pipeTo(
      new WritableStream({
        write(chunk) { res.write(chunk); },
        close() { res.end(); },
      })
    );
  } catch (error: any) {
    console.error('Error in video-download:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.argv[1]?.includes('dist'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.use((_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
