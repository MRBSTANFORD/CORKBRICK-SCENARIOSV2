
import React, { useState, useEffect } from 'react';
import type { SavedScenario } from '../types';

interface EditScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: { name: string; prompt: string; description: string }) => void;
  scenario: SavedScenario | null;
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({ isOpen, onClose, onSave, scenario }) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && scenario) {
      setName(scenario.name);
      setPrompt(scenario.prompt);
      setDescription(scenario.description || '');
    }
  }, [isOpen, scenario]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    if (name.trim() && prompt.trim()) {
      onSave({ name: name.trim(), prompt: prompt.trim(), description: description.trim() });
    } else {
      alert("Please ensure both name and prompt are filled in.");
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
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-stone-800 mb-4">Edit Scenario</h2>
        <p className="text-sm text-stone-600 mb-4">Update the details for your saved scenario.</p>
        <div className="space-y-4">
            <div>
              <label htmlFor="edit-scenario-name" className="block text-sm font-medium text-stone-700 mb-1">Scenario Name</label>
              <input
                  type="text"
                  id="edit-scenario-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., 'Living Room Concept 1'"
                  autoFocus
              />
            </div>
            <div>
                <label htmlFor="edit-scenario-prompt" className="block text-sm font-medium text-stone-700 mb-1">Prompt</label>
                <textarea
                    id="edit-scenario-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., 'Place this in a modern, minimalist living room...'"
                />
            </div>
            <div>
                <label htmlFor="edit-scenario-description" className="block text-sm font-medium text-stone-700 mb-1">AI-Generated Description</label>
                <textarea
                    id="edit-scenario-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter a marketing description for the scenario..."
                />
            </div>
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
            disabled={!name.trim() || !prompt.trim()}
          >
            Save Changes
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

export default EditScenarioModal;
