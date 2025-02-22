interface VoterCountProps {
  value: number;
  onChange: (value: number) => void;
}

export function VoterCount({ value, onChange }: VoterCountProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Number of Voters</h2>
      <input
        type="number"
        min="2"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 2)}
        className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
      />
    </div>
  );
}
