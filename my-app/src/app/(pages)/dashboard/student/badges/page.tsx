"use client";
import { useState, useEffect } from "react";
import {
  FiDownload, FiShare2, FiCheckCircle, FiLock, FiExternalLink, FiFilter, FiSearch,
} from "react-icons/fi";
import { toast } from "sonner";
import SearchBar from "@/app/components/dashboard/SearchBar";
import { BadgeIcon, badgeIconSvgMarkup } from "@/lib/badgeIcons";
import { loadLogoDataUrl, LOGO_ASPECT } from "@/lib/credentialExport";

const BRAND = "rgb(151,0,3)";
const VERIFY_ORIGIN = "https://sacactivities.kluniversity.in";
const ISSUER_NAME = "KL SAC (Student Activity Center)";
const ISSUER_NAME_SHORT = "KL SAC";

// Escape special XML characters so any text embedded in a downloaded SVG
// always parses correctly (unescaped `&`, `<`, etc. caused
// "xmlParseEntityRef: no name" errors when opening the file).
function xmlEscape(str) {
  return (str ?? "").toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Always derive the verification link from the canonical production domain
// + verificationId - never trust a possibly-stale `shareUrl` value that may
// have been generated on localhost during development.
function getVerifyUrl(badge) {
  if (badge?.verificationId) return `${VERIFY_ORIGIN}/badges/verify/${badge.verificationId}`;
  return badge?.shareUrl || VERIFY_ORIGIN;
}

function buildLinkedInPostText(badge) {
  const verifyUrl = getVerifyUrl(badge);
  const lines = [
    `I'm proud to share that I've earned the "${(badge.name || "").replace(/&/g, "and")}" digital badge from ${ISSUER_NAME}'s SAMAM Activity Management Program.`,
    "",
    badge.description ? badge.description.replace(/&/g, "and") : "",
    "",
    Array.isArray(badge.competencies) && badge.competencies.length > 0 ? `Skills: ${badge.competencies.join(" · ")}` : "",
    "",
    `Issued by: ${ISSUER_NAME} | SAMAM Program`,
    `Verify this credential: ${verifyUrl}`,
    "",
    "#SAMAM #KLSAC #DigitalBadge #Achievement",
  ].filter(Boolean);
  return lines.join("\n");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Darkens a #rrggbb hex color by a given amount (0-1) - used to build a
// subtle gradient for the header/medallion instead of a single flat fill.
function shadeHex(hex, amt) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return hex;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => clamp(Math.round(parseInt(h, 16) * (1 + amt))));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Measures + word-wraps the badge name so it never overflows/gets clipped
// off the card - long names shrink first, then wrap onto a second line.
function fitBadgeName(text, maxWidth, startSize = 46, minSize = 26) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const measure = (str, size) => {
    ctx.font = `bold ${size}px Georgia, serif`;
    return ctx.measureText(str).width;
  };
  const wrap = (size) => {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (!current || measure(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  for (let size = startSize; size >= minSize; size -= 2) {
    const lines = wrap(size);
    if (lines.length <= 2 && lines.every((l) => measure(l, size) <= maxWidth)) {
      return { fontSize: size, lines };
    }
  }
  // Fall back to the smallest size, hard-wrapped to two lines however it falls.
  const lines = wrap(minSize);
  return { fontSize: minSize, lines: lines.slice(0, 2) };
}

// Builds a professional, Credly-style credential card as an SVG string,
// including an embedded scannable QR code linking to the verify page.
// All dynamic text is XML-escaped so the SVG always parses correctly, and
// the badge name is measured + wrapped so long titles never get clipped.
function buildBadgeSvg(badge, rarityRing, qrDataUrl, logoDataUrl = null) {
  const W = 820;
  const verifyUrl = getVerifyUrl(badge);
  const safeDomain = xmlEscape((badge.domain || "").toUpperCase());
  const safeRarity = xmlEscape(badge.rarity || "Common");
  const safeVerificationId = xmlEscape(badge.verificationId || "");
  const safeVerifyUrl = xmlEscape(verifyUrl);
  const bg = badge.bg || "#EFF6FF";
  const ringDark = shadeHex(rarityRing, -0.25);

  const { fontSize: nameFontSize, lines: nameLines } = fitBadgeName(badge.name || "Badge", W - 200);
  const nameLineHeight = nameFontSize * 1.2;

  // --- Layout (computed top-to-bottom so nothing overlaps or gets cut off) ---
  const headerH = 84;
  // Leaves room for the issuer lockup that sits between the header bar and
  // the medallion (logo block ends at headerH + 22 + ~64).
  const medallionCy = headerH + 300;
  const medallionR = 158;
  const nameTop = medallionCy + medallionR + 60;
  const nameBlockH = nameLines.length * nameLineHeight;
  const domainY = nameTop + nameBlockH + 14;
  const pillY = domainY + 46;
  const dividerY = pillY + 60;
  const labelY = dividerY + 34;
  const panelY = labelY + 26;
  const panelH = 190;
  const panelW = 660;
  const panelX = (W - panelW) / 2;
  const qrSize = 138;
  const qrX = panelX + 26;
  const qrY = panelY + (panelH - qrSize) / 2;
  const textX = qrX + qrSize + 34;
  const footerLineY = panelY + panelH + 50;
  const footerTextY = footerLineY + 30;
  const H = footerTextY + 40;

  const nameSvg = nameLines
    .map((line, i) => {
      const y = nameTop + nameLineHeight * (i + 0.8);
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${nameFontSize}" font-family="Georgia, serif" font-weight="bold" fill="#111827">${xmlEscape(line)}</text>`;
    })
    .join("\n  ");

  const qrBlock = qrDataUrl
    ? `<image href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>`
    : `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="8" fill="#F3F4F6"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="18%" r="65%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </radialGradient>
    <linearGradient id="header" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${ringDark}"/>
      <stop offset="100%" stop-color="${rarityRing}"/>
    </linearGradient>
    <radialGradient id="medallion" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${bg}"/>
    </radialGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="22" flood-color="#0F172A" flood-opacity="0.14"/>
    </filter>
    <filter id="medallionGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="${rarityRing}" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Card base -->
  <rect width="${W}" height="${H}" fill="#F1F5F9"/>
  <g filter="url(#cardShadow)">
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="url(#bg)" rx="28"/>
    <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="${rarityRing}" stroke-width="2" rx="28" opacity="0.55"/>
  </g>

  <!-- Header -->
  <path d="M 20 48 A 28 28 0 0 1 48 20 L ${W - 48} 20 A 28 28 0 0 1 ${W - 20} 48 L ${W - 20} ${headerH} L 20 ${headerH} Z" fill="url(#header)"/>
  <text x="${W / 2}" y="${headerH / 2}" text-anchor="middle" dominant-baseline="middle" font-size="17" font-family="sans-serif" font-weight="bold" fill="white" letter-spacing="3">${ISSUER_NAME_SHORT.toUpperCase()} — SAMAM PROGRAM</text>

  <!-- Issuer lockup, on the white card body (the logo contains black type,
       so it must not sit on the coloured header bar) -->
  ${logoDataUrl
    ? `<image href="${logoDataUrl}" x="${(W - 250) / 2}" y="${headerH + 22}" width="250" height="${Math.round(250 / LOGO_ASPECT)}" preserveAspectRatio="xMidYMid meet"/>`
    : ""}

  <!-- Medallion -->
  <circle cx="${W / 2}" cy="${medallionCy}" r="${medallionR}" fill="url(#medallion)" filter="url(#medallionGlow)"/>
  <circle cx="${W / 2}" cy="${medallionCy}" r="${medallionR}" fill="none" stroke="${rarityRing}" stroke-width="5"/>
  <circle cx="${W / 2}" cy="${medallionCy}" r="${medallionR - 18}" fill="none" stroke="${rarityRing}" stroke-width="1.5" opacity="0.45" stroke-dasharray="2 6"/>
  ${badgeIconSvgMarkup(badge.icon, badge.domain, W / 2, medallionCy, 150, ringDark)}

  <!-- Name / domain / rarity -->
  ${nameSvg}
  <text x="${W / 2}" y="${domainY}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-family="sans-serif" font-weight="600" fill="#6B7280" letter-spacing="2">${safeDomain}</text>
  <rect x="${W / 2 - 110}" y="${pillY - 18}" width="220" height="36" rx="18" fill="url(#header)"/>
  <text x="${W / 2}" y="${pillY}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-family="sans-serif" font-weight="bold" fill="white" letter-spacing="2">${safeRarity.toUpperCase()} BADGE</text>

  <!-- Divider -->
  <line x1="${W / 2 - 240}" y1="${dividerY}" x2="${W / 2 + 240}" y2="${dividerY}" stroke="${rarityRing}" stroke-width="1.5" opacity="0.35"/>
  <text x="${W / 2}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-family="sans-serif" fill="#9CA3AF" letter-spacing="3">VERIFIED DIGITAL CREDENTIAL</text>

  <!-- Verification panel -->
  <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="18" fill="${bg}" stroke="${rarityRing}" stroke-width="1.5" opacity="0.97"/>
  <rect x="${qrX - 8}" y="${qrY - 8}" width="${qrSize + 16}" height="${qrSize + 16}" rx="10" fill="#ffffff"/>
  ${qrBlock}
  <text x="${textX}" y="${panelY + 42}" font-size="12" font-family="sans-serif" font-weight="bold" fill="${ringDark}" letter-spacing="1.5">TAMPER-PROOF CREDENTIAL</text>
  <text x="${textX}" y="${panelY + 76}" font-size="17" font-family="monospace" font-weight="bold" fill="#111827">${safeVerificationId}</text>
  <text x="${textX}" y="${panelY + 106}" font-size="13" font-family="sans-serif" fill="#4B5563">${safeVerifyUrl}</text>
  <text x="${textX}" y="${panelY + 140}" font-size="11" font-family="sans-serif" fill="#9CA3AF">Scan the QR code or visit the link above to verify.</text>

  <!-- Footer -->
  <line x1="${W / 2 - 200}" y1="${footerLineY}" x2="${W / 2 + 200}" y2="${footerLineY}" stroke="${rarityRing}" stroke-width="1" opacity="0.3"/>
  <text x="${W / 2}" y="${footerTextY}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-family="sans-serif" fill="#9CA3AF">© ${new Date().getFullYear()} ${ISSUER_NAME_SHORT} · SAMAM Activity Management Program</text>
</svg>`;

  return { svg, width: W, height: H };
}

// Generates a scannable QR code (as a PNG data URL) that resolves to the
// badge's canonical verification link.
async function generateVerifyQrDataUrl(url, size = 320) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: { dark: "#111827", light: "#FFFFFF" },
  });
}

// Rasterizes an SVG string to a PNG data URL via an offscreen canvas.
// Uses a Blob URL (not a raw data: URI) for the intermediate <img> src -
// Safari in particular does not reliably paint/decode `data:image/svg+xml`
// images, which was the root cause of the previous "download" silently
// producing nothing.
function rasterizeSvg(svgString: string, width: number, height: number, scale = 2): Promise<{ pngDataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUrl = canvas.toDataURL("image/png", 1.0);
        URL.revokeObjectURL(url);
        resolve({ pngDataUrl, width, height });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render badge image"));
    };
    img.src = url;
  });
}

// Generates and downloads a professional, Credly-style PDF credential,
// complete with a real, scannable QR code linking to the verify page.
async function downloadBadgePdf(badge, rarityRing) {
  const verifyUrl = getVerifyUrl(badge);
  const [qrDataUrl, logoDataUrl] = await Promise.all([
    generateVerifyQrDataUrl(verifyUrl, 340).catch(() => null),
    loadLogoDataUrl().catch(() => null),
  ]);
  const { svg, width, height } = buildBadgeSvg(badge, rarityRing, qrDataUrl, logoDataUrl);
  const { pngDataUrl } = await rasterizeSvg(svg, width, height, 2.5);

  const { jsPDF } = await import("jspdf");
  // Custom page size matching the badge card's actual aspect ratio (in
  // points), so the PDF is a clean digital credential rather than a badge
  // floating in the middle of a generic A4 sheet - and never stretched or
  // cropped, since the ratio always matches what was actually rendered.
  const pageWidth = 420;
  const pageHeight = Math.round((height / width) * pageWidth);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [pageWidth, pageHeight] });
  pdf.addImage(pngDataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

  const fileName = `${(badge.name || "Badge").replace(/[^a-zA-Z0-9]/g, "_")}_SAMAM_Badge.pdf`;
  pdf.save(fileName);
}

