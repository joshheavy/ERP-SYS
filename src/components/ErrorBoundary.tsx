'use client';

import React from 'react';
import { AlertOctagonIcon } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Surfaces application errors as a real in-app state instead of a blank screen,
 * so genuine failures are distinguishable from unrelated browser-extension noise.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas p-8">
        <div className="max-w-lg rounded-surface border border-line bg-surface p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertOctagonIcon className="h-4 w-4" aria-hidden />
          </span>
          <h1 className="mt-3 text-h1 text-ink">This screen could not be rendered</h1>
          <p className="mt-1.5 text-body text-ink-muted">
            The error below came from the application itself. Messages mentioning a browser extension —
            MetaMask, wallets, ad blockers — originate outside this product and do not affect it.
          </p>
          <pre className="tabular mt-3 overflow-x-auto rounded-control border border-line bg-surface-2 px-3 py-2 text-caption text-danger">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-4 inline-flex h-8 items-center rounded-control border border-primary bg-primary px-3 text-body font-medium text-white transition-colors duration-fast hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">

            Try rendering again
          </button>
        </div>
      </div>);

  }
}