'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [sessionName, setSessionName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createSession = async () => {
    if (!sessionName.trim() || isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionName,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { session } = await response.json();
      router.push(`/session/${session.slug}`);
    } catch (error) {
      console.error('Error creating session:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input input-bordered w-full bg-surface-secondary text-content-primary border-border-secondary focus:border-border-primary"
              />
              <button
                className="btn border-2 border-border-primary text-content-primary hover:bg-content-primary hover:text-surface-primary transition-colors"
                onClick={createSession}
                disabled={!sessionName.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Session'}
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