const RARITY_CONFIG: Record<string, any> = {
  Common:    { label: "Common",    stars: 1, ring: "#9CA3AF", glow: "rgba(156,163,175,0.15)" },
  Rare:      { label: "Rare",      stars: 2, ring: "#2563EB", glow: "rgba(37,99,235,0.15)"   },
  Epic:      { label: "Epic",      stars: 3, ring: "#7C3AED", glow: "rgba(124,58,237,0.15)"  },
  Legendary: { label: "Legendary", stars: 4, ring: "#D97706", glow: "rgba(217,119,6,0.25)"   },
};

// Real, scannable QR code that resolves to the badge's verification link
// (previously this was a static decorative SVG that didn't encode anything
// and couldn't actually be scanned).
function BadgeQRCode({ value, size = 60 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) return;
    generateVerifyQrDataUrl(value, size * 4)
      .then((url) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setDataUrl(null); });
    return () => { cancelled = true; };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="rounded-lg bg-gray-100 animate-pulse flex-shrink-0"
        style={{ width: size, height: size }}
        aria-label="Generating QR code…"
      />
    );
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="Scan to verify this badge"
      className="rounded-lg border border-gray-100 flex-shrink-0"
    />
  );
}

function BadgeCard({ badge, onSelect }: { badge: any, onSelect: (b: any) => void }) {
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
  return (
    <button
      onClick={() => onSelect(badge)}
      className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 p-5 flex flex-col items-center gap-3 text-center group"
      style={{ borderColor: rarity.ring + "60", boxShadow: `0 0 0 0 ${rarity.glow}` }}
    >
      {/* Icon orb */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 transition-transform group-hover:scale-110"
        style={{ backgroundColor: badge.bg, borderColor: rarity.ring, color: badge.color || BRAND }}
      >
        <BadgeIcon icon={badge.icon} domain={badge.domain} size={26} />
      </div>
      {/* Rarity stars */}
      <div className="flex gap-0.5">
        {"★".repeat(rarity.stars).split("").map((s, i) => (
          <span key={i} className="text-xs" style={{ color: rarity.ring }}>{s}</span>
        ))}
      </div>
      {/* Name */}
      <p className="text-sm font-bold text-gray-900 leading-snug">{badge.name}</p>
      {/* Domain */}
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.color }}>
        {badge.domain}
      </span>
      {/* Issue date */}
      <p className="text-[10px] text-gray-400">{badge.issuedOn}</p>
    </button>
  );
}

