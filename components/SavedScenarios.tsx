import React, { useRef } from 'react';
import type { SavedScenario } from '../types';

interface SavedScenariosProps {
  scenarios: SavedScenario[];
  onLoad: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadFromFile: (scenarios: SavedScenario[]) => void;
}

const SavedScenarios: React.FC<SavedScenariosProps> = ({ scenarios, onLoad, onEdit, onDelete, onLoadFromFile }) => {
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleSaveAllToFile = () => {
    if (scenarios.length === 0) {
      alert("There are no saved scenarios to export.");
      return;
    }
    const dataStr = JSON.stringify(scenarios, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = "corkbrick-scenarios.json";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadAllFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable.");
        
        let importedData = JSON.parse(text);
        
        if (!Array.isArray(importedData)) {
            importedData = [importedData];
        }
        
        if (
          !Array.isArray(importedData) ||
          !importedData.every(
            (s: any) =>
              s &&
              typeof s === 'object' &&
              !Array.isArray(s) &&
              s !== null &&
              typeof s.id === 'string' &&
              typeof s.name === 'string' &&
              typeof s.prompt === 'string' &&
              Array.isArray(s.originalImages) &&
              s.originalImages.every((img: any) => img && typeof img.dataUrl === 'string' && typeof img.mimeType === 'string') &&
              typeof s.editedImage === 'string' &&
              (s.description === undefined || typeof s.description === 'string') && // Validate optional description
              (s.filename === undefined || typeof s.filename === 'string') // Validate optional filename
          )
        ) {
          throw new Error('Invalid file format. The file must contain a valid scenario object or an array of scenarios.');
        }
        onLoadFromFile(importedData as SavedScenario[]);
      } catch (error) {
        alert(`Failed to import scenarios: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        if (importFileRef.current) {
          importFileRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-stone-200">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold text-stone-700">Saved Scenarios</h2>
      </div>
      <p className="text-xs text-stone-500 mb-4">
        Load a scenario to view it, or use the buttons to save/load your entire collection to/from your computer.
      </p>
       <div className="mb-4 grid grid-cols-2 gap-2">
          <input
              type="file"
              ref={importFileRef}
              onChange={handleLoadAllFromFile}
              accept="application/json,.json"
              className="hidden"
              id="import-scenarios-input"
          />
          <label
              htmlFor="import-scenarios-input"
              className="w-full text-center cursor-pointer text-sm bg-stone-600 text-white px-3 py-2 rounded-md hover:bg-stone-700 font-semibold"
          >
              Load Scenarios
          </label>
          <button
              onClick={handleSaveAllToFile}
              disabled={scenarios.length === 0}
              className="w-full text-sm bg-stone-600 text-white px-3 py-2 rounded-md hover:bg-stone-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
              Save Scenarios
          </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center text-sm text-stone-500 py-4 bg-stone-50 rounded-md border border-dashed border-stone-200">
          You have no saved scenarios yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="flex items-start gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
              <img src={scenario.editedImage} alt={scenario.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0 mt-1" />
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-stone-800 truncate" title={scenario.name}>{scenario.name}</p>
                <p className="text-xs text-stone-500 italic mt-1" title={scenario.prompt}>
                  Prompt: "{scenario.prompt}"
                </p>
                 {scenario.description && (
                  <p className="text-xs text-stone-600 mt-2 bg-stone-200/50 p-2 rounded-md" title={scenario.description}>
                     {scenario.description}
                  </p>
                 )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => onLoad(scenario.id)}
                  className="text-xs bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 font-semibold transition-colors"
                  aria-label={`Load scenario ${scenario.name}`}
                >
                  Load
                </button>
                <button
                  onClick={() => onEdit(scenario.id)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 font-semibold transition-colors"
                  aria-label={`Edit scenario ${scenario.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(scenario.id)}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 font-semibold transition-colors"
                  aria-label={`Delete scenario ${scenario.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedScenarios;