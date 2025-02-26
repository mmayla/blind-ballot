interface Option {
    id: number;
    label: string;
}

interface VotingFormProps {
    token: string;
    options: Option[];
    onSubmit: (selectedIds: number[]) => Promise<void>;
    error?: string;
    loading?: boolean;
    minVotes?: number;
    maxVotes?: number;
}

export function CliqueVotingForm({
    token,
    options,
    onSubmit,
    error,
    loading,
    minVotes = 2,
    maxVotes = options.length
}: VotingFormProps) {
    return (<div>{token}</div>)
}