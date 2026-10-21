
import React, { useState, useEffect } from 'react';

interface VideoLoadingSpinnerProps {
    status: string;
}

const VideoLoadingSpinner: React.FC<VideoLoadingSpinnerProps> = ({ status }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl border border-stone-200 mt-4 shadow-xl animate-fade-in">
        <div className="relative mb-6">
            <svg className="animate-spin h-16 w-16 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-amber-800">{formatTime(seconds)}</span>
            </div>
        </div>
        
        <h3 className="text-stone-800 font-bold text-lg mb-1">{status}</h3>
        <p className="text-sm text-stone-500 text-center max-w-xs leading-relaxed">
            Veo AI is hand-crafting your cinematic video. This typically takes <strong>1 to 3 minutes</strong>.
        </p>
        
        <div className="w-full max-w-xs bg-stone-100 h-1.5 rounded-full mt-6 overflow-hidden border border-stone-200">
            <div 
                className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min((seconds / 180) * 100, 95)}%` }}
            ></div>
        </div>
        <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-widest font-bold">Rendering in progress</p>

        <style>{`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default VideoLoadingSpinner;
