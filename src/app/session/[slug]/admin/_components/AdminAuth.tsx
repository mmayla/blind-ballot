interface AdminAuthProps {
  error: string;
  isLoading: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onVerify: () => void;
}

export function AdminAuth({
  error,
  isLoading,
  password,
  onPasswordChange,
  onVerify
}: AdminAuthProps) {
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Verify Password</h1>
        {error && <div className="text-error mb-4">{error}</div>}
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter password"
            className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
          />
          <button
            onClick={onVerify}
            className="btn w-full text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
            disabled={!password.trim() || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}
