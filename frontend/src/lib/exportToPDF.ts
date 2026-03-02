import jsPDF from "jspdf";
import type { Session } from "@/store/sessionStore";

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```(?:\w+)?\n?/g, "").trim())
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, (_, h) => "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/^>+\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "  • ")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*_]{3,}$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function exportSessionToPDF(session: Session): void {
  // ─── Page constants ──────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const PW = 595.28; // A4 width in pts
  const PH = 841.89; // A4 height in pts
  const ML = 52; // left margin
  const MR = 52; // right margin
  const CW = PW - ML - MR; // usable content width

  const HEADER_H = 68;
  const FOOTER_H = 24;
  const TOP_MARGIN = HEADER_H + 24;
  const BOT_MARGIN = FOOTER_H + 16;

  const BODY_FS = 10.5; // font-size for message body
  const LABEL_FS = 7.5; // font-size for role label
  const LINE_H = 15; // pt between body lines
  const LABEL_H = 12; // pt for label row
  const RULE_GAP = 5; // gap between label and content
  const MSG_GAP = 18; // vertical gap between messages

  let y = TOP_MARGIN;
  let pageNum = 0;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage();
    pageNum++;
    y = TOP_MARGIN;
  };

  /** Ensure `needed` pts are available; adds a new page if not. */
  const ensure = (needed: number) => {
    if (y + needed > PH - BOT_MARGIN) newPage();
  };

  /**
   * Write wrapped text line-by-line, paging as needed.
   * Returns nothing — all mutations happen via `y`.
   */
  const writeText = (text: string, x: number, maxW: number) => {
    doc.setFontSize(BODY_FS);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      ensure(LINE_H);
      doc.text(line, x, y);
      y += LINE_H;
    }
  };

  // ─── Draw branded header (page 1 only) ──────────────────────────────────
  const drawHeader = () => {
    // Dark bar
    doc.setFillColor(14, 9, 26);
    doc.rect(0, 0, PW, HEADER_H, "F");

    // Purple accent stripe
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, 4, HEADER_H, "F");

    // SA badge
    doc.setFillColor(109, 40, 217);
    doc.roundedRect(ML, 14, 34, 34, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("SA", ML + 17, 34, { align: "center" });

    // App name
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(232, 222, 255);
    doc.text("Studio Assistant", ML + 44, 31);

    // Session title
    const t =
      session.title.length > 70
        ? session.title.substring(0, 67) + "…"
        : session.title;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 100, 200);
    doc.text(t, ML + 44, 46);

    // Export date
    const d = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.setFontSize(8);
    doc.setTextColor(90, 60, 140);
    doc.text(`Exported ${d}`, PW - MR, 46, { align: "right" });
  };

  /** Draw page footer (called once all content is written). */
  const drawFooters = () => {
    const total = (
      doc.internal as unknown as { getNumberOfPages: () => number }
    ).getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);

      // Bar
      doc.setFillColor(14, 9, 26);
      doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
      doc.setFillColor(109, 40, 217);
      doc.rect(0, PH - FOOTER_H, 4, FOOTER_H, "F");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 60, 130);
      doc.text("Studio Assistant · gamestudioassistant.vercel.app", ML, PH - 7);
      doc.text(`Page ${p} of ${total}`, PW - MR, PH - 7, { align: "right" });
    }
  };

  // ─── Build document ───────────────────────────────────────────────────────
  drawHeader();

  for (const msg of session.messages) {
    const raw = msg.content.trim();
    if (!raw) continue;

    const isUser = msg.role === "user";
    const text = isUser ? raw : stripMarkdown(raw);

    // Pre-split to measure height before drawing anything
    doc.setFontSize(BODY_FS);
    const lines: string[] = doc.splitTextToSize(text, CW - 8);
    const contentH = lines.length * LINE_H;

    // Ensure at least label + first line fit
    ensure(LABEL_H + RULE_GAP + Math.min(contentH, LINE_H * 3));

    // ── Role label ──────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(LABEL_FS);

    if (isUser) {
      doc.setTextColor(167, 139, 250); // violet-400
      doc.text("YOU", PW - MR, y, { align: "right" });
    } else {
      doc.setTextColor(139, 92, 246); // violet-500
      doc.text("STUDIO ASSISTANT", ML, y);
    }
    y += LABEL_H;

    // ── Separator rule ──────────────────────────────────────────────────────
    doc.setDrawColor(180, 170, 200);
    doc.setLineWidth(0.4);
    doc.line(ML, y, PW - MR, y);
    y += RULE_GAP + 3;

    // ── Body text (rendered line-by-line so page breaks are handled) ────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_FS);
    doc.setTextColor(22, 14, 40); // near-black — high contrast on white PDF background
    writeText(text, ML, CW - 8);

    y += MSG_GAP;
  }

  // Footers on all pages
  drawFooters();

  // ─── Save ────────────────────────────────────────────────────────────────
  const safeName = session.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
  doc.save(`studio-assistant-${safeName || "conversation"}.pdf`);
}
