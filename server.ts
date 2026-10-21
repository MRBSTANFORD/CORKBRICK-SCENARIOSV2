/**
 * Rationale: Support dynamic Cloud Run PORT binding (process.env.PORT), remove top-level
 * Vite dependency in production bundle, and add health check route for Cloud Run deployment rollout.
 * Reference Task: Fix Cloud Run deployment health check and Express 5 routing crash.
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Modality, GenerateVideosOperation } from '@google/genai';

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = Number(process.env.PORT) || 3000;

// Health check endpoint for Cloud Run container lifecycle probes
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

const getGenAIClient = (req: express.Request) => {
  const customKey = req.headers.authorization?.replace('Bearer ', '');
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API Key. Please provide one or set GEMINI_API_KEY environment variable.');
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
};

function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
}

// Edit Image
app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { images, prompt, systemPrompt, modelName, aiProvider } = req.body;

    if (aiProvider === 'huggingface') {
      const hfToken = req.headers.authorization?.split('Bearer ')[1];
      if (!hfToken) throw new Error("Hugging Face API token is required. Please add your token in 'Setup API Key'.");

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

    let geminiResponse;
    try {
      geminiResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [...imageParts, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
      });

      for (const part of geminiResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ generatedImageBase64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
        }
      }
      throw new Error('No image was generated in the response.');
    } catch (geminiError: any) {
      console.error('Gemini image generation error:', geminiError.message);
      throw geminiError;
    }
  } catch (error: any) {
    console.error('Error in edit-image:', error);
    let msg = error.message || "An unknown error occurred";
    if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED")) {
      msg = "Gemini quota or rate limit reached. Please provide your Gemini API key (with billing enabled) via 'Setup API Key', or use Hugging Face.";
    } else if (msg.includes("403") || msg.includes("API key not valid")) {
      msg = "Your Gemini API key is invalid or lacks necessary permissions. Please check your key in 'Setup API Key'.";
    } else if (msg.includes("Image generation is not available in your country")) {
      msg = "Gemini image generation is restricted by region on the default key. Please provide your Gemini API key in 'Setup API Key', or switch to Hugging Face.";
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
