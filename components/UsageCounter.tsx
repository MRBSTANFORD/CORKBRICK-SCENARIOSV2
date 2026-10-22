/**
 * Rationale: Discreet, always-visible AI Credits and Daily Usage Counter widget for the top-right header.
 * Displays images produced today, estimated cost ($0.00 under free tier), and remaining daily generation capacity.
 * Reference Task: Add top-right visible AI credits and daily usage counter.
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
 * Displays a compact, unobtrusive badge in the top-right header and an interactive detail modal on click.
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

  // Calculations per provider
  const isFlash = currentProvider === 'google_flash';
  const isPro = currentProvider === 'google_pro';
  const isHuggingFace = currentProvider === 'huggingface';

  // Free daily allowance for Gemini Flash
  const flashDailyLimit = 1500;
  const totalFlashRequestsToday = dailyUsage.imagesGenerated + dailyUsage.textGenerated;
  const remainingFlashRequests = Math.max(0, flashDailyLimit - totalFlashRequestsToday);

  // Estimated standard commercial value (what Google/API normally bills)
  const estImageUnitCost = isPro ? 0.06 : 0.03;
  const estVideoUnitCost = 0.15;
  const estTotalValue = (dailyUsage.imagesGenerated * estImageUnitCost) + (dailyUsage.videosGenerated * estVideoUnitCost);

  // Out of pocket cost to user
  const userOutCost = isHuggingFace ? 0 : 0; // $0 under Free Tier / $300 trial credits

  return (
    <>
      {/* Discreet Header Badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-all text-xs font-medium cursor-pointer shadow-xs"
        title="Click to view AI Credits, daily limits, and cost breakdown"
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
          <span className="text-emerald-700 font-semibold hidden lg:inline">
            $0.00 spent
          </span>
        </div>

        <span className="text-[10px] bg-white border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-mono font-bold group-hover:border-amber-400 transition-colors">
          {isHuggingFace ? 'Free' : isFlash ? `${remainingFlashRequests} left` : 'Pro'}
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
                  <h3 className="font-bold text-base">AI Credits & Daily Usage</h3>
                  <p className="text-xs text-stone-400">Live tracker for {PROVIDERS[currentProvider]?.name || 'AI'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-xl font-bold p-1 rounded-md transition-colors"
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

              {/* Cost & Allowance Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-medium">Out-of-Pocket Cost:</span>
                  <span className="text-emerald-700 font-bold text-base">$0.00</span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Standard API Value:</span>
                  <span className="line-through text-stone-400 font-mono">${estTotalValue.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 leading-relaxed flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {isHuggingFace 
                      ? '100% Free Community Tier (no billing setup needed).' 
                      : 'Covered by Google AI Studio Free Tier & $300 Credits.'}
                  </span>
                </div>
              </div>

              {/* Remaining Quota Progress */}
              {isFlash && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-700 font-semibold">
                    <span>Daily Free Requests Remaining:</span>
                    <span className="font-mono text-amber-700 font-bold">{remainingFlashRequests} / {flashDailyLimit}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totalFlashRequestsToday / flashDailyLimit) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-stone-500 text-center">
                    Resets automatically every day at midnight (local time).
                  </p>
                </div>
              )}

              {/* Fun Status Message */}
              <div className="text-center p-2 text-xs text-stone-600 bg-amber-50/60 rounded-lg border border-amber-200/60">
                {dailyUsage.imagesGenerated === 0 && "Ready to design! You haven't used any daily capacity yet. 🚀"}
                {dailyUsage.imagesGenerated > 0 && dailyUsage.imagesGenerated < 15 && `Great creativity! You still have plenty of free daily generations available today. ✨`}
                {dailyUsage.imagesGenerated >= 15 && `Power designer! You've created ${dailyUsage.imagesGenerated} Corkbrick scenarios today. 🏆`}
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
                  <span>Free Limits Guide</span>
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
