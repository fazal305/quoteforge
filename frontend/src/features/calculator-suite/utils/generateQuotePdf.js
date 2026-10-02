import { formatCurrency } from "@/features/calculator-suite/utils/format";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = [28, 26, 21];
const INK_MUTED = [107, 99, 85];
const BORDER = [226, 222, 212];
const ACCENT = [15, 107, 92];
const SURFACE_SUNKEN = [250, 249, 246];

function createCursor(doc) {
  let y = MARGIN;

  function ensureSpace(height) {
    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  return {
    get y() {
      return y;
    },
    set y(value) {
      y = value;
    },
    ensureSpace,
    advance(amount) {
      y += amount;
    },
  };
}

function drawLabel(doc, cursor, text) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MUTED);
  doc.text(text.toUpperCase(), MARGIN, cursor.y);
  cursor.advance(5);
}

function drawWrappedText(doc, cursor, text, options = {}) {
  const {
    fontSize = 10,
    color = INK,
    lineHeight = 5,
    x = MARGIN,
    width = CONTENT_WIDTH,
  } = options;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    cursor.ensureSpace(lineHeight);
    doc.text(line, x, cursor.y);
    cursor.advance(lineHeight);
  }
}

/**
 * Renders a QuoteRate client-facing quote as a downloadable PDF using
 * jsPDF's drawing primitives. Mirrors ClientQuoteView.jsx's content and
 * the same rule: only client-appropriate figures appear, never internal
 * pricing mechanics.
 */
