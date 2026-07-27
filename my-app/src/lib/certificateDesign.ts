import {
    xmlEscape, loadLogoDataUrl, loadSignatureDataUrl, generateVerifyQrDataUrl, svgToPdf,
    safeFileName, VERIFY_ORIGIN, ISSUER_NAME, BRAND_HEX, LOGO_ASPECT,
} from "./credentialExport";

/**
 * Landscape certificate artwork for a completed SAMAM activity.
 *
 * Built as an SVG string (rather than DOM) so the identical markup can be
 * rasterised into a PDF for download and previewed inline in the browser.
 */

export interface CertificateData {
    verificationId: string;
    studentName: string;
    studentUsername: string;
    branch?: string | null;
    activityTitle: string;
    activityCode: string;
    domain?: string | null;
    issuedOn: string;        // pre-formatted display date
    issuedByName?: string | null;
    credits?: number | null;
}

const W = 1414;   // A4 landscape at ~120dpi — 1.414 ratio
const H = 1000;

const GOLD = "#B08D2F";
const INK = "#111827";
const MUTED = "#6B7280";

export function certificateVerifyUrl(verificationId: string) {
    return `${VERIFY_ORIGIN}/certificates/verify/${verificationId}`;
}

/**
 * Wraps text to fit a pixel width, shrinking the font until it fits in at
 * most `maxLines`.
 *
 * Widths are estimated from an average glyph-width factor rather than
 * measured, because this runs headlessly with no text metrics available.
 * The factor is deliberately pessimistic (tuned against DejaVu Serif, the
 * widest fallback likely to be substituted for Georgia) so the artwork
 * still fits when the intended font is unavailable.
 */
function fitLines(
    text: string, maxWidth: number, baseSize: number, minSize: number,
    maxLines: number, widthFactor: number
) {
    const estimate = (s: string, size: number) => s.length * size * widthFactor;

    for (let size = baseSize; size >= minSize; size -= 2) {
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let current = "";
        let overflowed = false;

        for (const word of words) {
            const candidate = current ? `${current} ${word}` : word;
            if (estimate(candidate, size) <= maxWidth) {
                current = candidate;
            } else {
                if (current) lines.push(current);
                // A single word too long for the line can't be fixed by wrapping.
                if (estimate(word, size) > maxWidth) overflowed = true;
                current = word;
            }
        }
        if (current) lines.push(current);

        if (!overflowed && lines.length <= maxLines) return { size, lines };
    }

    // Nothing fits cleanly — use the smallest size and truncate with an ellipsis
    // rather than letting text run off the edge of the certificate.
    const perLine = Math.max(8, Math.floor(maxWidth / (minSize * widthFactor)));
    const lines: string[] = [];
    let rest = text;
    while (rest.length > 0 && lines.length < maxLines) {
        lines.push(rest.slice(0, perLine));
        rest = rest.slice(perLine);
    }
    if (rest.length > 0 && lines.length > 0) {
        lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + "…";
    }
    return { size: minSize, lines };
}