function BadgeModal({ badge, onClose }: { badge: any, onClose: () => void }) {
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
  const [downloading, setDownloading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${badge.bg}, white)` }}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 mb-3"
            style={{ backgroundColor: badge.bg, borderColor: rarity.ring, color: badge.color || BRAND }}
          >
            <BadgeIcon icon={badge.icon} domain={badge.domain} size={34} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{badge.name}</h2>
          <p className="text-xs font-semibold mt-1" style={{ color: rarity.ring }}>
            {"★".repeat(rarity.stars)} {badge.rarity}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">{badge.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-0.5">Status</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                {badge.issuedOn ? <><FiCheckCircle className="text-emerald-500" /> Earned</> : <><FiLock className="text-gray-400" /> Locked</>}
              </p>
            </div>
            {badge.issuedOn && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">Issue Date</p>
                <p className="font-semibold text-gray-800">{badge.issuedOn}</p>
              </div>
            )}
          </div>

          {/* Locked Badge Requirement */}
          {!badge.issuedOn && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs mt-2">
              <p className="text-gray-500 font-semibold mb-1">Unlock Requirement</p>
              <p className="text-gray-700">{badge.requirement}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${badge.progress || 0}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">{badge.progress || 0}%</p>
            </div>
          )}

          {/* Competencies */}
          {badge.competencies && Array.isArray(badge.competencies) && badge.competencies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Competencies Evidenced</p>
              <div className="flex flex-wrap gap-1.5">
                {badge.competencies.map((c: string) => (
                  <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QR + verification (Only if unlocked) */}
          {badge.issuedOn && (
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <BadgeQRCode value={getVerifyUrl(badge)} size={60} />
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <FiCheckCircle size={12} className="text-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-700">Verified Digital Badge</p>
                </div>
                <p className="text-[10px] text-gray-500 break-all">{badge.verificationId}</p>
                <a
                  href={getVerifyUrl(badge)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium mt-1 hover:underline"
                  style={{ color: BRAND }}
                >
                  <FiExternalLink size={9} /> Verify online
                </a>
              </div>
            </div>
          )}

          {/* Actions (Only if unlocked) */}
          {badge.issuedOn && (
            <div className="flex gap-2">
              <button
                disabled={downloading}
                onClick={async () => {
                    setDownloading(true);
                    const toastId = toast.loading("Preparing your badge PDF…");
                    try {
                        await downloadBadgePdf(badge, rarity.ring);
                        toast.success("Badge downloaded as PDF!", { id: toastId });
                    } catch (err) {
                        console.error(err);
                        toast.error("Could not generate the PDF. Please try again.", { id: toastId });
                    } finally {
                        setDownloading(false);
                    }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <FiDownload size={13} /> {downloading ? "Generating…" : "Download PDF"}
              </button>
              <button
                onClick={async () => {
                    const verifyUrl = getVerifyUrl(badge);
                    const copied = await copyToClipboard(verifyUrl);
                    if (copied) toast.success("Verification link copied to clipboard!");
                    if (navigator.share) {
                        await navigator.share({
                            title: `I earned the ${badge.name} badge!`,
                            text: `Check out my new verified digital badge from ${ISSUER_NAME}!`,
                            url: verifyUrl
                        }).catch(() => {});
                    } else if (!copied) {
                        toast.error("Could not copy the link. Please copy it manually.");
                    }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <FiShare2 size={13} /> Share
              </button>
              <button
                onClick={async () => {
                    // Auto-generate a professional LinkedIn post, copy it to
                    // the clipboard (LinkedIn's share intent doesn't reliably
                    // pre-fill post text), confirm via toast, then open
                    // LinkedIn pre-filled as a best-effort.
                    const postText = buildLinkedInPostText(badge);
                    const copied = await copyToClipboard(postText);
                    if (copied) {
                        toast.success("Post text copied! Paste it on LinkedIn.");
                    } else {
                        toast.error("Could not copy post text automatically. You can still share on LinkedIn.");
                    }
                    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
                    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl text-white transition-colors"
                style={{ backgroundColor: "#0077B5" }}
              >
                Add to LinkedIn
              </button>
            </div>
          )}

          <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 pt-1">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [lockedBadges, setLockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search,       setSearch]       = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [selected,     setSelected]     = useState<any>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Not auth");
        const authData = await authRes.json();
        
        const username = authData.user.username;
        const res = await fetch(`/api/dashboard/student/samam/badges/${username}`);
        if (res.ok) {
          const data = await res.json();
          setEarnedBadges(data.earned || []);
          setLockedBadges(data.locked || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  const domains  = [...new Set(earnedBadges.map((b) => b.domain))];
  const rarities = ["Common","Rare","Epic","Legendary"];

  const filtered = earnedBadges.filter((b) => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !(b.earnedFrom && b.earnedFrom.toLowerCase().includes(search.toLowerCase()))) return false;
    if (domainFilter && b.domain !== domainFilter) return false;
    if (rarityFilter && b.rarity !== rarityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: "linear-gradient(90deg, rgb(151,0,3), #7C3AED, #2563EB, #D97706)" }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Digital Badge Wallet</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Your verified achievement badges — shareable on LinkedIn and resumés.
              </p>
            </div>
            {/* Rarity breakdown */}
            <div className="flex flex-wrap gap-2">
              {rarities.map((r) => {
                const count = earnedBadges.filter((b) => b.rarity === r).length;
                const cfg = RARITY_CONFIG[r];
                return count > 0 ? (
                  <div key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 bg-white">
                    <span className="text-xs font-bold" style={{ color: cfg.ring }}>{"★".repeat(cfg.stars)}</span>
                    <span className="text-xs text-gray-600">{r}</span>
                    <span className="text-xs font-bold text-gray-900">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Search badges…" className="flex-1 min-w-40" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none"
            >
              <option value="">All Domains</option>
              {domains.map((d: any) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none"
            >
              <option value="">All Rarities</option>
              {rarities.map((r) => <option key={r}>{r}</option>)}
            </select>
            {(domainFilter || rarityFilter || search) && (
              <button
                onClick={() => { setSearch(""); setDomainFilter(""); setRarityFilter(""); }}
                className="text-xs font-medium px-3 py-2 rounded-lg border text-red-700 border-red-200 hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Earned Badges Grid ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Earned Badges ({filtered.length})
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <FiSearch size={26} className="mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">No badges match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* ── Locked Badges ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-8">
          Locked Badges ({lockedBadges.length} to unlock)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {lockedBadges.map((badge) => {
            const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
            return (
              <button
                key={badge.id}
                onClick={() => setSelected(badge)}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-70 hover:opacity-100 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-gray-500 bg-gray-200 border-2 border-gray-300 grayscale relative">
                  <BadgeIcon icon={badge.icon} domain={badge.domain} size={22} />
                  {badge.progress > 0 && badge.progress < 100 && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                      {badge.progress}%
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-0.5 w-full mt-1">
                  <p className="text-xs font-bold text-gray-500 leading-tight line-clamp-1 w-full">{badge.name}</p>
                  <span className="text-[9px] font-semibold" style={{ color: rarity.ring }}>{"★".repeat(rarity.stars)} {badge.rarity}</span>
                </div>
                <div className="w-full text-center mt-1">
                  <p className="text-[9px] text-gray-400 leading-snug line-clamp-2">{badge.requirement}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${badge.progress || 0}%` }}
                    />
                  </div>
                  {badge.type === 'milestone' && (
                    <p className="text-[8px] text-gray-400 mt-0.5 font-medium">
                      {badge.currentValue || 0} / {badge.targetValue || 1}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {lockedBadges.length === 0 && (
             <p className="text-xs text-gray-500 italic">No more badges to unlock right now.</p>
          )}
        </div>
      </div>

      {/* Badge detail modal */}
      {selected && <BadgeModal badge={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
