"use client";

const LETTERHEAD_PATH = "/klef-letterhead.png";
const LETTERHEAD_ASPECT = 1830 / 420;
const SAC_LOGO_PATH = "/sac-logo.png";
const SAC_LOGO_ASPECT = 1600 / 408;

const DIRECTOR_NAME = "Er. P Sai Vijay Pisni";
const DIRECTOR_TITLE = "Director-SAC";
const UNIVERSITY_NAME = "KL University";
const FOOTER_TEXT = "Koneru Lakshmaiah Education Foundation";

const PAGE_W = 595.28; // A4, points
const PAGE_H = 841.89;
const MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_H - 46;

export interface GalleryItem { url: string }

export interface ActivityReportInput {
  clubName: string;
  activityTitle: string;
  activityDate: string;
  facultyName: string;
  posterUrl: string;
  permissionLetterUrl: string;
  eventParticulars: {
    activityName: string;
    organizingClub: string;
    academicYear: string;
    facultyIncharge: string;
    studentLead: string;
    timeSlot: string;
    venue: string;
    studentsParticipated: string;
  };
  overview: string;
  objectives: string;
  proceedings: string;
  keyHighlights: string;
  learningOutcomes: string;
  conclusion: string;
  gallery: GalleryItem[];
  attendanceSheets: string[];
}

interface LoadedImage { dataUrl: string; ratio: number }

/** Loads any image URL (public asset or /uploads/...) via canvas and
 * re-encodes it as JPEG, so arbitrary upload formats (webp/gif/etc) all
 * embed reliably regardless of what jsPDF itself can decode natively. */
function loadImage(url: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), ratio: canvas.width / canvas.height });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Fits a box of the given aspect ratio inside maxW x maxH, preserving it
 * (never stretched, never overflowing). */
function fitBox(ratio: number, maxW: number, maxH: number) {
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  return { w, h };
}

