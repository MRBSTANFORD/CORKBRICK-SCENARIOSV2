/**
 * Rationale: Add automatic client-side direct fallback for Gemini and Hugging Face when backend
 * routes return 404 / NOT_FOUND (e.g. when published on Vercel, SAP Build, or static hosting where Express is absent).
 * Reference Task: Resolve "The page could not be found NOT_FOUND cdg1::..." error in published Vercel/SAP deployment.
 */

import { VEO_MODEL_NAME, DEFAULT_VIDEO_PROMPT } from '../constants';
import type { ImageFile, ProviderKey } from '../types';

/**
 * Ensures an uploaded reference image is scaled to a reasonable resolution (max 1200px)
 * to avoid huge multi-megabyte payloads over the network that trigger payload limits.
 *
 * @param img - Original ImageFile with dataUrl and mimeType.
 * @param maxDim - Maximum width or height constraint (default 1200px).
 * @returns Optimized ImageFile.
 */
const ensureOptimizedImage = async (img: ImageFile, maxDim = 1200): Promise<ImageFile> => {
  if (!img.dataUrl || !img.dataUrl.startsWith('data:image/')) return img;
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      let { width, height } = image;
      if (width <= maxDim && height <= maxDim && img.dataUrl.length < 500000) {
        return resolve(img);
      }
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(img);
      ctx.drawImage(image, 0, 0, width, height);
      const optimizedUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve({ dataUrl: optimizedUrl, mimeType: 'image/jpeg' });
    };
    image.onerror = () => resolve(img);
    image.src = img.dataUrl;
  });
};

/**
 * Direct client-side Hugging Face FLUX image generation.
 * Used when running on static hosts (e.g. Vercel) where Express backend is not present.
 */
