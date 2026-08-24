"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

/**
 * Same shape as useState, but backed by sessionStorage. Filter/search state
 * that lives in a list page's component tree gets wiped whenever the user
 * navigates to an edit page and back -- that's a full route unmount, not a
 * re-render. sessionStorage survives the round trip while still clearing
 * when the tab actually closes.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const stored = sessionStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full/disabled — non-critical */ }
    }, [key, value]);

    return [value, setValue];
}
