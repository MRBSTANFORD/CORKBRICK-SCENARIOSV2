import React, { useState, useEffect } from 'react';

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  suggestedName: string | null;
}

const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({ isOpen, onClose, onSave, suggestedName }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(suggestedName || ''); // Set name with suggestion when modal opens
    }
  }, [isOpen, suggestedName]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    if (name.trim()) {
      onSave(name.trim());
    } else {
      alert("Please enter a name for the scenario.");
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveClick();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center transition-opacity duration-300" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-stone-800 mb-4">Save Scenario</h2>
        <p className="text-sm text-stone-600 mb-4">Enter a name to save your generated scenario for later use.</p>
        <div>
          <label htmlFor="scenario-name" className="block text-sm font-medium text-stone-700 mb-1">Scenario Name</label>
          <input
            type="text"
            id="scenario-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., 'Living Room Concept 1'"
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 font-semibold transition-colors disabled:bg-stone-300"
            disabled={!name.trim()}
          >
            Save Scenario
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SaveScenarioModal;