export async function generateQuotePdf(data) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor = createCursor(doc);

  // Header: freelancer identity (left) + quotation meta (right)
  let logoBottom = MARGIN;
  if (data.freelancer.logoDataUrl) {
    try {
      doc.addImage(
        data.freelancer.logoDataUrl,
        "PNG",
        MARGIN,
        MARGIN,
        0,
        14,
        undefined,
        "FAST",
      );
      logoBottom = MARGIN + 16;
    } catch {
      // Unsupported image format/data — fall back to text-only header below.
    }
  }

  if (logoBottom === MARGIN) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...ACCENT);
    doc.text(data.freelancer.name, MARGIN, MARGIN + 6);
    logoBottom = MARGIN + 10;

    if (data.freelancer.tagline) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK_MUTED);
      doc.text(data.freelancer.tagline, MARGIN, logoBottom);
      logoBottom += 5;
    }
  }

  const contactLine = [
    data.freelancer.email,
    data.freelancer.phone,
    data.freelancer.website,
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (contactLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK_MUTED);
    doc.text(contactLine, MARGIN, logoBottom);
    logoBottom += 4;
  }
  if (data.freelancer.address) {
    doc.text(data.freelancer.address, MARGIN, logoBottom);
    logoBottom += 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text("QUOTATION", PAGE_WIDTH - MARGIN, MARGIN + 6, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_MUTED);
  doc.text(data.quoteNumber, PAGE_WIDTH - MARGIN, MARGIN + 12, {
    align: "right",
  });
  doc.setFontSize(8);
  doc.text(`Issued ${data.dateIssued}`, PAGE_WIDTH - MARGIN, MARGIN + 18, {
    align: "right",
  });
  doc.text(`Valid until ${data.validUntil}`, PAGE_WIDTH - MARGIN, MARGIN + 22, {
    align: "right",
  });

  cursor.y = Math.max(logoBottom, MARGIN + 24) + 4;
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN, cursor.y, PAGE_WIDTH - MARGIN, cursor.y);
  cursor.advance(10);

  // Prepared for / Project
  const halfWidth = CONTENT_WIDTH / 2 - 4;
  const rowStartY = cursor.y;
  drawLabel(doc, cursor, "Prepared for");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(data.client.name, MARGIN, cursor.y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MUTED);
  doc.text("PROJECT", MARGIN + halfWidth + 8, rowStartY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(data.projectTitle, MARGIN + halfWidth + 8, rowStartY + 5);
  cursor.advance(10);

  // Scope & Deliverables
  cursor.ensureSpace(10);
  drawLabel(doc, cursor, "Scope & Deliverables");
  for (const item of data.deliverables) {
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 6);
    cursor.ensureSpace(lines.length * 5 + 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...ACCENT);
    doc.text("-", MARGIN, cursor.y);
    doc.setTextColor(...INK);
    doc.text(lines, MARGIN + 4, cursor.y);
    cursor.advance(lines.length * 5 + 1);
  }
  cursor.advance(4);

  // Timeline / Revision policy
  cursor.ensureSpace(16);
  const rowStartY2 = cursor.y;
  drawLabel(doc, cursor, "Estimated Timeline");
  drawWrappedText(
    doc,
    cursor,
    `${data.timeline.min}-${data.timeline.max} weeks from project start`,
    {
      fontSize: 9.5,
      width: halfWidth,
    },
  );

  const afterLeftY = cursor.y;
  cursor.y = rowStartY2;
  drawLabel(doc, cursor, "Revision Policy");
  drawWrappedText(doc, cursor, data.revisionPolicy, {
    fontSize: 9.5,
    x: MARGIN + halfWidth + 8,
    width: halfWidth,
  });
  cursor.y = Math.max(cursor.y, afterLeftY) + 4;

  // Total Project Investment box
  cursor.ensureSpace(30);
  const boxTop = cursor.y;
  const boxPaddingX = 6;
  doc.setFillColor(...SURFACE_SUNKEN);
  doc.setDrawColor(...BORDER);

  const milestoneLineHeight = 6;
  const boxHeight =
    12 +
    data.milestones.length * milestoneLineHeight +
    (data.paymentDetails ? 8 : 2) +
    6;
  doc.roundedRect(MARGIN, boxTop, CONTENT_WIDTH, boxHeight, 2, 2, "FD");

  let boxY = boxTop + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Total Project Investment", MARGIN + boxPaddingX, boxY);
  doc.setFontSize(15);
  doc.setTextColor(...ACCENT);
  doc.text(
    formatCurrency(data.pricing.total, data.pricing.currency, 0),
    PAGE_WIDTH - MARGIN - boxPaddingX,
    boxY,
    { align: "right" },
  );
  boxY += 6;
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN + boxPaddingX, boxY, PAGE_WIDTH - MARGIN - boxPaddingX, boxY);
  boxY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const m of data.milestones) {
    doc.setTextColor(...INK_MUTED);
    doc.text(`${m.label} (${m.percent}%)`, MARGIN + boxPaddingX, boxY);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(m.amount, data.pricing.currency, 0),
      PAGE_WIDTH - MARGIN - boxPaddingX,
      boxY,
      { align: "right" },
    );
    doc.setFont("helvetica", "normal");
    boxY += milestoneLineHeight;
  }

  if (data.paymentDetails) {
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_MUTED);
    const lines = doc.splitTextToSize(
      data.paymentDetails,
      CONTENT_WIDTH - boxPaddingX * 2,
    );
    doc.text(lines, MARGIN + boxPaddingX, boxY);
  }

  cursor.y = boxTop + boxHeight + 8;

  // Optional Ongoing Services
  if (data.optionalServices.length > 0) {
    cursor.ensureSpace(10);
    drawLabel(doc, cursor, "Optional Ongoing Services");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK_MUTED);
    doc.text(
      "Not included in the total above — available if you'd like them.",
      MARGIN,
      cursor.y,
    );
    cursor.advance(5);
    for (const item of data.optionalServices) {
      const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 6);
      cursor.ensureSpace(lines.length * 5 + 1);
      doc.setFontSize(9.5);
      doc.setTextColor(...ACCENT);
      doc.text("-", MARGIN, cursor.y);
      doc.setTextColor(...INK);
      doc.text(lines, MARGIN + 4, cursor.y);
      cursor.advance(lines.length * 5 + 1);
    }
    cursor.advance(4);
  }

  // Terms & Conditions
  cursor.ensureSpace(14);
  drawLabel(doc, cursor, "Terms & Conditions");
  drawWrappedText(doc, cursor, data.terms, {
    fontSize: 8.5,
    color: INK_MUTED,
    lineHeight: 4.2,
  });
  cursor.advance(10);

  // Signatures
  cursor.ensureSpace(20);
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN, cursor.y, MARGIN + halfWidth, cursor.y);
  doc.line(MARGIN + halfWidth + 8, cursor.y, PAGE_WIDTH - MARGIN, cursor.y);
  cursor.advance(4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MUTED);
  doc.text(`${data.freelancer.name} - Date`, MARGIN, cursor.y);
  doc.text(`${data.client.name} - Date`, MARGIN + halfWidth + 8, cursor.y);

  doc.save(`${data.quoteNumber}.pdf`);
}
