interface Token {
  token: string;
  used: boolean;
}

interface TokenListProps {
  tokens: Token[];
  onCopyToken: (token: string) => void;
  className?: string;
}

export function TokenList({ tokens, onCopyToken, className }: TokenListProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Voting Tokens</h2>
      <div className="grid grid-cols-2 gap-4">
        {tokens.map((token, index) => (
          <div
            key={index}
            className={"p-4 bg-surface-secondary rounded-lg flex justify-between items-center"}
          >
            <div className="flex flex-col">
              <span className="font-mono">{token.token}</span>
              <span className="text-sm text-content-secondary">
                {token.used ? 'Used' : 'Available'}
              </span>
            </div>
            <button
              onClick={() => onCopyToken(token.token)}
              className="btn btn-sm"
              disabled={token.used}
              title={token.used ? 'Token is already used' : 'Copy token'}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