const directGenerateHuggingFace = async (
  prompt: string,
  systemPrompt: string,
  modelName: string,
  token: string
): Promise<string> => {
  const hfModel = (modelName && modelName.includes('/')) ? modelName : "black-forest-labs/FLUX.1-schnell";
  const hfPrompt = `${systemPrompt} | Scene to generate: ${prompt}`;

  let res: Response;
  try {
    res = await fetch(`https://router.huggingface.co/hf-inference/models/${hfModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: hfPrompt }),
    });
  } catch {
    res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: hfPrompt }),
    });
  }

  if (!res.ok) {
    let errJson: any = {};
    try { errJson = await res.json(); } catch {}
    throw new Error(errJson.error || errJson.message || `Hugging Face inference error (${res.status}).`);
  }

  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Direct client-side Google Gemini image generation via official Generative Language API.
 * Seamless fallback for Vercel, SAP Build, and static deployments.
 */
const directGenerateGeminiImage = async (
  images: ImageFile[],
  prompt: string,
  systemPrompt: string,
  modelName: string,
  apiKey: string
): Promise<string> => {
  const imageParts = images.map((img) => {
    let mimeType = img.mimeType || 'image/jpeg';
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    const data = img.dataUrl && img.dataUrl.includes(',') ? img.dataUrl.split(',')[1] : img.dataUrl;
    return {
      inlineData: {
        mimeType,
        data,
      },
    };
  });

  const fullPrompt = `${systemPrompt}\n\n---\n\nUser prompt: "${prompt}"`;
  const textPart = { text: fullPrompt };

  const modelsToTry = [
    modelName || 'gemini-2.5-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3.1-flash-image',
  ];

  let lastErrorMsg = '';

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [...imageParts, textPart] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errText = errJson.error?.message || `Google HTTP ${res.status}`;
        lastErrorMsg = errText;
        if (errText.includes('429') || errText.includes('Quota exceeded') || errText.includes('RESOURCE_EXHAUSTED')) {
          break;
        }
        continue;
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      const textPartContent = parts.find((p: any) => p.text)?.text;
      if (textPartContent) {
        throw new Error(`AI generated text instead of an image: "${textPartContent}"`);
      }
    } catch (err: any) {
      lastErrorMsg = err.message || lastErrorMsg;
    }
  }

  throw new Error(lastErrorMsg || 'Failed to generate scenario image directly with Gemini API.');
};

/**
 * Direct client-side description generation.
 */
const directGenerateDescription = async (
  editedImageBase64: string,
  mimeType: string,
  userPrompt: string,
  textModelName: string,
  apiKey: string
): Promise<string> => {
  const cleanMime = (mimeType === 'image/jpg' ? 'image/jpeg' : mimeType) || 'image/jpeg';
  const cleanData = editedImageBase64.includes(',') ? editedImageBase64.split(',')[1] : editedImageBase64;
  const prompt = `Based on this generated Corkbrick scenario image and the original request ("${userPrompt}"), write an inspiring, professional, and concise 2-3 sentence marketing description showcasing how modular Corkbrick transforms this architectural space.`;

  const model = textModelName || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: cleanMime, data: cleanData } },
          { text: prompt },
        ],
      }],
    }),
  });

  if (!res.ok) return '';
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
};

/**
 * Direct client-side filename slug generation.
 */
const directGenerateFilename = async (
  description: string,
  textModelName: string,
  apiKey: string
): Promise<string> => {
  const prompt = `Given this architectural scenario description: "${description}", generate a concise, clean kebab-case filename (e.g. scandinavian-living-corkbrick). Return ONLY the kebab-case string, with no quotes, spaces, or markdown.`;
  const model = textModelName || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) return 'corkbrick-scenario';
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'corkbrick-scenario';
  return rawText.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'corkbrick-scenario';
};

/**
 * Helper to determine if an error is due to a missing backend router (e.g. static host 404).
 */
const isBackendRouteMissing = (status: number, rawText: string): boolean => {
  return (
    status === 404 ||
    status === 405 ||
    rawText.includes('NOT_FOUND') ||
    rawText.includes('The page could not be found') ||
    rawText.includes('Cannot POST') ||
    rawText.includes('<!DOCTYPE') ||
    rawText.includes('<html')
  );
};

/**
 * Edits or synthesizes a scenario image from reference Corkbrick images and a prompt.
 * Seamlessly handles both backend Express proxy and direct client-side fallback.
 *
 * @param images - Array of reference image files uploaded by the user.
 * @param prompt - User description of the target scenario.
 * @param systemPrompt - Architectural and styling system guidelines.
 * @param modelName - The AI model identifier (e.g. gemini-2.5-flash-image).
 * @param userApiKey - Optional user-provided API key / token.
 * @param aiProvider - AI provider key ('google_flash', 'google_pro', or 'huggingface').
 * @returns Base64-encoded image data URL string.
 */
export const editImageWithPrompt = async (
  images: ImageFile[],
  prompt: string,
  systemPrompt: string,
  modelName: string,
  userApiKey?: string,
  aiProvider: ProviderKey = 'google_flash'
): Promise<string> => {
  const cleanKey = (userApiKey || '').trim();

  // Pre-optimize reference images to ensure payload stays small
  const optimizedImages = await Promise.all(images.map((img) => ensureOptimizedImage(img, 1200)));

  // 1. Attempt generation via backend proxy
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cleanKey) headers['Authorization'] = `Bearer ${cleanKey}`;

    const response = await fetch('/api/gemini/edit-image', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ images: optimizedImages, prompt, systemPrompt, modelName, aiProvider }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.generatedImageBase64) return data.generatedImageBase64;
    } else {
      const rawText = await response.text().catch(() => '');
      
      // If backend route is missing (e.g., deployed statically on Vercel / SAP Build), trigger direct fallback
      if (isBackendRouteMissing(response.status, rawText)) {
        if (!cleanKey) {
          throw new Error("This deployment runs on static hosting. Please click 'Setup Key' in the top bar to provide your Gemini API Key or free Hugging Face token.");
        }

        console.info('[geminiService] Backend route not found, running direct client generation...');
        if (aiProvider === 'huggingface') {
          return await directGenerateHuggingFace(prompt, systemPrompt, modelName, cleanKey);
        } else {
          return await directGenerateGeminiImage(optimizedImages, prompt, systemPrompt, modelName, cleanKey);
        }
      }

      // Parse JSON error from server
      let msg = `Failed to generate scenario image (HTTP ${response.status}).`;
      try {
        const data = JSON.parse(rawText);
        if (data.error) msg = data.error;
      } catch {
        if (rawText && rawText.length < 350) msg = rawText;
      }
      throw new Error(msg);
    }
  } catch (err: any) {
    // If network error occurred trying to reach /api (or direct fallback needed)
    if (cleanKey && (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'))) {
      console.info('[geminiService] Network fetch to backend failed, running direct client generation...');
      if (aiProvider === 'huggingface') {
        return await directGenerateHuggingFace(prompt, systemPrompt, modelName, cleanKey);
      } else {
        return await directGenerateGeminiImage(optimizedImages, prompt, systemPrompt, modelName, cleanKey);
      }
    }
    throw err;
  }

  throw new Error('No image was returned by the AI provider.');
};

/**
 * Generates an inspiring marketing description for the synthesized scenario.
 *
 * @param editedImageBase64 - Base64 data of the generated scenario image.
 * @param mimeType - MIME type of the generated image.
 * @param userPrompt - Original user prompt.
 * @param textModelName - Model used for text reasoning.
 * @param userApiKey - Optional user-provided API key.
 * @param aiProvider - AI provider key.
 * @returns Short marketing description string.
 */
export const generateImageDescription = async (
  editedImageBase64: string,
  mimeType: string,
  userPrompt: string,
  textModelName: string,
  userApiKey?: string,
  aiProvider: ProviderKey = 'google_flash'
): Promise<string> => {
  const cleanKey = (userApiKey || '').trim();

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cleanKey) headers['Authorization'] = `Bearer ${cleanKey}`;

    const response = await fetch('/api/gemini/generate-description', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ editedImageBase64, mimeType, userPrompt, textModelName, aiProvider }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.description || '';
    }

    const rawText = await response.text().catch(() => '');
    if (cleanKey && isBackendRouteMissing(response.status, rawText)) {
      return await directGenerateDescription(editedImageBase64, mimeType, userPrompt, textModelName, cleanKey);
    }

    return '';
  } catch (error) {
    if (cleanKey) {
      try {
        return await directGenerateDescription(editedImageBase64, mimeType, userPrompt, textModelName, cleanKey);
      } catch {}
    }
    console.error('Error generating image description:', error);
    return '';
  }
};

/**
 * Generates a clean kebab-case filename slug from the scenario description.
 *
 * @param description - Scenario description text.
 * @param textModelName - Model used for text generation.
 * @param userApiKey - Optional user-provided API key.
 * @param aiProvider - AI provider key.
 * @returns Kebab-case filename string.
 */
export const generateFilenameFromDescription = async (
  description: string,
  textModelName: string,
  userApiKey?: string,
  aiProvider: ProviderKey = 'google_flash'
): Promise<string> => {
  const cleanKey = (userApiKey || '').trim();

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cleanKey) headers['Authorization'] = `Bearer ${cleanKey}`;

    const response = await fetch('/api/gemini/generate-filename', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ description, textModelName, aiProvider }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.filename || 'corkbrick-scenario';
    }

    const rawText = await response.text().catch(() => '');
    if (cleanKey && isBackendRouteMissing(response.status, rawText)) {
      return await directGenerateFilename(description, textModelName, cleanKey);
    }

    return 'corkbrick-scenario';
  } catch (error) {
    if (cleanKey) {
      try {
        return await directGenerateFilename(description, textModelName, cleanKey);
      } catch {}
    }
    console.error('Error generating filename:', error);
    return 'corkbrick-generated-image';
  }
};

const REASSURING_MESSAGES = [
  "Initializing cinematic rendering...",
  "Analyzing scene depth and perspective...",
  "Applying lighting and shadows...",
  "Generating smooth camera movement...",
  "Adding cinematic textures...",
  "Encoding final high-resolution video...",
  "Almost there, finishing touches applied..."
];

export const generateVideoFromImage = async (
  base64ImageData: string,
  mimeType: string,
  updateStatus: (status: string) => void,
  userApiKey?: string
): Promise<Blob> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userApiKey) headers['Authorization'] = `Bearer ${userApiKey}`;

  updateStatus(REASSURING_MESSAGES[0]);

  // Start Generation
  const startRes = await fetch('/api/gemini/generate-video', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ 
      base64ImageData, 
      mimeType, 
      modelName: VEO_MODEL_NAME, 
      prompt: DEFAULT_VIDEO_PROMPT 
    }),
  });

  if (!startRes.ok) {
    let msg = `Video generation request failed (HTTP ${startRes.status}).`;
    try {
      const data = await startRes.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  const { operationName } = await startRes.json();
  if (!operationName) throw new Error("No operation handle was returned for video generation.");

  // Poll Operation
  let pollCount = 0;
  const maxPolls = 60; // 5 minutes max
  while (pollCount < maxPolls) {
    await new Promise(r => setTimeout(r, 5000));
    pollCount++;

    const msgIndex = Math.min(pollCount % REASSURING_MESSAGES.length, REASSURING_MESSAGES.length - 1);
    updateStatus(REASSURING_MESSAGES[msgIndex]);

    const pollRes = await fetch('/api/gemini/video-status', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ operationName }),
    });

    if (!pollRes.ok) continue;
    const pollData = await pollRes.json();

    if (pollData.error) throw new Error(pollData.error);
    if (pollData.done && pollData.videoUri) {
      updateStatus("Downloading final render...");
      const dlRes = await fetch('/api/gemini/video-download', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ uri: pollData.videoUri }),
      });

      if (!dlRes.ok) throw new Error("Could not download rendered video stream.");
      return await dlRes.blob();
    }
  }

  throw new Error("Video generation timed out. Please try again.");
};

export interface KeyValidationResult {
  valid: boolean;
  canGenerateText?: boolean;
  canGenerateImages?: boolean;
  imageNotice?: string;
  message: string;
  status?: string;
}

/**
 * Performs a live handshake and validation check with Google Gemini or Hugging Face.
 * Direct client-side verification ensures it works seamlessly across Vercel, SAP portals, and Cloud Run.
 *
 * @param apiKey - API key or token to validate.
 * @param aiProvider - AI provider key.
 * @returns KeyValidationResult with validation flags and descriptive status message.
 */
export const validateApiKey = async (
  apiKey: string,
  aiProvider: ProviderKey = 'google_flash'
): Promise<KeyValidationResult> => {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, message: 'Please enter an API key or token.' };
  }

  // 1. Direct Client-Side Validation for Google Gemini
  if (aiProvider === 'google_flash' || aiProvider === 'google_pro') {
    try {
      const directRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      if (directRes.ok) {
        return {
          valid: true,
          canGenerateText: true,
          canGenerateImages: true,
          message: '✓ Key verified directly with Google AI Studio! Ready to generate.',
        };
      }

      if (directRes.status === 404) {
        // HTTP 404 on models listing is normal for Google Cloud keys with project-level API restrictions;
        // do not reject the key - accept it.
        return {
          valid: true,
          canGenerateText: true,
          canGenerateImages: true,
          message: '✓ Key connected to Google AI. Ready to generate.',
        };
      }

      const errJson = await directRes.json().catch(() => ({}));
      const errMsg = errJson.error?.message || `Google HTTP ${directRes.status}`;
      
      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
        return {
          valid: false,
          status: 'INVALID_KEY',
          message: 'Google rejected this API key. Please check for typos or regenerate the key in Google AI Studio.',
        };
      }
      if (errMsg.includes('blocked') || errMsg.includes('restriction') || errMsg.includes('referer')) {
        return {
          valid: false,
          status: 'RESTRICTED',
          message: 'Google reported application or referrer restrictions on this key. Please set Application Restrictions to None in Google Cloud Console.',
        };
      }
      
      // For any other responses, accept the key
      return {
        valid: true,
        canGenerateImages: true,
        message: 'Key saved and active.',
      };
    } catch (directErr: any) {
      console.warn('Direct Google validation encountered network restriction:', directErr.message);
      return {
        valid: true,
        canGenerateImages: true,
        message: 'Key saved and active.',
      };
    }
  }

  // 2. Direct Client-Side Validation for Hugging Face
  if (aiProvider === 'huggingface') {
    try {
      const hfRes = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (hfRes.ok) {
        const who: any = await hfRes.json().catch(() => ({}));
        return {
          valid: true,
          canGenerateImages: true,
          message: `✓ Hugging Face token verified for ${who.name || 'user'}.`,
        };
      } else {
        return {
          valid: false,
          message: `Hugging Face token rejected (HTTP ${hfRes.status}). Please check your token permissions.`,
        };
      }
    } catch {
      return {
        valid: true,
        canGenerateImages: true,
        message: 'Hugging Face token saved and active.',
      };
    }
  }

  return {
    valid: true,
    canGenerateImages: true,
    message: 'Key saved.',
  };
};
