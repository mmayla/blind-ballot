interface Option {
  id?: number;
  label: string;
}

interface OptionsManagerProps {
  options: Option[];
  onUpdateOption: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

export function OptionsManager({ 
  options, 
  onUpdateOption, 
  onAddOption, 
  onRemoveOption 
}: OptionsManagerProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Configure Options</h2>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={option.label}
              onChange={(e) => onUpdateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="input input-bordered flex-1 bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
            />
            <button
              onClick={() => onRemoveOption(index)}
              className="btn btn-square"
              disabled={options.length <= 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button onClick={onAddOption} className="btn mt-3">
        Add Option
      </button>
    </div>
  );
}
