import Link from 'next/link';
import { CompassIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded-surface border border-line bg-surface p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-text">
          <CompassIcon className="h-6 w-6" aria-hidden />
        </span>
        <p className="tabular mt-4 text-caption font-semibold uppercase tracking-wider text-ink-subtle">Error 404</p>
        <h1 className="mt-1 text-h1 text-ink">This page could not be found</h1>
        <p className="mx-auto mt-2 max-w-sm text-body text-ink-muted">
          The screen you were looking for does not exist or may have moved. Use one of the links below to get
          back on track.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-control bg-primary px-4 text-body font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Go to the console
          </Link>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-control border border-line-strong bg-surface px-4 text-body font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
