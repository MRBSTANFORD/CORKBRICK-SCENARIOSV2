
import React, { useState } from 'react';

const InfoPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'welcome' | 'how' | 'keys' | 'modes' | 'share'>('welcome');

  const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 p-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        activeTab === id 
          ? 'border-amber-500 text-amber-700 bg-amber-50 rounded-t-lg'
          : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-6 bg-gradient-to-r from-stone-50 to-white"
        aria-expanded={isOpen}
      >
        <div>
            <h2 className="text-xl font-bold text-stone-800">Welcome to the Corkbrick Scenario Generator ✨</h2>
            <p className="text-sm text-stone-500 mt-1">Unleash Your Creativity with AI</p>
        </div>
        <svg
          className={`w-6 h-6 transition-transform text-stone-400 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-stone-100">
          <div className="flex overflow-x-auto border-b border-stone-200 px-2 pt-2 scrollbar-hide">
            <TabButton 
              id="welcome" 
              label="Welcome" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            />
            <TabButton 
              id="how" 
              label="How it Works" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} 
            />
            <TabButton 
              id="keys" 
              label="API Keys" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1-1-1 1-1-1-1 1-1-1-5.657-5.657a6 6 0 117.757-7.757 2 2 0 002-2 2 2 0 00-2-2 2 2 0 00-2 2" /></svg>} 
            />
            <TabButton 
              id="modes" 
              label="Model Modes" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} 
            />
            <TabButton 
              id="share" 
              label="Share" 
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.632l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>} 
            />
          </div>

          <div className="p-6 text-sm text-stone-600 bg-white">
            {activeTab === 'welcome' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-lg text-stone-800 mb-3">What is this tool?</h3>
                <p className="leading-relaxed text-stone-600">
                  This tool is your creative co-pilot. Our vision is to empower you to visualize CORKBRICK's modular solutions in any setting you can imagine. It's about bringing your ideas to life, transforming simple images into stunning, shareable scenes that showcase the endless possibilities of sustainable, flexible design.
                </p>
              </div>
            )}

            {activeTab === 'how' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-lg text-stone-800 mb-4">How does it work? (It's simple!)</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Upload Your Vision</h4>
                      <p className="mt-1 leading-relaxed">Start by uploading up to five images. This could be a picture of your own room, a CORKBRICK solution you love from our website, or even a sketch. The AI will weave them together!</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Describe Your Dream Scene</h4>
                      <p className="mt-1 leading-relaxed">Tell the AI what you want to create. Be descriptive! Want to see a CORKBRICK desk in a futuristic home office? Or a cozy reading nook in a rustic cabin? Just describe it.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-base">Generate & Inspire</h4>
                      <p className="mt-1 leading-relaxed">Click "Generate" and watch the AI create a unique, high-quality image based on your inputs.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1-1-1 1-1-1-1 1-1-1-5.657-5.657a6 6 0 117.757-7.757 2 2 0 002-2 2 2 0 00-2-2 2 2 0 00-2 2" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-blue-900">Getting Your API Key (Required)</h3>
                  </div>
                  
                  <p className="text-blue-800 mb-5 text-base">To keep this tool powerful and accessible, you bring your own AI key. It's free and takes 30 seconds!</p>
                  
                  <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm mb-4">
                    <ol className="space-y-3 text-blue-900 border-l-2 border-blue-200 pl-4 ml-2">
                        <li className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-blue-100 text-blue-600 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">1</span>
                          Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors">Google AI Studio</a>.
                        </li>
                        <li className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-blue-100 text-blue-600 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                          Sign in with your Google account.
                        </li>
                        <li className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-blue-100 text-blue-600 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">3</span>
                          Click the blue <strong>"Create API key"</strong> button.
                        </li>
                        <li className="relative">
                          <span className="absolute -left-[25px] top-0.5 bg-blue-100 text-blue-600 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">4</span>
                          Copy the key (starts with <code>AIza...</code>), return here, and click <strong>Generate</strong>.
                        </li>
                    </ol>
                  </div>

                  <div className="flex items-start gap-2 text-blue-700 text-sm opacity-90">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <p><strong>Privacy First:</strong> Your key is only stored locally in your browser's session. It is never saved on our servers.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modes' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Model Modes & Cost</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-stone-800 text-base">Standard Mode</h4>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Free Tier</span>
                        </div>
                        <p className="text-sm text-stone-500 mb-3">Perfect for trying out the app.</p>
                        <ul className="space-y-2 text-stone-600 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                              Model: <strong>Gemini 2.5 Flash</strong>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                              Uses Google's Free limits.
                            </li>
                        </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:border-amber-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-amber-900 text-base">Advanced Mode</h4>
                          <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Paid Tier</span>
                        </div>
                        <p className="text-sm text-amber-700/80 mb-3">For professional, high-res results.</p>
                        <ul className="space-y-2 text-amber-800 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Models: <strong>Gemini 3 Pro</strong> & <strong>Veo Video</strong>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Requires Google Cloud Billing.
                            </li>
                        </ul>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'share' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Create & Share</h3>
                <p className="text-stone-600 mb-4">The power is in your hands. You can:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h5 className="font-bold text-stone-800 mb-1">Redecorate Spaces</h5>
                    <p className="text-stone-500 text-sm">Take a photo of your living room and ask the AI to add a CORKBRICK wall divider.</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h5 className="font-bold text-stone-800 mb-1">Explore Styles</h5>
                    <p className="text-stone-500 text-sm">See how solutions look in a Japanese apartment, Brazilian beach house, or grand library.</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h5 className="font-bold text-stone-800 mb-1">Build Portfolio</h5>
                    <p className="text-stone-500 text-sm">Create stunning visual mockups for your architectural or interior design projects.</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                    <h5 className="font-bold text-stone-800 mb-1">Share with the World</h5>
                    <p className="text-stone-500 text-sm">Post your creations on LinkedIn, Instagram, or TikTok to inspire others!</p>
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

