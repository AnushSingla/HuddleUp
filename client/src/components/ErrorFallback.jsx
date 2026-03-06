import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorFallback({ resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center text-4xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-zinc-400 text-sm mb-8">
          We hit an unexpected error. You can go back home or try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
