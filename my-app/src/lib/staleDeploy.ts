// After a redeploy (pm2 restart), browser tabs that were already open still
// reference the old build's JS chunks, which no longer exist. Navigating then
// throws a ChunkLoadError and the user sees an error screen. A single hard
// reload picks up the new build, so the error boundaries do that once
// automatically (guarded so a genuinely broken page can't reload-loop).

const RELOAD_FLAG = "samam_stale_reload_at";

export function isStaleChunkError(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null;
  const text = `${e?.name ?? ""} ${e?.message ?? ""}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Failed to load chunk/i.test(text);
}

/** Reloads once per minute at most. Returns true if a reload was started. */
export function reloadForStaleChunk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG)) || 0;
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    // storage blocked: still try once
  }
  window.location.reload();
  return true;
}
