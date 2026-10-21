
/**
 * Rationale: Streamline AI generation exclusively to Google Gemini and Hugging Face.
 * Eliminates deprecated experimental endpoints (LLM7, Puter, Pixazo) that triggered rate-limit errors.
 * Reference Task: Remove alternatives except Gemini and Hugging Face.
 */

import { VEO_MODEL_NAME, DEFAULT_VIDEO_PROMPT } from '../constants';
import type { ImageFile, ProviderKey } from '../types';

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
  if (userApiKey) headers['Authorization'] = `Bearer ${userApiKey}`;

  const response = await fetch('/api/gemini/edit-image', {
    method: 'POST',
    headers,
    body: JSON.stringify({ images, prompt, systemPrompt, modelName, aiProvider }),
  });

  if (!response.ok) {
    let msg = 'Failed to generate scenario image.';
    try {
      const data = await response.json();
      if (data.error) msg = data.error;
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
    headers,
    body: JSON.stringify({ operationName }),
  });

  if (!dlRes.ok) {
    throw new Error('Failed to download video file.');
  }

  updateStatus("Done.");
  return await dlRes.blob();
};
