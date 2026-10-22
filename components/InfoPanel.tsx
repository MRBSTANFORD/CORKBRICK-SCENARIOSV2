
/**
 * Rationale: User Guide & Help component with absolute pricing transparency, clearly distinguishing
 * between 100% free Gemini text descriptions (1,500/day) and billable image generation (~0.026€/image,
 * e.g. 3 images = ~0.08€ on Google Cloud invoices), alongside the zero-cost Hugging Face alternative.
 * Reference Task: Correct User Guide Google API conditions for image generation transparency.
 */
import React, { useState } from 'react';

/**
 * Interactive Help & User Guide component for the Corkbrick Scenario Generator.
 * Displays tabs for Welcome, How It Works, Free Tier & Limits, Models, and Best Practices.
 */
const InfoPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'welcome' | 'how' | 'pricing' | 'modes' | 'tips'>('welcome');

  const TabButton = ({ id, label, icon, badge }: { id: any; label: string; icon: React.ReactNode; badge?: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 p-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        activeTab === id 
          ? 'border-amber-500 text-amber-800 bg-amber-50/80 rounded-t-lg font-bold'
          : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div id="user-guide-panel" className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-5 sm:p-6 bg-gradient-to-r from-stone-50 to-white hover:bg-stone-50/80 transition-colors"
        aria-expanded={isOpen}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-800">Corkbrick AI Scenario Generator Guide & Help ✨</h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Updated</span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Complete walkthrough, free tier usage calculations, and AI model guide.
          </p>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <span className="text-xs font-semibold hidden sm:inline">{isOpen ? 'Hide Guide' : 'Show Guide'}</span>
          <svg
            className={`w-6 h-6 transition-transform text-stone-400 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-stone-200">
          <div className="flex overflow-x-auto border-b border-stone-200 px-3 pt-2 scrollbar-hide bg-stone-50/50">
            <TabButton 
              id="welcome" 
              label="Overview" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            />
            <TabButton 
              id="how" 
              label="How It Works" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} 
            />
            <TabButton 
              id="pricing" 
              label="Pricing & Real Costs" 
              badge="100% Transparent"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            />
            <TabButton 
              id="modes" 
              label="AI Models Available" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} 
            />
            <TabButton 
              id="tips" 
              label="Prompting Tips" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
            />
          </div>

          <div className="p-6 text-sm text-stone-600 bg-white">
            {/* OVERVIEW TAB */}
            {activeTab === 'welcome' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-stone-800">What is the Corkbrick Scenario Generator?</h3>
                <p className="leading-relaxed text-stone-600">
                  This tool empowers architects, designers, homeowners, and interior creators to visualize modular <strong>Corkbrick solutions</strong> in any environment on Earth.
                  Upload up to 5 photos of real Corkbrick configurations (desks, wall dividers, lounge chairs, shelving, reception pods), describe your desired architectural setting, and let multimodal AI seamlessly blend the modular cork structures into your scene.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">1</div>
                    <h4 className="font-bold text-stone-800 text-sm mb-1">Multi-Image Blending</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">Combine up to 5 real Corkbrick product pictures into a unified, architecturally cohesive 3D setting.</p>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">2</div>
                    <h4 className="font-bold text-stone-800 text-sm mb-1">Veo Motion Video</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">Turn static scenario images into 720p HD cinematic camera-movement videos with Google Veo.</p>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">3</div>
                    <h4 className="font-bold text-stone-800 text-sm mb-1">Curated Prompt Library</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">Explore presets for Residential (Flex homes, Home-working), Coworking, Airbnb, and Eco-homes.</p>
                  </div>
                </div>
              </div>
            )}

            {/* HOW IT WORKS TAB */}
            {activeTab === 'how' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-stone-800">Step-by-Step Workflow</h3>
                <div className="space-y-5">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">1</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Upload Corkbrick Images (1 to 5)</h4>
                      <p className="mt-1 leading-relaxed text-stone-600">
                        Upload 1 to 5 photos from the <a href="https://corkbrick.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold">Corkbrick website</a>, your camera, or design sketches. You can drag & drop, paste from clipboard (Ctrl+V), or browse. The AI preserves the modular cork texture and dimensions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">2</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Describe Your Desired Environment</h4>
                      <p className="mt-1 leading-relaxed text-stone-600">
                        Specify the room style, lighting, exterior view, or decoration. E.g., <em>"A sunlit Scandinavian open-plan living room with snowy mountain views through floor-to-ceiling windows and lush green indoor plants."</em> Or click any preset prompt from the categorized library below.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">3</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Generate Scenario & Marketing Copy</h4>
                      <p className="mt-1 leading-relaxed text-stone-600">
                        Click <strong>"Generate New Scenario"</strong>. Within seconds, the AI synthesizes your custom scene, writes an inspiring architectural marketing description, and creates a clean file-safe slug for saving.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">4</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Download, Generate Video & Save</h4>
                      <p className="mt-1 leading-relaxed text-stone-600">
                        Download the high-resolution image, generate a cinematic motion video with <strong>"Generate Video"</strong>, or save it directly into your local scenario list with one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRICING & REAL COSTS TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-stone-800">AI Costs & Quotas: Complete Transparency (Images vs. Descriptions)</h3>
                  <p className="text-stone-600 mt-1">
                    To ensure complete clarity with zero surprises: Google Gemini distinguishes between <strong>free text reasoning</strong> and <strong>billable image generation</strong>. Here is the exact breakdown.
                  </p>
                </div>

                {/* 3-Column Comparison: Text vs Image vs Hugging Face */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: Gemini Descriptions (Free) */}
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Gemini Text</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">100% FREE</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-base">Descriptions & Copy</h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Architectural descriptions, marketing summaries, and file slugs (powered by Gemini 3.8 Flash).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-200 text-xs space-y-1">
                      <div className="flex justify-between text-emerald-900 font-bold">
                        <span>Daily Allowance:</span>
                        <span>1,500 requests/day</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Cost:</span>
                        <span className="font-semibold text-emerald-700">€0.00 / request</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Card required:</span>
                        <span>None</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Gemini Images (Paid Pay-As-You-Go) */}
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Gemini Images</span>
                        <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">~0.026€ / IMG</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-base">Scenario Generation</h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Multimodal Corkbrick scenario rendering (powered by Gemini 2.5 Flash Image).
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-amber-200 text-xs space-y-1">
                      <div className="flex justify-between text-amber-950 font-bold">
                        <span>Cost per Image:</span>
                        <span>~0.026€ ($0.026 USD)</span>
                      </div>
                      <div className="flex justify-between text-amber-900 font-semibold">
                        <span>Real Cost (3 Images):</span>
                        <span>~0.08€ billed</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Billing Account:</span>
                        <span>Required by Google</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Hugging Face (100% Free Images) */}
                  <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">Hugging Face</span>
                        <span className="text-[10px] bg-blue-200 text-blue-950 font-extrabold px-2 py-0.5 rounded-full">ZERO COST</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-base">FLUX.1-schnell Free</h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Community inference for generating Corkbrick architectural scenarios with zero spend.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-blue-200 text-xs space-y-1">
                      <div className="flex justify-between text-blue-950 font-bold">
                        <span>Cost per Image:</span>
                        <span className="text-emerald-700 font-extrabold">100% Free (€0.00)</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Billing Account:</span>
                        <span>None required</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Credit Card:</span>
                        <span className="font-semibold text-emerald-800">Never asked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Cost Table */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Exact Pricing Reference for Google Cloud Image Generation
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                          <th className="py-2 pr-4">Action</th>
                          <th className="py-2 px-4">AI Model</th>
                          <th className="py-2 px-4">Unit Cost</th>
                          <th className="py-2 pl-4">Example Bill</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-stone-900">Marketing Descriptions</td>
                          <td className="py-2 px-4 font-mono text-stone-500">gemini-3.8-flash</td>
                          <td className="py-2 px-4 text-emerald-700 font-bold">€0.00 (1,500/day free)</td>
                          <td className="py-2 pl-4 text-emerald-700 font-semibold">€0.00 (Unlimited)</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-stone-900">Scenario Image Generation</td>
                          <td className="py-2 px-4 font-mono text-stone-500">gemini-2.5-flash-image</td>
                          <td className="py-2 px-4 font-semibold">~0.026€ / image</td>
                          <td className="py-2 pl-4 font-bold text-amber-900">3 images = ~0.08€</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-stone-900">10 Scenario Images</td>
                          <td className="py-2 px-4 font-mono text-stone-500">gemini-2.5-flash-image</td>
                          <td className="py-2 px-4 font-semibold">~0.026€ / image</td>
                          <td className="py-2 pl-4 font-bold text-amber-900">10 images = ~0.26€</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-stone-900">Hugging Face Images</td>
                          <td className="py-2 px-4 font-mono text-stone-500">FLUX.1-schnell</td>
                          <td className="py-2 px-4 text-emerald-700 font-bold">€0.00</td>
                          <td className="py-2 pl-4 text-emerald-700 font-bold">€0.00 (Always Free)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Google Cloud Trial Credits vs Active Pay-As-You-Go */}
                <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>How Google Cloud Charges Your Account</span>
                  </div>
                  <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-5 leading-relaxed">
                    <li>
                      <strong>If you have the Google Cloud $300 Free Trial Credit active:</strong> Google deducts the ~0.026€/image from the $300 promotional balance (allowing up to ~10,000 images during the 90-day trial without spending personal money).
                    </li>
                    <li>
                      <strong>If your project has standard billing (or trial expired):</strong> Google charges ~0.026€ per image directly to your credit card or invoice. For example, generating 3 images costs <strong>0.078€ (~0.08€)</strong>.
                    </li>
                    <li>
                      <strong>Recommended Safety Tip:</strong> You can set a <strong>$1.00 Budget Alert</strong> in the Google Cloud Console (Billing &gt; Budgets & Alerts) so Google notifies you automatically if spend exceeds $1.00.
                    </li>
                  </ul>
                </div>

                {/* How to test with zero fear of spending money */}
                <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>How to Test with ZERO Fear and ZERO Money Spent (100% Free Option)</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    If you want to experiment, iterate, and generate Corkbrick scenarios without any risk of spending a single cent or entering a credit card:
                  </p>
                  <ol className="text-xs text-emerald-950 list-decimal pl-5 space-y-1">
                    <li>Select <strong>Hugging Face</strong> from the AI Provider dropdown in the top header.</li>
                    <li>Click <strong>"Setup Key"</strong> and follow the link to get a free Hugging Face User Access Token (takes 30 seconds with just an email).</li>
                    <li>Generate scenarios freely using <strong>FLUX.1-schnell</strong> — no billing account, no credit card, and completely <strong>€0.00 cost</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* AI MODELS TAB */}
            {activeTab === 'modes' && (
              <div className="space-y-5">
                <h3 className="font-bold text-lg text-stone-800">Current Worldwide AI Models</h3>
                <p className="text-stone-600 text-xs">
                  The Corkbrick Scenario Generator connects to the modern <code>@google/genai</code> ecosystem and open-source inference routers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Gemini Flash */}
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-950 text-sm">Google Gemini Flash</h4>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">Recommended</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Optimized for speed, high visual sharpness, and modular precision. Retains Corkbrick dimensions, wood/cork textures, and realistic lighting.
                    </p>
                    <div className="text-[11px] font-mono text-stone-600 bg-white p-2 rounded border border-amber-200 space-y-1">
                      <div>• Image Model: <code>gemini-2.5-flash-image</code></div>
                      <div>• Text / Reasoning: <code>gemini-3.8-flash</code></div>
                      <div>• Speed: &lt; 5 seconds</div>
                    </div>
                  </div>

                  {/* Google Gemini Pro */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-800 text-sm">Google Gemini Pro</h4>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold uppercase">Studio Quality</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Maximum spatial reasoning, complex architectural lighting, and deep perspective composition for commercial mockups.
                    </p>
                    <div className="text-[11px] font-mono text-stone-600 bg-white p-2 rounded border border-stone-200 space-y-1">
                      <div>• Image Model: <code>gemini-3-pro-image</code></div>
                      <div>• Text / Reasoning: <code>gemini-3.1-pro-preview</code></div>
                      <div>• Best for: Ultra-high fidelity architectural renderings</div>
                    </div>
                  </div>

                  {/* Google Veo Video */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-800 text-sm">Google Veo Video</h4>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold uppercase">Motion AI</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Transforms generated static scenario images into 720p HD MP4 cinematic videos with smooth camera panning and lighting animation.
                    </p>
                    <div className="text-[11px] font-mono text-stone-600 bg-white p-2 rounded border border-stone-200">
                      • Model: <code>veo-3.1-fast-generate-preview</code>
                    </div>
                  </div>

                  {/* Hugging Face FLUX */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-800 text-sm">Hugging Face (FLUX.1)</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">No Card Needed</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Open-source text-to-image synthesis using Black Forest Labs' FLUX.1-schnell through serverless inference.
                    </p>
                    <div className="text-[11px] font-mono text-stone-600 bg-white p-2 rounded border border-stone-200">
                      • Model: <code>black-forest-labs/FLUX.1-schnell</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROMPTING TIPS TAB */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-stone-800">Prompting Tips for Stunning Corkbrick Scenarios</h3>
                <p className="text-stone-600 text-xs">
                  To get the most photorealistic results, structure your prompt with three core elements: Environment, Lighting, and Context.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                    <h5 className="font-bold text-stone-800 mb-1">1. Specify the Room Architecture & Window Views</h5>
                    <p className="text-stone-600">
                      Mention specific styles: <em>"A contemporary minimalist penthouse in Lisbon"</em>, <em>"A cozy Scandinavian bedroom with exposed wooden beams"</em>, or <em>"A biophilic flexible office with living walls and floor-to-ceiling windows"</em>.
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                    <h5 className="font-bold text-stone-800 mb-1">2. Describe the Lighting Atmosphere</h5>
                    <p className="text-stone-600">
                      Lighting brings natural cork to life: <em>"Warm golden hour sunset light streaming through sheer linen curtains"</em>, <em>"Soft diffused morning daylight"</em>, or <em>"Warm 2700K recessed architectural spot lighting"</em>.
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                    <h5 className="font-bold text-stone-800 mb-1">3. Preserve Corkbrick Functionality</h5>
                    <p className="text-stone-600">
                      The AI is instructed to maintain Corkbrick as the primary focal point. Mention how the modules interact: <em>"Place the modular cork divider between the study and the lounge"</em>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;


