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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">BlindBallot</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Anonymous voting made simple
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
            />
          </div>
          <button
            onClick={createSession}
            disabled={!sessionName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Create Voting Session
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Create a secure voting session where participants can anonymously vote for their preferred collaborators.
        </p>
      </main>
    </div>
  );
}
