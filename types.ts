
/**
 * Rationale: Simplify AI providers to Google Gemini (Flash & Pro) and Hugging Face,
 * eliminating dead/experimental endpoints that caused rate-limit issues.
 * Reference Task: Remove alternatives except Gemini and Hugging Face.
 */
export interface ImageFile {
  dataUrl: string;
  mimeType: string;
}

export interface SavedPrompt {
  name: string;
  prompt: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  prompt: string;
  originalImages: ImageFile[];
  editedImage: string;
  description?: string; // AI-generated description for the scenario
  filename?: string; // AI-generated filename for the image
}

// Structured sample prompt types
export interface PromptScenario {
  flexibility: string;
  assembly: string;
  sustainability: string;
  urban?: string;
  coastal?: string;
  tranquil?: string;
  historic?: string;
  natural?: string;
  classic?: string;
  modern?: string;
  outdoor?: string;
}

export interface PromptSegment {
  name: string;
  prompts: PromptScenario;
}

export interface PromptCategory {
  name: string;
  segments: PromptSegment[];
}

export type SamplePromptsData = PromptCategory[];

export type ProviderKey = 'google_flash' | 'google_pro' | 'huggingface';

