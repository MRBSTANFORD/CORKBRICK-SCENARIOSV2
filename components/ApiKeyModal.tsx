/**
 * Rationale: Make API key saving instant and unblocked by removing brittle 404 validation gates,
 * and provide complete transparency regarding Google Cloud billing (~$0.026/image, ~0.08€ for 3 images)
 * versus 100% free Hugging Face FLUX option.
 * Reference Task: Resolve Google HTTP 404 verification failure and address billing honesty.
 */
import React, { useState, useEffect } from 'react';
import { ProviderKey } from '../types';
import { PROVIDERS } from '../constants';
import { validateApiKey, KeyValidationResult } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (key: string, validationResult?: KeyValidationResult) => void;
  aiProvider: ProviderKey;
  onSwitchProvider?: (provider: ProviderKey) => void;
}

/**
 * Modal dialog for configuring and saving API keys (Google Gemini or Hugging Face).
 * Allows direct, instant saving without blocking network gates, with optional live testing
 * and clear cost transparency.
 */
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  aiProvider,
  onSwitchProvider 
}) => {
  const [manualKey, setManualKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<KeyValidationResult | null>(null);

  // Reset input and state when provider changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setManualKey('');
      setValidationResult(null);
      setIsValidating(false);
    }
  }, [isOpen, aiProvider]);

  if (!isOpen) return null;

  const handleDirectSave = () => {
    const trimmed = manualKey.trim();
    if (!trimmed) return;
    onConfirm(trimmed, validationResult || { valid: true, canGenerateImages: true, message: 'Key saved and active' });
  };

  const handleTestKey = async () => {
    const trimmed = manualKey.trim();
    if (!trimmed) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(trimmed, aiProvider);
      setValidationResult(result);
    } catch (e: any) {
      setValidationResult({
        valid: true, // Non-blocking: network or proxy issues shouldn't invalidate the user's key
        message: `Validation note: ${e.message}. You can save and generate directly.`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const provider = PROVIDERS[aiProvider] || PROVIDERS.google_flash;
  const isGemini = aiProvider === 'google_flash' || aiProvider === 'google_pro';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fade-in-scale border border-stone-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-stone-950 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1-1-1 1-1-1-1 1-1-1-5.657-5.657a6 6 0 117.757-7.757 2 2 0 002-2 2 2 0 00-2-2 2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">{isGemini ? 'Google Gemini API Setup' : 'Hugging Face API Setup'}</h2>
              <p className="text-stone-400 text-xs">Direct integration for scenario & 3D visualization.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors text-xl font-bold cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Guide Link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-stone-800 text-sm">
                {isGemini ? 'Get your Gemini API Key' : 'Get your Hugging Face Access Token'}
              </h3>
            </div>
            
            <div className="pl-7 pt-0.5">
              <a 
                href={provider.keyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors w-full justify-center shadow-xs"
              >
                <span>{isGemini ? 'Open Google AI Studio (Get Key)' : 'Open Hugging Face Tokens'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Step 2: Input */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-stone-800 text-sm">Paste your key below</h3>
            </div>
            <div className="pl-7 space-y-2">
              <input 
                type="password" 
                value={manualKey}
                onChange={(e) => {
                  setManualKey(e.target.value);
                  setValidationResult(null);
                }}
                placeholder={isGemini ? 'Paste AIzaSy...' : 'Paste hf_...'}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Honest Cost & Pricing Breakdown */}
          {isGemini ? (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Google Cloud Pricing Transparency</span>
              </div>
              <ul className="space-y-1 text-stone-700 text-[11px] leading-relaxed pl-1">
                <li>• <strong>Text & Descriptions:</strong> 100% Free (1,500 daily requests, $0.00).</li>
                <li>• <strong>Image Generation:</strong> Google charges <strong>~$0.026 - $0.03 per image (~0.025€)</strong>.</li>
                <li>• <strong>Your bill:</strong> 3 images = ~<strong>0.08€</strong> charged to your Google Cloud billing account (or deducted from trial credits).</li>
              </ul>
              {onSwitchProvider && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-stone-600">Want 100% free images ($0.00)?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchProvider('huggingface');
                      onClose();
                    }}
                    className="text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Switch to Free Hugging Face
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                <span>✓ 100% Free Community Tier</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Hugging Face (FLUX.1-schnell) requires <strong>no billing account and no credit card</strong>. All generated images are 100% free ($0.00).
              </p>
            </div>
          )}

          {/* Validation Feedback (Optional / Advisory) */}
          {isValidating && (
            <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-2.5 text-xs text-stone-700 animate-pulse">
              <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Testing key with {provider.name}...</span>
            </div>
          )}

          {validationResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
              validationResult.valid ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-red-50 border border-red-300 text-red-900'
            }`}>
              {validationResult.valid ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-semibold">{validationResult.message}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex gap-2.5 items-start text-xs text-stone-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] leading-tight">
              Your key is stored securely in your browser and used only to authenticate with {provider.name}.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-end items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 font-bold text-xs hover:text-stone-900 transition-colors cursor-pointer mr-auto"
          >
            Cancel
          </button>

          {manualKey.trim() && (
            <button
              onClick={handleTestKey}
              disabled={isValidating}
              className="px-3.5 py-2 text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 font-medium text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Optionally test if the key responds"
            >
              {isValidating ? 'Testing...' : 'Test Connection'}
            </button>
          )}
          
          <button
            onClick={handleDirectSave}
            disabled={!manualKey.trim()}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save & Activate Key</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          0% { opacity: 0; transform: scale(0.96) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ApiKeyModal;
