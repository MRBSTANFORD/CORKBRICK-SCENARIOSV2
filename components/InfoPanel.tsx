
/**
 * Rationale: Comprehensive User Guide & Help component with detailed breakdowns of
 * Gemini Flash Free Tier limits, image generation calculations, Google Cloud pro-forma billing verification,
 * and step-by-step instructions for all features (multi-image synthesis, Veo video, library).
 * Reference Task: Update User Guide with new functions, adaptations, and Gemini Flash free usage math.
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
              label="Free Tier & Limits" 
              badge="Zero-Risk"
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

            {/* PRICING & FREE TIER TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-stone-800">How to Use Gemini Flash for Free (No Fear, Zero-Risk Testing)</h3>
                  <p className="text-stone-600 mt-1">
                    Everything you need to know about Google's free quotas, billing account verification (pro-forma), and how many scenarios you can generate for $0.
                  </p>
                </div>

                {/* Free quota highlight box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Google AI Studio Tier 1 Free Allowance</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                      <div className="text-xl font-bold text-emerald-800">1,500</div>
                      <div className="text-xs text-stone-500 font-medium">Free Requests / Day</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">$0.00 charge</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                      <div className="text-xl font-bold text-emerald-800">15 RPM</div>
                      <div className="text-xs text-stone-500 font-medium">Requests Per Minute</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">High throughput</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
                      <div className="text-xl font-bold text-emerald-800">$300</div>
                      <div className="text-xs text-stone-500 font-medium">Google Cloud Credit</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Free 90-day trial</div>
                    </div>
                  </div>
                </div>

                {/* Practical Math Calculations */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-stone-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Practical Math: How Many Images Can You Generate For Free?
                  </h4>
                  <div className="space-y-2 text-stone-700 text-xs leading-relaxed">
                    <p>
                      <strong>1. Text & Descriptions (Gemini 3.8 Flash):</strong> 100% free with up to <strong>1,500 requests per day</strong>. You can generate descriptions and rename scenarios endlessly without paying anything.
                    </p>
                    <p>
                      <strong>2. Image Generation Unit Cost:</strong> When image synthesis is processed through Gemini / Imagen models, Google charges approximately <strong>$0.030 per image</strong> (about 3 cents per full HD rendering).
                    </p>
                    <p>
                      <strong>3. Calculation with Google's $300 Free Trial Credit:</strong>
                    </p>
                    <div className="p-3 bg-white rounded border border-stone-200 font-mono text-[11px] text-stone-800">
                      $300 free trial credits ÷ $0.030 per image = <strong>10,000 Free Generated Images</strong>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-stone-600">
                      <li>If you generate <strong>20 scenarios per day</strong>: you can test for <strong>500 days</strong> completely free.</li>
                      <li>If you generate <strong>50 scenarios per day</strong>: you can test for <strong>200 days</strong> completely free.</li>
                      <li>Casual exploration of 5–10 images costs less than $0.20, fully deducted from your free credits.</li>
                    </ul>
                  </div>
                </div>

                {/* Pro-forma billing explanation */}
                <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Why does Google require a Billing Account? (Pro-Forma Verification)</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    In several regions (including the EU and UK), Google requires users to link a Google Cloud billing account before activating multimodal image APIs. 
                    <strong>This is a pro-forma security step</strong> designed by Google to prevent automated bot networks from abusing their servers.
                  </p>
                  <ul className="text-xs text-amber-900/80 list-disc pl-5 space-y-1">
                    <li><strong>No hidden automatic charges:</strong> When you sign up for the Google Cloud trial, Google provides a $300 credit and guarantees that your card is <strong>never charged automatically</strong> when the trial ends unless you manually upgrade.</li>
                    <li><strong>Set a $1 Budget Alert:</strong> For complete peace of mind, you can set a budget threshold of $1.00 in the Google Cloud Console so Google notifies you before any real spend occurs.</li>
                  </ul>
                </div>

                {/* Zero credit card alternative */}
                <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Don't Want to Provide Any Card Details? Use Hugging Face!</span>
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    If you want to experiment <strong>without adding any billing account or payment details</strong>, select <strong>Hugging Face</strong> at the top bar.
                    Hugging Face provides free Serverless Inference with Black Forest Labs' FLUX.1-schnell model with just a free email signup. Zero credit card required!
                  </p>
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


