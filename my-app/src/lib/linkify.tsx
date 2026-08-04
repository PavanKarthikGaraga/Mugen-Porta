"use client";
import React from "react";

// Captures http(s) URLs; trailing punctuation (.,:;"')]!?) is excluded so a
// link embedded in a sentence doesn't swallow the closing punctuation.
const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g;

/**
 * Renders plain notification text with any http(s) URLs turned into
 * clickable links, everything else left as plain text. Notification
 * messages are stored and displayed as plain strings; this is the only
 * place a URL becomes navigable rather than inert text.
 */
export function linkifyText(text: string): React.ReactNode {
  if (!text) return text;
  const parts = text.split(URL_PATTERN);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline break-all"
        style={{ color: "rgb(151,0,3)" }}
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
