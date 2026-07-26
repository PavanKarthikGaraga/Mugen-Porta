/**
 * Shared browser-side helpers for producing downloadable credentials
 * (badges and certificates): brand asset loading, QR generation, SVG
 * rasterisation and PDF export.
 *
 * These all touch browser APIs (fetch, Image, canvas, FileReader), so they
 * must only be called from client components.
 */

export const VERIFY_ORIGIN = "https://sacactivities.kluniversity.in";
export const ISSUER_NAME = "KL SAC (Student Activity Center)";
export const ISSUER_NAME_SHORT = "KL SAC";
export const BRAND = "rgb(151,0,3)";
export const BRAND_HEX = "#970003";

/** Public path of the cropped SAC lockup (transparent background). */
export const LOGO_PATH = "/sac-logo.png";

/**
 * Escapes text for safe inclusion in an SVG document. An unescaped `&`
 * makes the whole SVG fail to parse ("xmlParseEntityRef: no name"), which
 * previously produced silently-broken downloads.
 */
export function xmlEscape(str: unknown): string {
    return (str ?? "").toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// The logo is fetched once per page load and reused — every certificate in a
// list would otherwise re-download it.
let logoPromise: Promise<string | null> | null = null;

/**
 * Loads the SAC logo as a base64 data URL so it can be embedded directly in
 * a standalone SVG/PDF. Returns null if it can't be loaded, and callers are
 * expected to degrade gracefully rather than fail the whole download.
 */
export function loadLogoDataUrl(): Promise<string | null> {
    if (logoPromise) return logoPromise;
    logoPromise = (async () => {
        try {
            const res = await fetch(LOGO_PATH);
            if (!res.ok) return null;
            const blob = await res.blob();
            return await new Promise<string | null>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    })();
    return logoPromise;
}

/** Scannable QR (PNG data URL) pointing at a credential's verify link. */
export async function generateVerifyQrDataUrl(url: string, size = 320): Promise<string | null> {
    try {
        const QRCode = (await import("qrcode")).default;
        return await QRCode.toDataURL(url, {
            width: size,
            margin: 1,
            color: { dark: "#111827", light: "#FFFFFF" },
        });
    } catch {
        return null;
    }
}

/**
 * Rasterises an SVG string to a PNG data URL via an offscreen canvas.
 *
 * Uses a Blob URL rather than a `data:image/svg+xml` URI for the intermediate
 * <img> src: Safari does not reliably decode data-URI SVGs, which was the
 * original cause of downloads silently producing nothing.
 */
export function rasterizeSvg(
    svgString: string, width: number, height: number, scale = 2
): Promise<{ pngDataUrl: string; width: number; height: number }> {
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
                if (!ctx) throw new Error("Canvas is unavailable");
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
            reject(new Error("Failed to render credential image"));
        };
        img.src = url;
    });
}

/**
 * Renders an SVG string into a single-page PDF whose page size exactly
 * matches the artwork's aspect ratio, so nothing is ever stretched, cropped
 * or left floating on a generic A4 sheet.
 */
export async function svgToPdf(
    svg: string, width: number, height: number,
    { pageWidth, fileName, orientation = "portrait", scale = 2.5 }:
    { pageWidth: number; fileName: string; orientation?: "portrait" | "landscape"; scale?: number }
): Promise<void> {
    const { pngDataUrl } = await rasterizeSvg(svg, width, height, scale);
    const { jsPDF } = await import("jspdf");
    const pageHeight = Math.round((height / width) * pageWidth);
    const pdf = new jsPDF({ orientation, unit: "pt", format: [pageWidth, pageHeight] });
    pdf.addImage(pngDataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    pdf.save(fileName);
}

/** Filesystem-safe filename fragment. */
export function safeFileName(str: string, fallback = "Credential"): string {
    return (str || fallback).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || fallback;
}
