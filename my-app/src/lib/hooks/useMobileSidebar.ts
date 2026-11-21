"use client";
import { useEffect } from "react";

/**
 * Shared behaviour for the dashboards' off-canvas mobile sidebar:
 * - closes when the route changes (browser back/forward included, not only
 *   when a link's own onClick remembered to close it)
 * - closes on Escape
 * - stops the page behind it from scrolling while it is open
 */
export function useMobileSidebar(open: boolean, setOpen: (v: boolean) => void, pathname: string | null) {
    useEffect(() => {
        setOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, setOpen]);
}
