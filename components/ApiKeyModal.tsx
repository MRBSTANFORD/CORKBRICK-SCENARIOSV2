
/**
 * Rationale: Streamline API key setup to make configuring Google Gemini and Hugging Face
 * effortless and transparent for any user.
 * Reference Task: Make API setting very easy and straightforward for Gemini.
 */
import React, { useState, useEffect } from 'react';
import { ProviderKey } from '../types';
import { PROVIDERS } from '../constants';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (key: string) => void;
  aiProvider: ProviderKey;
}

/**
 * Modal dialog for configuring Gemini API Key or Hugging Face token.
 * Provides clear 3-step instructions and a direct link to Google AI Studio.
 */
const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onConfirm, aiProvider }) => {
  const [manualKey, setManualKey] = useState('');

  // Reset input when provider changes or modal opens
  useEffect(() => {
    if (isOpen) setManualKey('');
  }, [isOpen, aiProvider]);

  if (!isOpen) return null;

  const handleManualSubmit = () => {
    if (manualKey.trim()) {
      onConfirm(manualKey.trim());
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
              <p className="text-stone-400 text-xs">Direct integration for instant AI scenario generation.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-stone-800 text-sm">
                {isGemini ? 'Get your free Gemini API key' : 'Get your Hugging Face Access Token'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 pl-7">
              {isGemini
                ? 'Create a free API key in Google AI Studio in less than a minute. No credit card required for standard access.'
                : 'Create a free Hugging Face User Access Token to run open-source models.'}
            </p>
            
            <div className="pl-7 pt-1">
              <a 
                href={provider.keyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors w-full justify-center shadow-sm"
              >
                <span>{isGemini ? 'Open Google AI Studio (Get Key)' : 'Open Hugging Face Tokens'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {isGemini && (
              <div className="text-xs text-stone-600 pl-7 space-y-2 pt-1">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% Free Tier Available ($0 Cost)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    • <strong>1,500 free requests/day</strong> for Gemini Flash reasoning and descriptions.
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    • <strong>$300 free trial credit</strong> from Google Cloud = <strong>~10,000 free image generations</strong> (~$0.03/image).
                  </p>
                  <p className="text-[11px] text-emerald-850">
                    • <strong>Pro-Forma Verification:</strong> Google asks for a billing setup solely to verify human identity against bots. You are <em>not charged</em> within free limits and cards are not auto-billed without explicit consent.
                  </p>
                </div>
                <p className="text-[11px] text-stone-500">
                  Tip: In Google AI Studio, click <strong>"Create API key"</strong>, select your project or create a new one, and copy the key (starts with <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">AIza...</code>).
                </p>
              </div>
            )}
            {!isGemini && (
              <div className="text-xs text-stone-500 pl-7">
                <p className="text-[11px] text-stone-500">
                  Select <strong>"Fine-grained"</strong> and check <strong>"Make calls to the serverless Inference API"</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-stone-800 text-sm">Paste your key below</h3>
            </div>
            <div className="pl-7">
              <input 
                type="password" 
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder={isGemini ? 'Paste AIzaSy...' : 'Paste hf_...'}
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex gap-2.5 items-start">
            <div className="text-emerald-700 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Privacy & Security</h4>
              <p className="text-[11px] text-emerald-800 leading-tight">
                Your key is stored only in your browser's session and used solely to communicate with {provider.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-stone-600 font-bold text-sm hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleManualSubmit}
            disabled={!manualKey.trim()}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Key & Activate
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

