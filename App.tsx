
/**
 * Rationale: Set default AI provider to Google Gemini ('google_flash') and simplify provider
 * options to Gemini and Hugging Face, eliminating deprecated endpoints and rate limits.
 * Reference Task: Resolve "Free experimental endpoint limits reached" error.
 */
import React, { useState, useCallback, useEffect } from 'react';
import type { ImageFile, SavedScenario, ProviderKey } from './types';
import { Header } from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ConfigPanel from './components/ConfigPanel';
import SavedScenarios from './components/SavedScenarios';
import SaveScenarioModal from './components/SaveScenarioModal';
import EditScenarioModal from './components/EditScenarioModal';
import Toast from './components/Toast';
import ApiKeyModal from './components/ApiKeyModal';
import VideoLoadingSpinner from './components/VideoLoadingSpinner';
import VideoPlayer from './components/VideoPlayer';
import ImageEditorModal from './components/ImageEditorModal';
import { editImageWithPrompt, generateImageDescription, generateVideoFromImage, generateFilenameFromDescription } from './services/geminiService';
import { SAMPLE_PROMPTS_STRUCTURED, DEFAULT_SYSTEM_PROMPT, PROVIDERS } from './constants';
import SamplePrompts from './components/SamplePrompts';
import InfoPanel from './components/InfoPanel';

const LOCAL_STORAGE_KEY = 'corkbrick-saved-scenarios';
const SESSION_API_KEY = 'corkbrick-user-api-key';

