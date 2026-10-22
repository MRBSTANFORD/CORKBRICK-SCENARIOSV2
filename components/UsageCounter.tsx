/**
 * Rationale: Display accurate, honest cost tracking for both Google Cloud billing (~$0.026/image,
 * e.g. ~0.08€ for 3 images) and Hugging Face (100% free, €0.00) with complete financial transparency.
 * Reference Task: Correct inaccurate $0.00 claims for paid Google Cloud image generation.
 */
import React, { useState } from 'react';
import type { DailyUsage, ProviderKey } from '../types';
import { PROVIDERS } from '../constants';

interface UsageCounterProps {
  dailyUsage: DailyUsage;
  currentProvider: ProviderKey;
  onResetUsage?: () => void;
  onOpenGuide?: () => void;
}

/**
 * AI Credits & Daily Generation Counter component.
 * Displays a compact, transparent badge in the top-right header and an interactive breakdown modal on click.
 *
 * @param dailyUsage - Current day's tracking data (images, videos, text).
 * @param currentProvider - Currently active AI provider.
 * @param onResetUsage - Optional callback to reset today's counter.
 * @param onOpenGuide - Optional callback to jump to the Free Tier guide.
 */
export const UsageCounter: React.FC<UsageCounterProps> = ({
  dailyUsage,
  currentProvider,
  onResetUsage,
  onOpenGuide,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Provider flags
  const isFlash = currentProvider === 'google_flash';
  const isPro = currentProvider === 'google_pro';
  const isGemini = isFlash || isPro;
  const isHuggingFace = currentProvider === 'huggingface';

  // Free daily allowance for Gemini Text/Descriptions
  const flashTextLimit = 1500;
  const remainingTextQuota = Math.max(0, flashTextLimit - dailyUsage.textGenerated);

  // Exact Google Cloud billing rates:
  // Gemini text is $0.00. Image generation (gemini-2.5-flash-image) is ~$0.026 USD per image (~0.025€ - 0.026€).
  // 3 images = ~$0.078 (~0.08€), exactly what users see on their Google Cloud billing console.
  const imageUnitCost = isHuggingFace ? 0 : 0.026;
  const videoUnitCost = 0.15;
  const calculatedCost = (dailyUsage.imagesGenerated * imageUnitCost) + (dailyUsage.videosGenerated * videoUnitCost);

  return (
    <>
      {/* Discreet Header Badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-all text-xs font-medium cursor-pointer shadow-xs"
        title="Click to view AI cost breakdown, daily quotas, and billing details"
        aria-label="View AI usage and credits"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <div className="flex items-center gap-1.5 text-stone-700">
          <span className="font-bold text-stone-900">
            {dailyUsage.imagesGenerated} {dailyUsage.imagesGenerated === 1 ? 'image' : 'images'}
          </span>
          <span className="text-stone-400 hidden lg:inline">•</span>
          
          {/* Display actual honest billing value */}
          {isHuggingFace ? (
            <span className="text-emerald-700 font-semibold hidden lg:inline">
              100% Free (€0.00)
            </span>
          ) : dailyUsage.imagesGenerated === 0 ? (
            <span className="text-stone-500 font-semibold hidden lg:inline">
              €0.00 billed
            </span>
          ) : (
            <span className="text-amber-800 font-bold hidden lg:inline">
              ~€{calculatedCost.toFixed(2)} billed
            </span>
          )}
        </div>

        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border transition-colors ${
          isHuggingFace
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-white text-stone-700 border-stone-200 group-hover:border-amber-400'
        }`}>
          {isHuggingFace ? 'Free' : isFlash ? 'Gemini' : 'Pro'}
        </span>
      </button>

      {/* Detailed Modal on Click */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[120] flex justify-center items-center backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg text-stone-950">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base">Usage & Billing Transparency</h3>
                  <p className="text-xs text-stone-400">Active Provider: {PROVIDERS[currentProvider]?.name || 'AI'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-xl font-bold p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Daily Statistics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-xl font-extrabold text-stone-900">{dailyUsage.imagesGenerated}</span>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">Images Today</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-xl font-extrabold text-stone-900">{dailyUsage.videosGenerated}</span>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">Videos Today</p>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-xl font-extrabold text-stone-900">{dailyUsage.textGenerated}</span>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">Descriptions</p>
                </div>
              </div>

              {/* Cost Breakdown Card */}
              {isGemini ? (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-800 font-semibold">Billed on Google Cloud Today:</span>
                    <span className="text-amber-900 font-extrabold text-base">
                      ~€{calculatedCost.toFixed(2)} <span className="text-xs font-normal text-stone-500">(${calculatedCost.toFixed(2)})</span>
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-stone-700 space-y-1.5 pt-1 border-t border-amber-200/60">
                    <div className="flex justify-between">
                      <span>• Text descriptions & reasoning:</span>
                      <span className="font-semibold text-emerald-700">100% Free (€0.00)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Image generation ({dailyUsage.imagesGenerated} × ~0.026€):</span>
                      <span className="font-semibold text-amber-950">~€{(dailyUsage.imagesGenerated * 0.026).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-stone-600 bg-white/70 p-2.5 rounded-lg border border-amber-200/50 leading-relaxed">
                    ℹ️ <strong>Google Cloud Billing Note:</strong> Google charges ~0.026€ (~$0.026) per image. For example, <strong>3 images = ~0.08€</strong>. If your Google account has active $300 trial credits, Google deducts from those credits; otherwise it is charged to your linked payment card.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-950 font-bold">Total Cost:</span>
                    <span className="text-emerald-700 font-extrabold text-base">€0.00 (100% Free)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Hugging Face FLUX.1-schnell runs on the free community tier. No credit card or billing account is required.
                  </p>
                </div>
              )}

              {/* Free Text Quota Tracker (Gemini) */}
              {isGemini && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-700 font-semibold">
                    <span>Daily Free Description Requests:</span>
                    <span className="font-mono text-stone-900 font-bold">{remainingTextQuota} / {flashTextLimit}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyUsage.textGenerated / flashTextLimit) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-stone-500 text-center">
                    Free text quota resets daily at midnight.
                  </p>
                </div>
              )}

              {/* Status Message */}
              <div className="text-center p-2 text-xs text-stone-600 bg-stone-50 rounded-lg border border-stone-200">
                {dailyUsage.imagesGenerated === 0 && "Ready to design! You haven't generated any images today. 🚀"}
                {dailyUsage.imagesGenerated > 0 && `Created ${dailyUsage.imagesGenerated} Corkbrick scenario ${dailyUsage.imagesGenerated === 1 ? 'image' : 'images'} today.`}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
              {onResetUsage && (
                <button
                  onClick={() => {
                    if (window.confirm('Reset today’s usage counter back to 0?')) {
                      onResetUsage();
                    }
                  }}
                  className="text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
                >
                  Reset Counter
                </button>
              )}
              {onOpenGuide && (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    onOpenGuide();
                  }}
                  className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <span>Pricing & Limits Guide</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
