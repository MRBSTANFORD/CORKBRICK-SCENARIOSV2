
/**
 * Rationale: Streamline API key setup to make configuring Google Gemini and Hugging Face
 * effortless and transparent for any user.
 * Reference Task: Make API setting very easy and straightforward for Gemini.
 */
/**
 * Rationale: Implement live API key handshake and verification so users receive immediate,
 * actionable diagnostics (valid, invalid key, referrer restrictions, or billing requirement)
 * rather than assuming the key is green simply because text was entered.
 * Reference Task: Implement real API key validation and explain dev vs published differences.
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
 * Modal dialog for configuring and actively validating Gemini API Keys or Hugging Face tokens.
 * Performs a live test against the AI provider to verify that image and text capabilities are functioning.
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

  const handleVerifyAndSubmit = async () => {
    const trimmed = manualKey.trim();
    if (!trimmed) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(trimmed, aiProvider);
      setValidationResult(result);

      if (result.valid && result.canGenerateImages) {
        // Successful verification! Auto-confirm after brief confirmation delay
        setTimeout(() => {
          onConfirm(trimmed, result);
        }, 600);
      }
    } catch (e: any) {
      setValidationResult({
        valid: false,
        message: `Validation request error: ${e.message}`,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleForceSave = () => {
    const trimmed = manualKey.trim();
    if (trimmed) {
      onConfirm(trimmed, validationResult || undefined);
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
        <div className="bg-stone-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-stone-950 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1-1-1 1-1-1-1 1-1-1-5.657-5.657a6 6 0 117.757-7.757 2 2 0 002-2 2 2 0 00-2-2 2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">{isGemini ? 'Google Gemini API Setup' : 'Hugging Face API Setup'}</h2>
              <p className="text-stone-400 text-xs">Live verified integration for scenario generation.</p>
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
                {isGemini ? 'Get your free Gemini API key' : 'Get your Hugging Face Access Token'}
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
            <div className="pl-7">
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
                disabled={isValidating}
              />
            </div>
          </div>

          {/* Live Validation Feedback */}
          {isValidating && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 animate-pulse">
              <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold">Testing key live against {provider.name}...</span>
            </div>
          )}

          {validationResult && validationResult.valid && validationResult.canGenerateImages && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-bold">{validationResult.message}</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">Activating scenario generation...</p>
              </div>
            </div>
          )}

          {validationResult && validationResult.valid && !validationResult.canGenerateImages && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-[11px] leading-relaxed">
                  <p className="font-bold text-amber-950">Notice: Image Model Billing Limit (limit: 0)</p>
                  <p className="mt-0.5 text-amber-900">{validationResult.imageNotice || validationResult.message}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                {onSwitchProvider && (
                  <button
                    onClick={() => {
                      onSwitchProvider('huggingface');
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 cursor-pointer"
                  >
                    Switch to Free Hugging Face
                  </button>
                )}
                <button
                  onClick={handleForceSave}
                  className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 font-semibold rounded-lg text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Save Anyway
                </button>
              </div>
            </div>
          )}

          {validationResult && !validationResult.valid && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 space-y-2">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-bold text-red-950">Key Verification Failed</span>
                  <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">{validationResult.message}</p>
                </div>
              </div>
              <div className="text-[10px] text-red-700 bg-red-100/60 p-2 rounded-lg">
                💡 <strong>Tip:</strong> If you restricted your key to HTTP Referrers (e.g. <code>localhost</code> or a specific website) in Google Cloud Console, Google will block server-side requests. Set Application Restrictions to <em>None</em> for backend API calls.
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex gap-2.5 items-start text-xs text-stone-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] leading-tight">
              Your key is stored securely in your browser and used only to communicate directly with {provider.name}.
            </p>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 font-bold text-xs hover:text-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleVerifyAndSubmit}
            disabled={!manualKey.trim() || isValidating}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying with {provider.name}...</span>
              </>
            ) : (
              <span>Verify & Save Key</span>
            )}
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

