"use client";
import React from "react";
import {
  FiAward, FiStar, FiGlobe, FiZap, FiCpu, FiBookOpen, FiBook, FiMusic,
  FiFilm, FiCamera, FiScissors, FiShoppingBag, FiFeather, FiTrendingUp,
  FiTarget, FiActivity, FiUsers, FiLink, FiCloud, FiShield, FiBarChart2,
  FiWifi, FiSun, FiSend, FiTool, FiDollarSign, FiHome, FiFileText,
  FiMic, FiCompass, FiHeart, FiLock,
} from "react-icons/fi";

/**
 * Single source of truth for badge iconography.
 *
 * `badge_definitions.icon` was originally seeded with emoji glyphs. Those look
 * unprofessional in the wallet and render as missing-glyph boxes in the
 * exported PDF/SVG credential (no emoji font is embedded there). This module
 * maps every emoji that was ever seeded to a stable icon *name*, and resolves
 * that name to either a React component (in-app UI) or raw SVG path markup
 * (the downloadable credential).
 *
 * db/migrate_badge_icons.sql rewrites the stored emoji to these names. This
 * module is deliberately tolerant of both, so the app looks correct whether or
 * not that migration has been run yet.
 */

// ── Legacy emoji → canonical icon name ────────────────────────────────────────
export const EMOJI_TO_ICON_NAME: Record<string, string> = {
  // Liberal Arts, Culture and Heritage packs
  "💃": "activity",      // Dance
  "🎭": "users",         // Theatre
  "🎬": "film",          // Film
  "🎵": "music",         // Music
  "📖": "book-open",     // Literature
  "🧵": "scissors",      // Textile & craft
  "👗": "shopping-bag",  // Fashion
  "🎨": "feather",       // Fine art
  "🧗": "trending-up",   // Adventure
  "🎮": "target",        // Gaming & esports
  "📷": "camera",        // Photography

  // Technology & Emerging Technologies packs
  "🧠": "cpu",           // Artificial Intelligence
  "⛓️": "link",          // Blockchain & Web3
  "⛓": "link",
  "☁️": "cloud",         // Cloud & DevOps
  "☁": "cloud",
  "🛡️": "shield",        // Cybersecurity
  "🛡": "shield",
  "📊": "bar-chart-2",   // Data Science
  "🔌": "wifi",          // Internet of Things
  "🌾": "sun",           // AgriTech
  "🧬": "activity",      // Biotechnology
  "🚀": "send",          // SpaceTech
  "🤖": "tool",          // Robotics
  "💰": "dollar-sign",   // FinTech
  "🏙️": "home",          // Smart Cities
  "🏙": "home",
  "📚": "book",          // EdTech
  "⚖️": "file-text",     // Technology Policy
  "⚖": "file-text",

  // Generic / milestone
  "⭐": "star",
  "🌟": "star",
  "🌍": "globe",
  "🌱": "trending-up",
  "🏃": "activity",
  "🏅": "award",
  "🏆": "award",
  "💡": "zap",
  "💻": "cpu",
  "🗣️": "mic",
  "🗣": "mic",
  "🧭": "compass",
  "🔒": "lock",
};

// ── Fallback icon per SAMAM domain ────────────────────────────────────────────
export const DOMAIN_ICON_NAME: Record<string, string> = {
  TEC: "cpu",        // Technology & Emerging Technologies
  LCH: "book-open",  // Liberal Arts, Culture and Heritage
  ESO: "heart",      // Extension & Social Outreach
  IIE: "zap",        // Innovation & Entrepreneurship
  HWB: "activity",   // Health & Well-being
};

// ── Name → React component (in-app UI) ────────────────────────────────────────
const ICON_COMPONENT: Record<string, React.ElementType> = {
  award: FiAward, star: FiStar, globe: FiGlobe, zap: FiZap, cpu: FiCpu,
  "book-open": FiBookOpen, book: FiBook, music: FiMusic, film: FiFilm,
  camera: FiCamera, scissors: FiScissors, "shopping-bag": FiShoppingBag,
  feather: FiFeather, "trending-up": FiTrendingUp, target: FiTarget,
  activity: FiActivity, users: FiUsers, link: FiLink, cloud: FiCloud,
  shield: FiShield, "bar-chart-2": FiBarChart2, wifi: FiWifi, sun: FiSun,
  send: FiSend, tool: FiTool, "dollar-sign": FiDollarSign, home: FiHome,
  "file-text": FiFileText, mic: FiMic, compass: FiCompass, heart: FiHeart,
  lock: FiLock,
};

// ── Name → raw SVG markup (downloadable credential) ───────────────────────────
// Feather icon geometry on a 24x24 grid, stroked (no fill). Kept as markup so
// buildBadgeSvg can drop it into a standalone SVG file with no React runtime.
const ICON_PATH: Record<string, string> = {
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  film: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  "shopping-bag": '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
  "trending-up": '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  "bar-chart-2": '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  "dollar-sign": '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};

/**
 * Resolves whatever is stored on a badge into a canonical icon name.
 * Accepts a already-migrated name, a legacy emoji, or nothing at all —
 * falling back to the badge's domain, then to a generic award icon.
 */
export function resolveBadgeIconName(icon?: string | null, domain?: string | null): string {
  const raw = (icon || "").trim();
  if (raw && ICON_PATH[raw]) return raw;                 // already a valid name
  if (raw && EMOJI_TO_ICON_NAME[raw]) return EMOJI_TO_ICON_NAME[raw]; // legacy emoji
  const byDomain = DOMAIN_ICON_NAME[(domain || "").toUpperCase()];
  return byDomain || "award";
}

/** Renders a badge's icon as a React component, for in-app UI. */
export function BadgeIcon({
  icon, domain, size = 24, className, style,
}: {
  icon?: string | null; domain?: string | null; size?: number;
  className?: string; style?: React.CSSProperties;
}) {
  const Component = ICON_COMPONENT[resolveBadgeIconName(icon, domain)] || FiAward;
  return <Component size={size} className={className} style={style} />;
}

/**
 * Returns an SVG `<g>` fragment drawing the badge icon centred on (cx, cy) at
 * the given pixel size — for the standalone downloadable credential, which has
 * no React runtime and cannot rely on an emoji font being installed.
 */
export function badgeIconSvgMarkup(
  icon: string | null | undefined,
  domain: string | null | undefined,
  cx: number, cy: number, size: number, color: string
): string {
  const inner = ICON_PATH[resolveBadgeIconName(icon, domain)] || ICON_PATH.award;
  const scale = size / 24;
  const x = cx - size / 2;
  const y = cy - size / 2;
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}
