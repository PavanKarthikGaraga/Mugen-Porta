"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";
import { isStaleChunkError, reloadForStaleChunk } from "@/lib/staleDeploy";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Where "Back to dashboard" goes. */
  homeHref?: string;
  /** Use the full viewport (root boundary) instead of the content area. */
  fullScreen?: boolean;
};

/**
 * Shared error screen for route error boundaries (app/error.tsx and each
 * dashboard's error.tsx). A stale-build chunk error reloads the page once
 * instead of showing the error.
 */
export default function RouteError({ error, reset, homeHref = "/dashboard", fullScreen = false }: Props) {
  const stale = isStaleChunkError(error);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error("Route error:", error);
    if (stale && reloadForStaleChunk()) setReloading(true);
  }, [error, stale]);

  const wrapper = fullScreen
    ? "min-h-screen bg-white dark:bg-zinc-950"
    : "min-h-[60vh]";

  if (reloading) {
    return (
      <div className={`${wrapper} flex flex-col items-center justify-center gap-3 px-4 text-center`}>
        <FiRefreshCw className="animate-spin text-red-800" size={24} />
        <p className="text-sm text-gray-500 dark:text-zinc-400">A new version is available. Refreshing…</p>
      </div>
    );
  }

  return (
    <div role="alert" className={`${wrapper} flex flex-col items-center justify-center px-4 text-center`}>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-8 ring-red-50/50 dark:bg-red-900/20 dark:ring-red-900/10">
        <FiAlertTriangle className="text-red-600 dark:text-red-400" size={28} />
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        {stale ? "This page was updated" : "Something went wrong"}
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
        {stale
          ? "The portal was updated while this tab was open. Reload to continue with the latest version."
          : "This page hit an unexpected error. Try again, and if it keeps happening, reload the page or come back later."}
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => (stale ? window.location.reload() : reset())}
          className="inline-flex items-center gap-2 rounded-xl bg-[rgb(151,0,3)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[rgb(125,0,3)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
        >
          <FiRefreshCw size={14} /> {stale ? "Reload page" : "Try again"}
        </button>
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <FiHome size={14} /> Back to dashboard
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-6 font-mono text-[11px] text-gray-400 dark:text-zinc-500">Ref: {error.digest}</p>
      )}
    </div>
  );
}
