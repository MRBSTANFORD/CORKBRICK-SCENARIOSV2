
import React, { useState } from 'react';
import type { SamplePromptsData } from '../types';

interface SamplePromptsProps {
  prompts: SamplePromptsData;
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
  </svg>
);

const SamplePrompts: React.FC<SamplePromptsProps> = ({ prompts, onSelect, disabled }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSegment, setOpenSegment] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
    setOpenSegment(null); // Close segment when category changes
  };

  const toggleSegment = (segmentName: string) => {
    setOpenSegment(openSegment === segmentName ? null : segmentName);
  };

  return (
    <div className="space-y-1">
      {prompts.map((category) => (
        <div key={category.name}>
          <button
            onClick={() => toggleCategory(category.name)}
            disabled={disabled}
            className="w-full flex items-center justify-between text-left text-sm font-semibold bg-stone-100 text-stone-700 px-3 py-2 rounded-md hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{category.name}</span>
            <ChevronIcon open={openCategory === category.name} />
          </button>
          {openCategory === category.name && (
            <div className="pl-3 mt-1 space-y-1">
              {category.segments.map((segment) => (
                <div key={segment.name}>
                  <button
                    onClick={() => toggleSegment(segment.name)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between text-left text-sm font-medium bg-white text-stone-600 px-3 py-2 rounded-md hover:bg-stone-100 disabled:opacity-50 transition-colors"
                  >
                     <span>{segment.name}</span>
                     <ChevronIcon open={openSegment === segment.name} />
                  </button>
                  {openSegment === segment.name && (
                     <div className="pl-4 pt-2 pb-1 space-y-2 border-l-2 border-stone-200 ml-2">
                        {/* FIX: Use Object.entries for safer iteration and to fix type error. */}
                        {Object.entries(segment.prompts).map(([key, promptText]) => (
                            <button
                                key={key}
                                onClick={() => onSelect(promptText)}
                                disabled={disabled}
                                className="w-full text-left text-xs bg-stone-50 text-stone-600 px-2 py-1.5 rounded-md hover:bg-amber-100 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={`Use prompt for: ${key}`}
                            >
                                <span className="font-semibold capitalize">{key}:</span> {promptText}
                            </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SamplePrompts;
