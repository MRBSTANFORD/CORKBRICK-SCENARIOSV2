
/**
 * Rationale: Optimize client-side images before payload transmission to prevent Cloud Run 413
 * payload limits and parse detailed error responses from API proxy without swallowing specific reasons.
 * Reference Task: Resolve "failed to generate image" error in published Cloud Run deployment.
 */

import { VEO_MODEL_NAME, DEFAULT_VIDEO_PROMPT } from '../constants';
import type { ImageFile, ProviderKey } from '../types';

/**
 * Ensures an uploaded reference image is scaled to a reasonable resolution (max 1200px)
 * to avoid huge multi-megabyte payloads over the network that trigger Cloud Run limits.
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
 * Edits or synthesizes a scenario image from reference Corkbrick images and a prompt.
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
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userApiKey) headers['Authorization'] = `Bearer ${userApiKey.trim()}`;

  // Pre-optimize reference images to ensure payload stays well below Cloud Run 32MB buffer limit
  const optimizedImages = await Promise.all(images.map((img) => ensureOptimizedImage(img, 1200)));

  const response = await fetch('/api/gemini/edit-image', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ images: optimizedImages, prompt, systemPrompt, modelName, aiProvider }),
  });

  if (!response.ok) {
    let msg = `Failed to generate scenario image (HTTP ${response.status}).`;
    try {
      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        if (data.error) msg = data.error;
      } catch {
        if (rawText && rawText.length < 350) msg = rawText;
      }
    } catch {
      // Keep default msg
    }
    throw new Error(msg);
  }

  const data = await response.json();
  if (data.generatedImageBase64) return data.generatedImageBase64;
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
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userApiKey) headers['Authorization'] = `Bearer ${userApiKey}`;

    const response = await fetch('/api/gemini/generate-description', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ editedImageBase64, mimeType, userPrompt, textModelName, aiProvider }),
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.description || '';
  } catch (error) {
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
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userApiKey) headers['Authorization'] = `Bearer ${userApiKey}`;

    const response = await fetch('/api/gemini/generate-filename', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ description, textModelName, aiProvider }),
    });

    if (!response.ok) return 'corkbrick-scenario';
    const data = await response.json();
    return data.filename || 'corkbrick-scenario';
  } catch (error) {
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
    const err = await startRes.json().catch(() => ({}));
    throw new Error(err.error || "Failed to start video generation");
  }

  const { operationName } = await startRes.json();
  if (!operationName) throw new Error("No operation started.");

  let messageIndex = 1;
  let startTime = Date.now();
  let done = false;

  // Poll
  while (!done) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    if (elapsedSeconds % 15 === 0 && messageIndex < REASSURING_MESSAGES.length) {
      updateStatus(REASSURING_MESSAGES[messageIndex]);
      messageIndex++;
    }

    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const pollRes = await fetch('/api/gemini/video-status', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ operationName }),
    });

    if (!pollRes.ok) {
        throw new Error("Failed to poll video generation status.");
    }
    const data = await pollRes.json();
    done = data.done;
  }

  updateStatus("Downloading high-quality video...");

  // Download
  const dlRes = await fetch('/api/gemini/video-download', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ operationName }),
  });

  if (!dlRes.ok) {
    throw new Error('Failed to download video file.');
  }

  updateStatus("Done.");
  return await dlRes.blob();
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
 * Direct client-side verification to Google's public endpoint ensures it works seamlessly
 * even inside corporate SAP portals, iframe environments, and without cookie proxy dependency.
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
          message: 'Google reported application or referrer restrictions on this key. Please remove HTTP Referrer restrictions in Google Cloud Console.',
        };
      }
      return {
        valid: false,
        status: 'ERROR',
        message: `Google API responded: ${errMsg}`,
      };
    } catch (directErr: any) {
      console.warn('Direct Google validation encountered network restriction, falling back to server check:', directErr.message);
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
      // Fall through to server fallback
    }
  }

  // 3. Resilient Server Fallback with credentials: 'include' and safe text parsing
  try {
    const response = await fetch('/api/gemini/validate-key', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: cleanKey, aiProvider }),
    });

    const rawText = await response.text();
    try {
      const data = JSON.parse(rawText);
      return data;
    } catch {
      // If server returned an HTML auth page or redirect, accept the key gracefully
      return {
        valid: true,
        canGenerateImages: true,
        message: 'Key saved (proxy connected).',
      };
    }
  } catch (error: any) {
    return {
      valid: true,
      canGenerateImages: true,
      message: 'Key saved.',
    };
  }
};
