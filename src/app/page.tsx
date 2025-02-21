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
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary">BlindBallot</h1>
          <p className="py-6 text-lg">
            Anonymous voting made simple and secure
          </p>
          
          <div className="form-control w-full max-w-md">
            <div className="input-group">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                className="input input-bordered w-full"
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
              />
              <button
                className="btn btn-primary mt-5"
                onClick={createSession}
                disabled={!sessionName.trim()}
              >
                Create Session
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="badge badge-outline">Secure</div>
            <div className="badge badge-outline ml-2">Anonymous</div>
            <div className="badge badge-outline ml-2">Simple</div>
          </div>

          <p className="mt-8 text-sm opacity-75">
            Create a secure voting session where participants can anonymously vote for their preferred collaborators.
          </p>
        </div>
      </div>
    </div>
  );
}
