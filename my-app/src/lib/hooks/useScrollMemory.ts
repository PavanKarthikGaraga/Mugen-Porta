"use client";
import { useLayoutEffect, useRef, RefObject } from "react";

/**
 * Dashboard pages scroll inside a nested `overflow-y-auto` container (not the
 * window), so the browser/Next.js never restores their scroll position when you
 * leave a list page and come back. This remembers the scroll offset of that
 * container in sessionStorage and puts it back once the page content is ready.
 *
 * - Attach the returned `ref` to the page's root element (used to find the
 *   scrolling ancestor).
 * - While `ready` is false (data loading, or the list is swapped out for an
 *   inline form) scroll events are NOT recorded -- the container shrinks and
 *   the browser clamps scrollTop to 0, which must not overwrite the real offset.
 * - When `ready` turns true the saved offset is restored.
 */
function findScroller(el: HTMLElement | null): HTMLElement | null {
    let node = el?.parentElement ?? null;
    while (node) {
        const { overflowY } = getComputedStyle(node);
        if (overflowY === "auto" || overflowY === "scroll") return node;
        node = node.parentElement;
    }
    return null;
}

export function useScrollMemory<T extends HTMLElement = HTMLDivElement>(
    key: string,
    ready: boolean
): { ref: RefObject<T | null>; scrollToTop: () => void } {
    const ref = useRef<T | null>(null);
    const readyRef = useRef(ready);
    const storageKey = `scroll_memory_${key}`;

    // Record the offset while the page is "ready".
    useLayoutEffect(() => {
        readyRef.current = ready;
    }, [ready]);

    useLayoutEffect(() => {
        const scroller = findScroller(ref.current);
        if (!scroller) return;
        const onScroll = () => {
            if (!readyRef.current) return;
            try { sessionStorage.setItem(storageKey, String(scroller.scrollTop)); } catch {}
        };
        scroller.addEventListener("scroll", onScroll, { passive: true });
        return () => scroller.removeEventListener("scroll", onScroll);
    }, [storageKey]);

    // Restore once the content is ready.
    useLayoutEffect(() => {
        if (!ready) return;
        const scroller = findScroller(ref.current);
        if (!scroller) return;
        let saved = 0;
        try { saved = Number(sessionStorage.getItem(storageKey)) || 0; } catch {}
        if (saved <= 0) return;
        scroller.scrollTop = saved;
        // Late layout (fonts/images/table rows) can change the height; re-apply once.
        const raf = requestAnimationFrame(() => {
            if (Math.abs(scroller.scrollTop - saved) > 2) scroller.scrollTop = saved;
        });
        return () => cancelAnimationFrame(raf);
    }, [ready, storageKey]);

    const scrollToTop = () => {
        const scroller = findScroller(ref.current);
        if (scroller) scroller.scrollTop = 0;
    };

    return { ref, scrollToTop };
}