export async function generateActivityReportPdf(input: ActivityReportInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const [letterhead, sacLogo] = await Promise.all([
    loadImage(LETTERHEAD_PATH),
    loadImage(SAC_LOGO_PATH),
  ]);

  let pageCount = 0;
  let y = MARGIN;

  function drawFooter() {
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(FOOTER_TEXT, MARGIN, PAGE_H - 24);
  }

  function drawHeader() {
    if (letterhead) {
      const h = CONTENT_W / LETTERHEAD_ASPECT;
      doc.addImage(letterhead.dataUrl, "JPEG", MARGIN, MARGIN, CONTENT_W, h);
      y = MARGIN + h + 26;
    } else {
      y = MARGIN;
    }
  }

  function newPage() {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    drawHeader();
    drawFooter();
  }

  function ensureSpace(needed: number) {
    if (y + needed > BOTTOM_LIMIT) newPage();
  }

  function sectionHeading(text: string) {
    ensureSpace(40);
    doc.setFont("times", "normal");
    doc.setFontSize(17);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(1);
    doc.line(MARGIN, y + 9, PAGE_W - MARGIN, y + 9);
    y += 34;
  }

  function subHeading(text: string) {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    y += 18;
  }

  // Text pasted in from Word/Docs regularly carries non-breaking spaces,
  // doubled-up spaces, and CRLF line endings. jsPDF's splitTextToSize wraps
  // on raw character width and doesn't collapse any of that, so those stray
  // runs of whitespace were surviving straight into the word-wrap -- most
  // visible on the last line or two of a paragraph, where a run of leftover
  // spaces has nothing after it to break up the gap.
  // jsPDF standard fonts (Helvetica) only support WinAnsiEncoding.
  // Unmapped characters > 255 (like ₹, emojis) trigger UTF-16 encoding for the whole
  // string, which standard fonts cannot render (resulting in spaced-out letters).
  function sanitizeForPdf(s: string): string {
    if (!s) return "";
    return s
      .replace(/₹/g, "Rs. ")
      // Keep only ASCII, latin-1, and specific Unicode chars that jsPDF maps to WinAnsi
      .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\n\r]/g, "");
  }

  function normalizeWhitespace(s: string): string {
    // Convert \r\n to \n, then replace any run of whitespace (except \n) with a single space
    return sanitizeForPdf(s).replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ");
  }

  function paragraph(text: string, size = 10.5) {
    if (!text?.trim()) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    // Split by newline to preserve intentional paragraphs from the textarea
    const paragraphs = normalizeWhitespace(text).split("\n");
    const lineHeight = size * 1.35;
    for (const p of paragraphs) {
      const clean = p.trim();
      if (!clean) continue;
      const lines: string[] = doc.splitTextToSize(clean, CONTENT_W);
      for (const line of lines) {
        ensureSpace(lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(40, 40, 40);
        doc.text(line.trim(), MARGIN, y);
        y += lineHeight;
      }
      y += size * 0.5; // space between paragraphs
    }
    y += 4;
  }

  function bulletList(text: string, size = 10.5) {
    if (!text?.trim()) return;
    const items = normalizeWhitespace(text).split("\n").map((s) => s.trim()).filter(Boolean);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    const lineHeight = size * 1.35;
    const bulletIndent = 14;
    for (const item of items) {
      const lines: string[] = doc.splitTextToSize(item, CONTENT_W - bulletIndent);
      lines.forEach((line, i) => {
        ensureSpace(lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(40, 40, 40);
        if (i === 0) doc.text("•", MARGIN, y);
        doc.text(line.trim(), MARGIN + bulletIndent, y);
        y += lineHeight;
      });
      y += size * 0.3; // space between bullets
    }
    y += 4;
  }

  // ---------- 1. Cover page ----------
  newPage();
  {
    const logoW = 220;
    const logoH = logoW / SAC_LOGO_ASPECT;
    if (sacLogo) doc.addImage(sacLogo.dataUrl, "JPEG", (PAGE_W - logoW) / 2, y + 20, logoW, logoH);
    y += logoH + 70;

    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 20);
    const clubText = sanitizeForPdf(input.clubName || "Club Name");
    const clubLines: string[] = doc.splitTextToSize(clubText, CONTENT_W);
    for (let i = 0; i < clubLines.length; i++) {
      doc.text(clubLines[i].trim(), MARGIN, y);
      if (i < clubLines.length - 1) y += 18;
    }
    y += 26;

    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleText = sanitizeForPdf(input.activityTitle || "ACTIVITY NAME").toUpperCase();
    const titleLines: string[] = doc.splitTextToSize(titleText, CONTENT_W);
    for (let i = 0; i < titleLines.length; i++) {
      doc.text(titleLines[i].trim(), MARGIN, y);
      if (i < titleLines.length - 1) y += 24;
    }
    y += 14;
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(1);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 22;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(input.activityDate || "", MARGIN, y);

    // Signature block near the bottom -- left blank for both director and
    // faculty (this copy gets physically signed), just a line and the
    // name/title underneath.
    const blockY = PAGE_H - 130;
    const lineW = 200;

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, blockY, MARGIN + lineW, blockY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(DIRECTOR_NAME, MARGIN, blockY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(DIRECTOR_TITLE, MARGIN, blockY + 30);
    doc.text(UNIVERSITY_NAME, MARGIN, blockY + 44);

    const rightX = PAGE_W - MARGIN - lineW;
    doc.line(rightX, blockY, rightX + lineW, blockY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(input.facultyName || "Faculty Name", rightX, blockY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(`Faculty Mentor - ${input.clubName || ""}`.trim(), rightX, blockY + 30);
    doc.text(UNIVERSITY_NAME, rightX, blockY + 44);
  }

  // ---------- 2. Poster ----------
  newPage();
  sectionHeading("POSTER");
  if (input.posterUrl) {
    const posterImg = await loadImage(input.posterUrl);
    if (posterImg) {
      const maxH = BOTTOM_LIMIT - y - 10;
      const { w, h } = fitBox(posterImg.ratio, CONTENT_W, maxH);
      doc.addImage(posterImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
    }
  }

  // ---------- 3. Permission letter ----------
  newPage();
  sectionHeading("PERMISSION LETTER");
  if (input.permissionLetterUrl) {
    const letterImg = await loadImage(input.permissionLetterUrl);
    if (letterImg) {
      const maxH = BOTTOM_LIMIT - y - 10;
      const { w, h } = fitBox(letterImg.ratio, CONTENT_W, maxH);
      doc.addImage(letterImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
    }
  }

  // ---------- 4. Event particulars ----------
  newPage();
  sectionHeading("EVENT PARTICULARS");
  {
    const ep = input.eventParticulars;
    const rows: [string, string][] = [
      ["Department Name", "Student Activity Center"],
      ["Activity Name", ep.activityName],
      ["Organizing Club/Entity", ep.organizingClub],
      ["Academic Year", ep.academicYear],
      ["Faculty Incharge", ep.facultyIncharge],
      ["Student Lead", ep.studentLead],
      ["Time slot", ep.timeSlot],
      ["Venue", ep.venue],
      ["Students Participated", ep.studentsParticipated],
    ];
    const labelW = 160;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const [label, value] of rows) {
      const valueLines: string[] = doc.splitTextToSize(sanitizeForPdf(value || "-"), CONTENT_W - labelW - 10);
      const rowH = Math.max(22, valueLines.length * 14 + 8);
      ensureSpace(rowH);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.rect(MARGIN, y, labelW, rowH);
      doc.rect(MARGIN + labelW, y, CONTENT_W - labelW, rowH);
      doc.setFont("helvetica", "bold");
      doc.text(label, MARGIN + 6, y + 14);
      doc.setFont("helvetica", "normal");
      doc.text(valueLines, MARGIN + labelW + 6, y + 14);
      y += rowH;
    }
  }

  // ---------- 5-6. Description ----------
  newPage();
  sectionHeading("DESCRIPTION");
  subHeading("1. Activity Overview");
  paragraph(input.overview);
  subHeading("2. Objectives");
  bulletList(input.objectives);
  subHeading("3. Activity Proceedings");
  paragraph(input.proceedings);
  subHeading("4. Key Highlights");
  bulletList(input.keyHighlights);
  subHeading("5. Learning Outcomes");
  bulletList(input.learningOutcomes);
  subHeading("6. Conclusion");
  paragraph(input.conclusion);

  // ---------- 7. Activity gallery ----------
  if (input.gallery.length > 0) {
    newPage();
    sectionHeading("ACTIVITY GALLERY");
    const gap = 16;
    const cellW = (CONTENT_W - gap) / 2;
    const photoH = 175;
    const footerH = 22;
    const rowGap = 14;
    const cellH = photoH + footerH + rowGap;

    const loaded = await Promise.all(input.gallery.map((g) => loadImage(g.url)));

    for (let i = 0; i < input.gallery.length; i++) {
      const col = i % 2;
      if (col === 0) ensureSpace(cellH);
      const cellX = MARGIN + col * (cellW + gap);
      const cellTop = y;

      const img = loaded[i];
      if (img) {
        const { w, h } = fitBox(img.ratio, cellW, photoH);
        doc.setDrawColor(200, 200, 200);
        doc.rect(cellX, cellTop, cellW, photoH);
        doc.addImage(img.dataUrl, "JPEG", cellX + (cellW - w) / 2, cellTop + (photoH - h) / 2, w, h);
      }

      // Footer sits flush against the photo's bottom edge, no gap.
      const footerY = cellTop + photoH;
      if (sacLogo) {
        const logoW = 60;
        const logoH = logoW / SAC_LOGO_ASPECT;
        doc.addImage(sacLogo.dataUrl, "JPEG", cellX, footerY + 4, logoW, logoH);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(sanitizeForPdf(input.clubName || ""), cellX + cellW, footerY + footerH / 2 + 4, { align: "right" });

      if (col === 1 || i === input.gallery.length - 1) y = cellTop + cellH;
    }
  }

  // ---------- 8. List of participants ----------
  if (input.attendanceSheets.length > 0) {
    for (const sheetUrl of input.attendanceSheets) {
      newPage();
      sectionHeading("LIST OF PARTICIPANTS:");
      const sheetImg = await loadImage(sheetUrl);
      if (sheetImg) {
        const maxH = BOTTOM_LIMIT - y - 10;
        const { w, h } = fitBox(sheetImg.ratio, CONTENT_W, maxH);
        doc.addImage(sheetImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
      }
    }
  }

  const safeTitle = (input.activityTitle || "Activity_Report").replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`${safeTitle}_Report.pdf`);
}

export interface IqacActivityReportInput {
  activityTitle: string;
  activityDate: string;
  organizingEntity: string;
  directorName: string;
  directorTitle: string;
  facultyName: string;
  facultyTitle: string;
  posterUrl: string;
  permissionLetterUrl: string;
  eventParticulars: {
    activityName: string;
    organizingClub: string;
    academicYear: string;
    facultyIncharge: string;
    studentLead: string;
    timeSlot: string;
    venue: string;
    studentsParticipated: string;
  };
  overview: string;
  objectives: string;
  proceedings: string;
  keyHighlights: string;
  learningOutcomes: string;
  conclusion: string;
  gallery: GalleryItem[];
  attendanceSheets: string[];
}

export async function generateIqacActivityReportPdf(input: IqacActivityReportInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const [letterhead, sacLogo] = await Promise.all([
    loadImage(LETTERHEAD_PATH),
    loadImage(SAC_LOGO_PATH),
  ]);

  let pageCount = 0;
  let y = MARGIN;

  function drawFooter() {
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(FOOTER_TEXT, MARGIN, PAGE_H - 24);
  }

  function drawHeader() {
    if (letterhead) {
      const h = CONTENT_W / LETTERHEAD_ASPECT;
      doc.addImage(letterhead.dataUrl, "JPEG", MARGIN, MARGIN, CONTENT_W, h);
      y = MARGIN + h + 26;
    } else {
      y = MARGIN;
    }
  }

  function newPage() {
    if (pageCount > 0) doc.addPage();
    pageCount++;
    drawHeader();
    drawFooter();
  }

  function ensureSpace(needed: number) {
    if (y + needed > BOTTOM_LIMIT) newPage();
  }

  function sectionHeading(text: string) {
    ensureSpace(40);
    doc.setFont("times", "normal");
    doc.setFontSize(17);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(1);
    doc.line(MARGIN, y + 9, PAGE_W - MARGIN, y + 9);
    y += 34;
  }

  function subHeading(text: string) {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    y += 18;
  }

  function sanitizeForPdf(s: string): string {
    if (!s) return "";
    return s
      .replace(/₹/g, "Rs. ")
      .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\n\r]/g, "");
  }

  function normalizeWhitespace(s: string): string {
    return sanitizeForPdf(s).replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ");
  }

  function paragraph(text: string, size = 10.5) {
    if (!text?.trim()) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    const paragraphs = normalizeWhitespace(text).split("\n");
    const lineHeight = size * 1.35;
    for (const p of paragraphs) {
      const clean = p.trim();
      if (!clean) continue;
      const lines: string[] = doc.splitTextToSize(clean, CONTENT_W);
      for (const line of lines) {
        ensureSpace(lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(40, 40, 40);
        doc.text(line.trim(), MARGIN, y);
        y += lineHeight;
      }
      y += size * 0.5;
    }
    y += 4;
  }

  function bulletList(text: string, size = 10.5) {
    if (!text?.trim()) return;
    const items = normalizeWhitespace(text).split("\n").map((s) => s.trim()).filter(Boolean);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    const lineHeight = size * 1.35;
    const bulletIndent = 14;
    for (const item of items) {
      const lines: string[] = doc.splitTextToSize(item, CONTENT_W - bulletIndent);
      lines.forEach((line, i) => {
        ensureSpace(lineHeight);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(40, 40, 40);
        if (i === 0) doc.text("•", MARGIN, y);
        doc.text(line.trim(), MARGIN + bulletIndent, y);
        y += lineHeight;
      });
      y += size * 0.3;
    }
    y += 4;
  }

  newPage();
  {
    const logoW = 220;
    const logoH = logoW / SAC_LOGO_ASPECT;
    if (sacLogo) doc.addImage(sacLogo.dataUrl, "JPEG", (PAGE_W - logoW) / 2, y + 20, logoW, logoH);
    y += logoH + 70;

    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 20);
    const entityText = sanitizeForPdf(input.organizingEntity || "SAC (Student Activity Center)");
    const entityLines: string[] = doc.splitTextToSize(entityText, CONTENT_W);
    for (let i = 0; i < entityLines.length; i++) {
      doc.text(entityLines[i].trim(), MARGIN, y);
      if (i < entityLines.length - 1) y += 18;
    }
    y += 26;

    doc.setFont("times", "bold");
    doc.setFontSize(20);
    const titleText = sanitizeForPdf(input.activityTitle || "ACTIVITY NAME").toUpperCase();
    const titleLines: string[] = doc.splitTextToSize(titleText, CONTENT_W);
    for (let i = 0; i < titleLines.length; i++) {
      doc.text(titleLines[i].trim(), MARGIN, y);
      if (i < titleLines.length - 1) y += 24;
    }
    y += 14;
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(1);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 22;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(input.activityDate || "", MARGIN, y);

    const blockY = PAGE_H - 130;
    const lineW = 200;

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.75);
    doc.line(MARGIN, blockY, MARGIN + lineW, blockY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(input.directorName || "Director Name", MARGIN, blockY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(input.directorTitle || "Director Title", MARGIN, blockY + 30);
    doc.text(UNIVERSITY_NAME, MARGIN, blockY + 44);

    const rightX = PAGE_W - MARGIN - lineW;
    doc.line(rightX, blockY, rightX + lineW, blockY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(input.facultyName || "Faculty Name", rightX, blockY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(input.facultyTitle || "Faculty Title", rightX, blockY + 30);
    doc.text(UNIVERSITY_NAME, rightX, blockY + 44);
  }

  newPage();
  sectionHeading("POSTER");
  if (input.posterUrl) {
    const posterImg = await loadImage(input.posterUrl);
    if (posterImg) {
      const maxH = BOTTOM_LIMIT - y - 10;
      const { w, h } = fitBox(posterImg.ratio, CONTENT_W, maxH);
      doc.addImage(posterImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
    }
  }

  newPage();
  sectionHeading("PERMISSION LETTER");
  if (input.permissionLetterUrl) {
    const letterImg = await loadImage(input.permissionLetterUrl);
    if (letterImg) {
      const maxH = BOTTOM_LIMIT - y - 10;
      const { w, h } = fitBox(letterImg.ratio, CONTENT_W, maxH);
      doc.addImage(letterImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
    }
  }

  newPage();
  sectionHeading("EVENT PARTICULARS");
  {
    const ep = input.eventParticulars;
    const rows: [string, string][] = [
      ["Department Name", "Student Activity Center"],
      ["Activity Name", ep.activityName],
      ["Organizing Entity", ep.organizingClub],
      ["Academic Year", ep.academicYear],
      ["Faculty Incharge", ep.facultyIncharge],
      ["Student Lead", ep.studentLead],
      ["Time slot", ep.timeSlot],
      ["Venue", ep.venue],
      ["Students Participated", ep.studentsParticipated],
    ];
    const labelW = 160;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    for (const [label, value] of rows) {
      const valueLines: string[] = doc.splitTextToSize(sanitizeForPdf(value || "-"), CONTENT_W - labelW - 10);
      const rowH = Math.max(22, valueLines.length * 14 + 8);
      ensureSpace(rowH);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.rect(MARGIN, y, labelW, rowH);
      doc.rect(MARGIN + labelW, y, CONTENT_W - labelW, rowH);
      doc.setFont("helvetica", "bold");
      doc.text(label, MARGIN + 6, y + 14);
      doc.setFont("helvetica", "normal");
      doc.text(valueLines, MARGIN + labelW + 6, y + 14);
      y += rowH;
    }
  }

  newPage();
  sectionHeading("DESCRIPTION");
  subHeading("1. Activity Overview");
  paragraph(input.overview);
  subHeading("2. Objectives");
  bulletList(input.objectives);
  subHeading("3. Activity Proceedings");
  paragraph(input.proceedings);
  subHeading("4. Key Highlights");
  bulletList(input.keyHighlights);
  subHeading("5. Learning Outcomes");
  bulletList(input.learningOutcomes);
  subHeading("6. Conclusion");
  paragraph(input.conclusion);

  if (input.gallery.length > 0) {
    newPage();
    sectionHeading("ACTIVITY GALLERY");
    const gap = 16;
    const cellW = (CONTENT_W - gap) / 2;
    const photoH = 175;
    const footerH = 22;
    const rowGap = 14;
    const cellH = photoH + footerH + rowGap;

    const loaded = await Promise.all(input.gallery.map((g) => loadImage(g.url)));

    for (let i = 0; i < input.gallery.length; i++) {
      const col = i % 2;
      if (col === 0) ensureSpace(cellH);
      const cellX = MARGIN + col * (cellW + gap);
      const cellTop = y;

      const img = loaded[i];
      if (img) {
        const { w, h } = fitBox(img.ratio, cellW, photoH);
        doc.setDrawColor(200, 200, 200);
        doc.rect(cellX, cellTop, cellW, photoH);
        doc.addImage(img.dataUrl, "JPEG", cellX + (cellW - w) / 2, cellTop + (photoH - h) / 2, w, h);
      }

      const footerY = cellTop + photoH;
      if (sacLogo) {
        const logoW = 60;
        const logoH = logoW / SAC_LOGO_ASPECT;
        // Move to center instead of left? Or just left with no text
        doc.addImage(sacLogo.dataUrl, "JPEG", cellX, footerY + 4, logoW, logoH);
      }

      if (col === 1 || i === input.gallery.length - 1) y = cellTop + cellH;
    }
  }

  if (input.attendanceSheets.length > 0) {
    for (const sheetUrl of input.attendanceSheets) {
      newPage();
      sectionHeading("LIST OF PARTICIPANTS:");
      const sheetImg = await loadImage(sheetUrl);
      if (sheetImg) {
        const maxH = BOTTOM_LIMIT - y - 10;
        const { w, h } = fitBox(sheetImg.ratio, CONTENT_W, maxH);
        doc.addImage(sheetImg.dataUrl, "JPEG", MARGIN + (CONTENT_W - w) / 2, y, w, h);
      }
    }
  }

  const safeTitle = (input.activityTitle || "Activity_Report").replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`${safeTitle}_IQAC_Report.pdf`);
}
