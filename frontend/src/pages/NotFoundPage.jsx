import React from 'react';
import { Link } from 'react-router-dom';
import { Link2Off, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="glass max-w-md rounded-2xl p-8 shadow-2xl border border-border animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 mb-6">
          <Link2Off className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Link Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The link you are trying to access does not exist or may have been deleted. Check the spelling or try contacting the owner.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg bg-secondary border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
