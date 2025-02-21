'use client';

import { useParams } from 'next/navigation';

export default function SessionPage() {
  const { slug } = useParams();
  
  return (
    <div className="min-h-screen bg-surface-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-content-primary mb-6">Voting Session</h1>
        <div className="bg-surface-secondary p-6 rounded-lg border border-border-secondary">
          <p className="text-content-secondary mb-4">Session ID: {slug}</p>
          {/* We'll add the voting interface here */}
        </div>
      </div>
    </div>
  );
}
