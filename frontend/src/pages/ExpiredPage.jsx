import React from 'react';
import { Link } from 'react-router-dom';
import { Hourglass, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ExpiredPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="glass max-w-md rounded-2xl p-8 shadow-2xl border border-border animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-6">
          <Hourglass className="h-8 w-8 animate-pulse-subtle" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Link Expired</h1>
        <p className="text-muted-foreground mb-6">
          This short link has reached its expiration date or has been deactivated by the creator.
        </p>
        
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-left items-start mb-8 text-amber-500 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Looking for something else?</p>
            <p className="opacity-90">If you are the owner, you can update the expiry date of this link from your dashboard.</p>
          </div>
        </div>

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
