"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <FiAlertTriangle className="text-red-500 dark:text-red-400" size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Something went wrong!
      </h2>
      
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mb-8">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: "rgb(151,0,3)" }}
        >
          <FiRefreshCw size={14} /> Try again
        </button>
      </div>
    </div>
  );
}
