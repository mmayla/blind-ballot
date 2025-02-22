interface CopyableLinkProps {
  label: string;
  url: string;
  className?: string;
}

export function CopyableLink({ label, url, className }: CopyableLinkProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`p-4 bg-surface-secondary rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-l font-bold">{label}</h2>
        <a
          href={url}
          className="text-xl font-bold text-content-primary hover:text-content-primary-hover underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
        <button
          onClick={() => copyToClipboard(url)}
          className="btn btn-square"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
