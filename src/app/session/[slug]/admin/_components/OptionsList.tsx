interface Option {
  id?: number;
  label: string;
}

interface OptionsListProps {
  options: Option[];
  className?: string;
}

export function OptionsList({ options, className }: OptionsListProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Options</h2>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="p-4 bg-surface-secondary rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{option.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