// .. compressImageForStorage ..
const compressImageForStorage = (dataUrl: string, maxSize = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(dataUrl);
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

function App() {
  const [originalImages, setOriginalImages] = useState<ImageFile[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [aiProvider, setAiProvider] = useState<ProviderKey>('google_flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  
  // Video generation state
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // API Key Management
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<'image' | 'video' | null>(null);

  const handleProviderChange = useCallback((provider: ProviderKey) => {
    setAiProvider(provider);
    if (PROVIDERS[provider]?.requiresKey && !apiKeys[provider]) {
        setIsApiKeyModalOpen(true);
    }
  }, [apiKeys]);

  // Image editing state
  const [imageToEdit, setImageToEdit] = useState<ImageFile | null>(null);

  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed;
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading scenarios from localStorage:", error);
      return [];
    }
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<SavedScenario | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load API Keys from session storage on mount
  useEffect(() => {
    const loadedKeys: Record<string, string> = {};
    Object.keys(PROVIDERS).forEach(providerKey => {
       const stored = sessionStorage.getItem(`${SESSION_API_KEY}-${providerKey}`);
       if (stored) loadedKeys[providerKey] = stored;
    });
    // Fallback for legacy key
    const legacyKey = sessionStorage.getItem(SESSION_API_KEY);
    if (legacyKey && !loadedKeys['google_flash']) {
       loadedKeys['google_flash'] = legacyKey;
       loadedKeys['google_pro'] = legacyKey;
    }
    setApiKeys(loadedKeys);
  }, []);

  useEffect(() => {
    const saveScenariosToLocalStorage = async () => {
      if (savedScenarios.length === 0) {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }
      try {
        const compressedScenarios = await Promise.all(
          savedScenarios.map(async (scenario) => {
            const scenarioCopy: SavedScenario = JSON.parse(JSON.stringify(scenario));
            scenarioCopy.editedImage = await compressImageForStorage(scenario.editedImage);
            scenarioCopy.originalImages = await Promise.all(
              scenario.originalImages.map(async (image) => ({
                ...image,
                dataUrl: await compressImageForStorage(image.dataUrl),
              }))
            );
            return scenarioCopy;
          })
        );
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(compressedScenarios));
      } catch (error) {
        console.error("Error saving scenarios to localStorage:", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          alert("Could not save scenarios to browser storage: Quota exceeded. Please save to file.");
        }
      }
    };
    saveScenariosToLocalStorage();
  }, [savedScenarios]);

  const handleImageAdd = useCallback((imageFile: ImageFile) => {
    setOriginalImages(prev => [...prev, imageFile]);
    setEditedImage(null);
    setDescription(null);
    setPrompt('');
    setError(null);
    setGeneratedVideoUrl(null);
    setVideoError(null);
    setGeneratedFilename(null);
  }, []);

  const handleFileSelect = useCallback((imageFile: ImageFile) => {
    if (originalImages.length < 5) {
      setImageToEdit(imageFile);
    } else {
      setToastMessage("You can upload a maximum of 5 images.");
    }
  }, [originalImages.length]);

  const handleEditorSave = (editedImage: ImageFile) => {
    handleImageAdd(editedImage);
    setImageToEdit(null);
  };

  const handleEditorClose = () => {
    setImageToEdit(null);
  };

  const handleImageRemove = (indexToRemove: number) => {
    setOriginalImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerate = useCallback(async (forceUseKey?: string) => {
    if (originalImages.length === 0) {
      setError("Please upload at least one image first.");
      return;
    }
    if (!prompt) {
      setError("Please enter a prompt to describe the changes.");
      return;
    }

    const currentConfig = Object.values(PROVIDERS).find((p) => p.id === aiProvider) || PROVIDERS.google_flash;
    const activeKey = forceUseKey || apiKeys[aiProvider] || '';

    // STRICT CHECK: If no manual key, stop and ask.
    if (currentConfig.requiresKey && !activeKey) {
        setPendingAction('image');
        setIsApiKeyModalOpen(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setDescription(null);
    setGeneratedFilename(null);
    setGeneratedVideoUrl(null);
    setVideoError(null);

    try {
      const editedImageResult = await editImageWithPrompt(
          originalImages, 
          prompt, 
          systemPrompt,
          currentConfig.models.image,
          activeKey,
          aiProvider
      );
      setEditedImage(editedImageResult);

      try {
        const mimeType = editedImageResult.substring(editedImageResult.indexOf(':') + 1, editedImageResult.indexOf(';'));
        const descriptionResult = await generateImageDescription(
            editedImageResult, 
            mimeType, 
            prompt,
            currentConfig.models.text,
            activeKey,
            aiProvider
        );
        setDescription(descriptionResult);

        if (descriptionResult) {
            try {
                const filenameResult = await generateFilenameFromDescription(descriptionResult, currentConfig.models.text, activeKey, aiProvider);
                setGeneratedFilename(filenameResult);
            } catch (fileNameError) {
                console.warn("Could not generate filename:", fileNameError);
                setGeneratedFilename('corkbrick-scenario'); 
            }
        }

      } catch (descError) {
        console.warn("Could not generate image description:", descError);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (errorMessage.includes("API Key") || errorMessage.includes("403") || errorMessage.includes("token")) {
         setError(`Validation failed for ${currentConfig.name} key. Please provide a valid key.`);
         setPendingAction('image');
         setIsApiKeyModalOpen(true);
      } else {
         setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, prompt, systemPrompt, apiKeys, aiProvider]);

  const handleGenerateVideo = useCallback(async (forceUseKey?: string) => {
    if (!editedImage) {
      setVideoError("Please generate an image first.");
      return;
    }
    
    // For video generation, we want the currently selected aiProvider, but the backend requires a Gemini key for video.
    // If the provider is 'google_flash' or 'google_pro', we use that key. Otherwise we look for 'google_flash'.
    let videoProviderKey = aiProvider;
    if (aiProvider !== 'google_flash' && aiProvider !== 'google_pro') {
       videoProviderKey = 'google_flash';
    }
    const activeKey = forceUseKey || apiKeys[videoProviderKey] || '';

    if (!activeKey) {
        setPendingAction('video');
        setAiProvider(videoProviderKey); // Set provider to google so they add the correct key
        setIsApiKeyModalOpen(true);
        return;
    }

    setIsVideoLoading(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
        const mimeType = editedImage.substring(editedImage.indexOf(':') + 1, editedImage.indexOf(';'));
        const videoBlob = await generateVideoFromImage(editedImage, mimeType, setVideoGenerationStatus, activeKey);
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideoUrl(videoUrl);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during video generation.";
        if (errorMessage.includes("API Key") || errorMessage.includes("403")) {
            setVideoError("API Key validation failed. Please provide a valid key.");
            setPendingAction('video');
            setIsApiKeyModalOpen(true);
        } else {
            setVideoError(errorMessage);
        }
    } finally {
        setIsVideoLoading(false);
    }

  }, [editedImage, apiKeys, aiProvider]);
  
  const handleKeyConfirmed = (key: string) => {
    setIsApiKeyModalOpen(false);
    if (key) {
        setApiKeys(prev => ({ ...prev, [aiProvider]: key }));
        sessionStorage.setItem(`${SESSION_API_KEY}-${aiProvider}`, key);
        setToastMessage(`API Key saved for ${PROVIDERS[aiProvider]?.name || 'provider'}.`);
    }
    
    if (pendingAction === 'image') {
        handleGenerate(key); 
    } else if (pendingAction === 'video') {
        handleGenerateVideo(key);
    }
    setPendingAction(null);
  };

  const handleClearKey = () => {
    const providerName = PROVIDERS[aiProvider]?.name || 'the current provider';
    if (window.confirm(`Do you want to clear your saved API key for ${providerName}?`)) {
        setApiKeys(prev => {
           const newKeys = { ...prev };
           delete newKeys[aiProvider];
           return newKeys;
        });
        sessionStorage.removeItem(`${SESSION_API_KEY}-${aiProvider}`);
        setToastMessage(`API Key for ${providerName} removed.`);
    }
  };

  const selectSamplePrompt = (sample: string) => {
    setPrompt(sample);
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    const mimeType = editedImage.substring(editedImage.indexOf(':') + 1, editedImage.indexOf(';'));
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `${generatedFilename || 'corkbrick-scenario'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveScenario = () => {
    if (originalImages.length === 0 || !editedImage || !prompt) {
      alert("Cannot save scenario. Make sure you have original images, a generated image, and a prompt.");
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveScenario = (name: string) => {
    if (originalImages.length === 0 || !editedImage || !prompt) return;

    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name,
      originalImages,
      editedImage,
      prompt,
      description: description || '',
      filename: generatedFilename || 'corkbrick-scenario',
    };

    try {
      const scenarioJson = JSON.stringify(newScenario, null, 2);
      const blob = new Blob([scenarioJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `scenario_${savedScenarios.length + 1}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch(err) {
        console.error("Failed to create download file for scenario.", err);
    }

    const updatedScenarios = [...savedScenarios, newScenario];
    setSavedScenarios(updatedScenarios);
    setIsSaveModalOpen(false);
    setToastMessage("Scenario saved to list and downloaded!");
  };
  
  const handleLoadScenario = (id: string) => {
    const scenarioToLoad = savedScenarios.find(s => s.id === id);
    if (scenarioToLoad) {
      setOriginalImages(scenarioToLoad.originalImages || []);
      setEditedImage(scenarioToLoad.editedImage);
      setPrompt(scenarioToLoad.prompt);
      setDescription(scenarioToLoad.description || null);
      setGeneratedFilename(scenarioToLoad.filename || null);
      setError(null);
      setIsLoading(false);
      setGeneratedVideoUrl(null);
      setVideoError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleEditScenario = (id: string) => {
    const scenario = savedScenarios.find(s => s.id === id);
    if (scenario) {
      setScenarioToEdit(scenario);
      setIsEditModalOpen(true);
    }
  };
  
  const handleConfirmEditScenario = ({ name, prompt, description }: { name: string; prompt: string; description: string }) => {
    if (!scenarioToEdit) return;

    const updatedScenarios = savedScenarios.map(s =>
      s.id === scenarioToEdit.id ? { ...s, name, prompt, description } : s
    );

    setSavedScenarios(updatedScenarios);
    setIsEditModalOpen(false);
    setScenarioToEdit(null);
    setToastMessage("Scenario updated successfully!");
  };

  const handleDeleteScenario = (id: string) => {
    if (window.confirm("Are you sure you want to delete this scenario?")) {
      const updatedScenarios = savedScenarios.filter(s => s.id !== id);
      setSavedScenarios(updatedScenarios);
      setToastMessage("Scenario deleted.");
    }
  };

  const handleLoadScenariosFromFile = (importedScenarios: SavedScenario[]) => {
    const scenariosById = new Map(savedScenarios.map(s => [s.id, s]));
    importedScenarios.forEach(s => scenariosById.set(s.id, s));
    
    setSavedScenarios(Array.from(scenariosById.values()));
    setToastMessage(`${importedScenarios.length} scenario(s) loaded successfully.`);
  };
  
  return (
    <>
      <div className="min-h-screen bg-stone-100 font-sans text-stone-800">
        <Header 
            currentProvider={aiProvider} 
            onProviderChange={handleProviderChange} 
            hasKey={!!apiKeys[aiProvider]}
            onManageKey={() => setIsApiKeyModalOpen(true)}
            onClearKey={handleClearKey}
        />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <InfoPanel />
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200">
                <h2 className="text-lg font-semibold text-stone-700 mb-1">1. Upload Corkbrick Images (1-5)</h2>
                <p className="text-sm text-stone-500 mb-4">
                  Go to the <a href="https://corkbrick.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-semibold">Corkbrick website</a>, find solutions, and upload up to 5 images. You can paste, drag, or click to upload. The AI will combine them into one scene.
                </p>
                {originalImages.length < 5 && <ImageUploader onFileSelected={handleFileSelect} />}
                {originalImages.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-stone-600 mb-2">Uploaded Images ({originalImages.length}/5):</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      {originalImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img src={image.dataUrl} alt={`Uploaded image ${index + 1}`} className="w-full h-full rounded-md object-cover border border-stone-200" />
                          <button 
                            onClick={() => handleImageRemove(index)} 
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0 w-6 h-6 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-md"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200">
                <h2 className="text-lg font-semibold text-stone-700 mb-1">2. Describe the New Scenario</h2>
                <p className="text-sm text-stone-500 mb-4">Tell the AI what environment or style you want to see for the combined solutions.</p>
                <textarea
                  className="w-full p-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  rows={4}
                  placeholder="Describe the style, decoration & location. E.g., 'A cozy Scandinavian living room with many plants and a large window overlooking a snowy forest.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={originalImages.length === 0 || isLoading}
                />
                <div className="mt-2">
                  <p className="text-xs text-stone-500 mb-2">Or try a sample prompt:</p>
                  <SamplePrompts 
                    prompts={SAMPLE_PROMPTS_STRUCTURED} 
                    onSelect={selectSamplePrompt}
                    disabled={originalImages.length === 0 || isLoading}
                  />
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={originalImages.length === 0 || !prompt || isLoading}
                className="w-full flex items-center justify-center bg-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : "Generate New Scenario"}
              </button>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            </div>

            <div className="w-full">
              {isLoading && <LoadingSpinner />}
              
              {!isLoading && editedImage && (
                 <div className="space-y-6">
                    <div className="bg-white p-3 rounded-lg shadow-md border border-stone-200 relative">
                        <h3 className="text-sm font-semibold text-stone-600 mb-2">Generated Scenario</h3>
                        <img src={editedImage} alt="Generated Scenario" className="w-full h-auto object-contain rounded-md" />
                         <div className="absolute top-5 right-5 flex flex-col sm:flex-row gap-2 z-10">
                          <button
                            onClick={handleDownload}
                            disabled={isVideoLoading}
                            className="bg-white/90 backdrop-blur-md text-stone-800 font-semibold py-2 px-3 rounded-lg shadow-lg hover:bg-white hover:text-amber-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-stone-200"
                            aria-label="Download generated image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Download</span>
                          </button>
                          <button
                            onClick={handleSaveScenario}
                             disabled={isVideoLoading}
                            className="bg-white/90 backdrop-blur-md text-stone-800 font-semibold py-2 px-3 rounded-lg shadow-lg hover:bg-white hover:text-amber-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-stone-200"
                            aria-label="Save scenario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-3.5-5 3.5V4z" />
                            </svg>
                            <span>Save</span>
                          </button>
                           <button
                              onClick={() => handleGenerateVideo()}
                              disabled={isVideoLoading}
                              className="bg-white/90 backdrop-blur-md text-stone-800 font-semibold py-2 px-3 rounded-lg shadow-lg hover:bg-white hover:text-amber-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-stone-200"
                              aria-label="Generate video from image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                              <span>Generate Video</span>
                            </button>
                        </div>
                    </div>
                    
                    {description && (
                        <div className="bg-white p-4 rounded-lg shadow-md border border-stone-200 animate-fade-in">
                           <h4 className="text-md font-semibold text-stone-700 mb-2">AI-Generated Description</h4>
                           <p className="text-stone-600 italic">"{description}"</p>
                        </div>
                    )}
                    
                    {isVideoLoading && <VideoLoadingSpinner status={videoGenerationStatus} />}
                    {videoError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{videoError}</div>}
                    {generatedVideoUrl && <VideoPlayer src={generatedVideoUrl} />}
                 </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConfigPanel 
                    systemPrompt={systemPrompt} 
                    setSystemPrompt={setSystemPrompt} 
                    isLoading={isLoading} 
                    currentModelName={Object.values(PROVIDERS).find((p) => p.id === aiProvider)?.models.image || ''}
                    aiProvider={aiProvider}
                    setAiProvider={handleProviderChange}
                    apiKeys={apiKeys}
                    onManageKey={() => setIsApiKeyModalOpen(true)}
                />
                <SavedScenarios scenarios={savedScenarios} onLoad={handleLoadScenario} onEdit={handleEditScenario} onDelete={handleDeleteScenario} onLoadFromFile={handleLoadScenariosFromFile} />
            </div>

          </div>
        </main>
      </div>
      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleConfirmSaveScenario}
        suggestedName={generatedFilename}
      />
      <EditScenarioModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleConfirmEditScenario}
        scenario={scenarioToEdit}
      />
      {imageToEdit && (
        <ImageEditorModal
            imageFile={imageToEdit}
            onClose={handleEditorClose}
            onSave={handleEditorSave}
        />
      )}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onConfirm={handleKeyConfirmed}
        aiProvider={aiProvider}
      />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
       <style>{`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
       `}</style>
    </>
  );
}

export default App;
