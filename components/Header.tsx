
/**
 * Rationale: Header with simplified AI provider selector (Google Gemini and Hugging Face only)
 * and straightforward API key management indicator.
 * Reference Task: Remove alternatives except Gemini and Hugging Face.
 */
import React from 'react';
import { PROVIDERS } from '../constants';
import { ProviderKey, DailyUsage } from '../types';
import { UsageCounter } from './UsageCounter';

interface HeaderProps {
  currentProvider: ProviderKey;
  onProviderChange: (mode: ProviderKey) => void;
  hasKey: boolean;
  onManageKey: () => void;
  onClearKey: () => void;
  dailyUsage: DailyUsage;
  onResetUsage?: () => void;
  onOpenGuide?: () => void;
}

/**
 * Top navigation header displaying Corkbrick AI branding, active AI provider selector,
 * quick-access API key status, and live AI Credits & daily usage counter.
 */
export const Header: React.FC<HeaderProps> = ({ 
  currentProvider, 
  onProviderChange, 
  hasKey, 
  onManageKey,
  dailyUsage,
  onResetUsage,
  onOpenGuide
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.95 13.536a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM6.464 14.95a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-800 leading-tight">Corkbrick AI</h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Scenario Generator</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Provider Selector */}
            <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200">
              {(Object.entries(PROVIDERS) as [ProviderKey, typeof PROVIDERS[ProviderKey]][]).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => onProviderChange(key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentProvider === key
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={provider.description}
                >
                  <span>{provider.name}</span>
                  {provider.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      provider.badge === 'Recommended'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {provider.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-stone-200 hidden sm:block"></div>

            {/* Always-Visible AI Credits & Usage Counter */}
            <UsageCounter 
              dailyUsage={dailyUsage}
              currentProvider={currentProvider}
              onResetUsage={onResetUsage}
              onOpenGuide={onOpenGuide}
            />

            <div className="h-6 w-[1px] bg-stone-200 hidden sm:block"></div>

            {/* API Key Status / Setup Button */}
            <button
              onClick={onManageKey}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                hasKey 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
              title={hasKey ? "API Key is set. Click to view or change." : "Set your API key for instant generation."}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1h-2v2H4v-2H2v-2h2v-2l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              <span>{hasKey ? 'Key: Active' : 'Setup Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