export function buildCertificateSvg(
    cert: CertificateData,
    logoDataUrl: string | null,
    qrDataUrl: string | null,
    signatureDataUrl: string | null = null
): { svg: string; width: number; height: number } {
    const verifyUrl = certificateVerifyUrl(cert.verificationId);
    const CONTENT_W = W - 300; // generous side margins inside the ornamental frame

    // The body sits in a fixed region between the header rule and the
    // signature row. Both the name and the activity title can wrap to two
    // lines, so the block is measured and the type shrunk until it fits —
    // otherwise a long name plus a long title overruns the signature line
    // and the QR panel.
    const REGION_TOP = 366;
    const REGION_BOTTOM = 742;
    const AVAILABLE = REGION_BOTTOM - REGION_TOP;

    function layout(nameSize: number, titleSize: number) {
        // Bold serif ≈ 0.60 em average; italic serif is a little narrower.
        const name = fitLines(cert.studentName || "Student", CONTENT_W, nameSize, 34, 2, 0.60);
        const title = fitLines(cert.activityTitle || "Activity", CONTENT_W, titleSize, 20, 2, 0.55);
        const nameLineH = name.size * 1.14;
        const titleLineH = title.size * 1.25;

        let y = 0;
        const certifyY = y + 18;
        y += 40;
        const nameFirstY = y + name.size * 0.80;
        y = nameFirstY + (name.lines.length - 1) * nameLineH + name.size * 0.34;
        const ruleY = y + 14;
        const branchY = ruleY + 28;
        const forY = branchY + 46;
        const titleFirstY = forY + 42 + title.size * 0.30;
        y = titleFirstY + (title.lines.length - 1) * titleLineH;
        const metaY = y + 40;

        return { name, title, nameLineH, titleLineH, certifyY, nameFirstY, ruleY, branchY, forY, titleFirstY, metaY, height: metaY };
    }

    let L = layout(76, 42);
    for (let step = 1; step <= 6 && L.height > AVAILABLE; step++) {
        L = layout(76 - step * 6, 42 - step * 3);
    }

    // Centre the block in the region; never start above REGION_TOP.
    const startY = REGION_TOP + Math.max(0, (AVAILABLE - L.height) / 2);
    const { name, title, nameLineH, titleLineH } = L;
    const certifyY = startY + L.certifyY;
    const nameY = startY + L.nameFirstY;
    const ruleY = startY + L.ruleY;
    const branchY = startY + L.branchY;
    const forY = startY + L.forY;
    const titleY = startY + L.titleFirstY;
    const metaY = startY + L.metaY;

    const nameSvg = name.lines.map((line: string, i: number) =>
        `<text x="${W / 2}" y="${nameY + nameLineH * i}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${name.size}" font-weight="bold" fill="${INK}">${xmlEscape(line)}</text>`
    ).join("\n  ");

    const titleSvg = title.lines.map((line: string, i: number) =>
        `<text x="${W / 2}" y="${titleY + titleLineH * i}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${title.size}" font-style="italic" font-weight="bold" fill="${BRAND_HEX}">${xmlEscape(line)}</text>`
    ).join("\n  ");

    // Logo keeps its 1600x406 aspect ratio (≈3.94:1).
    const logoW = 380;
    const logoH = Math.round(logoW / LOGO_ASPECT);
    const logoBlock = logoDataUrl
        ? `<image href="${logoDataUrl}" x="${(W - logoW) / 2}" y="86" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet"/>`
        : `<text x="${W / 2}" y="140" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="${BRAND_HEX}">${xmlEscape(ISSUER_NAME)}</text>`;

    // Bottom row: signature (left), date (centre), verification (right).
    // Each occupies its own fixed column so nothing can overlap regardless of
    // how wide the substituted font turns out to be.
    const baseY = H - 190;
    const sigCx = 320;
    const dateCx = W / 2;
    const qrSize = 104;
    const qrCx = W - 250;
    const qrX = qrCx - qrSize / 2;
    // Sits well above the ID caption so the two never touch.
    const qrY = baseY - 134;
    const qrBlock = qrDataUrl
        ? `<image href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>`
        : `<rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="8" fill="#F3F4F6" stroke="#E5E7EB"/>`;

    const metaBits = [
        cert.activityCode ? `Activity ${cert.activityCode}` : null,
        cert.domain ? `${cert.domain} Domain` : null,
        cert.credits ? `${cert.credits} SAMAM Points` : null,
    ].filter(Boolean).join("   ·   ");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${BRAND_HEX}"/>
      <stop offset="50%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="${BRAND_HEX}"/>
    </linearGradient>
    <linearGradient id="rule" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${GOLD}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Paper -->
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>

  <!-- Outer brand frame -->
  <rect x="0" y="0" width="${W}" height="14" fill="url(#edge)"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="url(#edge)"/>
  <rect x="0" y="0" width="14" height="${H}" fill="url(#edge)"/>
  <rect x="${W - 14}" y="0" width="14" height="${H}" fill="url(#edge)"/>

  <!-- Inner hairline border -->
  <rect x="44" y="44" width="${W - 88}" height="${H - 88}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.55"/>
  <rect x="52" y="52" width="${W - 104}" height="${H - 104}" fill="none" stroke="${BRAND_HEX}" stroke-width="0.8" opacity="0.28"/>

  <!-- Corner flourishes -->
  ${[[52, 52, 1, 1], [W - 52, 52, -1, 1], [52, H - 52, 1, -1], [W - 52, H - 52, -1, -1]]
    .map(([cx, cy, sx, sy]) =>
      `<path d="M ${cx} ${cy + 46 * sy} L ${cx} ${cy} L ${cx + 46 * sx} ${cy}" fill="none" stroke="${GOLD}" stroke-width="3"/>`
    ).join("\n  ")}

  ${logoBlock}

  <!-- Title block: centred with text-anchor="middle" only.
       Deliberately avoids the textLength and letter-spacing attributes, as
       neither is handled consistently across SVG rasterisers. textLength is
       silently ignored by some, leaving the text anchored at its left edge and
       visibly off-centre. letter-spacing is applied at very different
       strengths, and it also breaks centring, because the trailing advance
       after the final glyph is counted in the width being centred. Plain
       centred text renders identically everywhere, so what is proofed here is
       what is actually produced. -->
  <text x="${W / 2}" y="262" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="bold" fill="${INK}">CERTIFICATE</text>
  <text x="${W / 2}" y="304" text-anchor="middle" font-family="sans-serif" font-size="19" fill="${MUTED}">OF COMPLETION</text>
  <rect x="${W / 2 - 190}" y="328" width="380" height="2.5" fill="url(#rule)"/>

  <text x="${W / 2}" y="${certifyY}" text-anchor="middle" font-family="sans-serif" font-size="19" fill="${MUTED}">This is to certify that</text>

  ${nameSvg}
  <rect x="${W / 2 - 260}" y="${ruleY}" width="520" height="1.5" fill="${GOLD}" opacity="0.6"/>
  <text x="${W / 2}" y="${branchY}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="${MUTED}">${
      xmlEscape(cert.branch ? `${cert.branch}  ·  ${cert.studentUsername}` : cert.studentUsername)
  }</text>

  <text x="${W / 2}" y="${forY}" text-anchor="middle" font-family="sans-serif" font-size="19" fill="${MUTED}">has successfully completed</text>

  ${titleSvg}

  <text x="${W / 2}" y="${metaY}" text-anchor="middle" font-family="sans-serif" font-size="15" fill="${MUTED}">${xmlEscape(metaBits)}</text>

  <!-- Signature -->
  ${signatureDataUrl
    ? `<image href="${signatureDataUrl}" x="${sigCx - 150}" y="${baseY - 116}" width="300" height="100" preserveAspectRatio="xMidYMid meet"/>`
    : ""}
  <line x1="${sigCx - 160}" y1="${baseY}" x2="${sigCx + 160}" y2="${baseY}" stroke="${INK}" stroke-width="1.2" opacity="0.6"/>
  <text x="${sigCx}" y="${baseY + 28}" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="${INK}">Er. P Sai Vijay</text>
  <text x="${sigCx}" y="${baseY + 50}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${MUTED}">Director-SAC</text>

  <!-- Issue date (no rule above — cleaner look) -->
  <text x="${dateCx}" y="${baseY + 28}" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="${INK}">${xmlEscape(cert.issuedOn)}</text>
  <text x="${dateCx}" y="${baseY + 50}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${MUTED}">Date of Issue</text>

  <!-- Verification: its own column, so the ID can never run into the date -->
  ${qrBlock}
  <text x="${qrCx}" y="${baseY + 28}" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="${INK}">${xmlEscape(cert.verificationId)}</text>
  <text x="${qrCx}" y="${baseY + 50}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${MUTED}">Scan to verify</text>

  <!-- Footer (kept clear of the inner border rule at y=${H - 52}) -->
  <text x="${W / 2}" y="${H - 100}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${MUTED}">Issued by ${xmlEscape(ISSUER_NAME)} · SAMAM Activity Management Program</text>
  <text x="${W / 2}" y="${H - 80}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${MUTED}">Verify this certificate at ${xmlEscape(verifyUrl)}</text>
</svg>`;

    return { svg, width: W, height: H };
}

/** Builds the artwork and saves it as a landscape PDF. */
export async function downloadCertificatePdf(cert: CertificateData): Promise<void> {
    const [logoDataUrl, qrDataUrl, signatureDataUrl] = await Promise.all([
        loadLogoDataUrl(),
        generateVerifyQrDataUrl(certificateVerifyUrl(cert.verificationId), 340),
        loadSignatureDataUrl(),
    ]);
    const { svg, width, height } = buildCertificateSvg(cert, logoDataUrl, qrDataUrl, signatureDataUrl);
    await svgToPdf(svg, width, height, {
        pageWidth: 842, // A4 landscape width in points
        orientation: "landscape",
        fileName: `${safeFileName(cert.activityTitle, "Certificate")}_SAMAM_Certificate.pdf`,
    });
}
