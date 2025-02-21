'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [sessionName, setSessionName] = useState('');
  const router = useRouter();

  const createSession = () => {
    if (!sessionName.trim()) return;
    
    // Generate a slug from the session name
    const slug = sessionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // TODO: Create session in the backend
    // For now, we'll just redirect to a placeholder URL
    router.push(`/session/${slug}`);
  };

  return (
    <div className="hero min-h-screen bg-surface-primary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-content-primary mb-2">BlindBallot</h1>
          <p className="text-lg text-content-secondary mb-12">
            Anonymous voting made simple
          </p>
          
          <div className="form-control w-full max-w-md">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
              />
              <button
                className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
                onClick={createSession}
                disabled={!sessionName.trim()}
              >
                Create Session
              </button>
            </div>
          </div>

          <div className="mt-12">
            <div className="badge badge-outline border-border-primary text-content-primary">Secure</div>
            <div className="badge badge-outline border-border-primary text-content-primary ml-2">Anonymous</div>
            <div className="badge badge-outline border-border-primary text-content-primary ml-2">Simple</div>
          </div>

          <p className="mt-8 text-sm text-content-muted">
            Create a secure voting session where participants can anonymously vote for their preferred collaborators.
          </p>
        </div>
      </div>
    </div>
  );
}
