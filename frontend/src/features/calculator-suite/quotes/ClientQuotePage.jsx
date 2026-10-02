import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "@/features/calculator-suite/components/ui/Card";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { useQuoteHistoryStore } from "@/features/calculator-suite/store/quoteHistoryStore";
import { buildClientQuoteData } from "@/features/calculator-suite/utils/clientQuote";
import { generateQuotePdf } from "@/features/calculator-suite/utils/generateQuotePdf";
import { ClientQuoteView } from "@/features/calculator-suite/quotes/ClientQuoteView";

export function ClientQuotePage() {
  const { id } = useParams();
  const record = useQuoteHistoryStore((s) => s.quotes.find((q) => q.id === id));
  const branding = useBusinessStore((s) => s.branding);
  const [pdfError, setPdfError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!record) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Card>
          <p className="text-sm text-(--color-ink-secondary)">
            This quote no longer exists — it may have been deleted.
          </p>
          <Link
            to="/quotes"
            className="mt-4 inline-block rounded-(--radius-token-sm) bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink)"
          >
            Back to Quote History
          </Link>
        </Card>
      </div>
    );
  }

  const data = buildClientQuoteData(record, branding);

  const handleDownloadPdf = async () => {
    setPdfError(null);
    setIsGenerating(true);
    try {
      await generateQuotePdf(data);
    } catch {
      setPdfError(
        'Could not generate the PDF. Try "Print / Save as PDF" instead, or try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/quotes"
          className="text-sm font-medium text-(--color-ink-secondary) hover:text-(--color-ink)"
        >
          ← Back to Quote History
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-(--radius-token-sm) border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-border-strong)"
          >
            Print
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="rounded-(--radius-token-sm) bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink) transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isGenerating ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      {pdfError && (
        <p className="no-print mb-4 rounded-(--radius-token-sm) bg-(--color-danger-soft) px-4 py-2 text-sm text-(--color-danger)">
          {pdfError}
        </p>
      )}

      <ClientQuoteView data={data} />

      <p className="no-print mx-auto mt-6 max-w-3xl text-center text-xs text-(--color-ink-muted)">
        This is the document your client sees — internal pricing details (rate,
        multipliers, contingency) are never shown here.
      </p>
    </div>
  );
}
