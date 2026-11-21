"use client";

import { useEffect } from "react";
import { isStaleChunkError, reloadForStaleChunk } from "@/lib/staleDeploy";

// Last-resort boundary: replaces the root layout, so it can't rely on the
// app's fonts, providers or Tailwind being loaded.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
    if (isStaleChunkError(error)) reloadForStaleChunk();
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#fff", color: "#111827" }}>
        <div role="alert" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 420, margin: "0 0 24px", lineHeight: 1.6 }}>
            The portal couldn&apos;t load this page. Reload to try again.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ background: "rgb(151,0,3)", color: "#fff", border: 0, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={() => reset()}
              style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
