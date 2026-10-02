import { formatCurrency } from "@/features/calculator-suite/utils/format";

const PAPER_INK = "#1c1a15";
const PAPER_INK_MUTED = "#6b6355";
const PAPER_BORDER = "#e2ded4";
const PAPER_ACCENT = "#0f6b5c";

export function ClientQuoteView({ data }) {
  return (
    <div
      className="print-area mx-auto max-w-3xl rounded-lg border p-8 sm:p-12"
      style={{
        background: "#ffffff",
        color: PAPER_INK,
        borderColor: PAPER_BORDER,
      }}
    >
      <div
        className="flex flex-wrap items-start justify-between gap-6 border-b pb-6"
        style={{ borderColor: PAPER_BORDER }}
      >
        <div>
          {data.freelancer.logoDataUrl ? (
            <img
              src={data.freelancer.logoDataUrl}
              alt=""
              className="mb-2 h-10 w-auto"
            />
          ) : (
            <p
              className="font-display text-xl font-semibold"
              style={{ color: PAPER_ACCENT }}
            >
              {data.freelancer.name}
            </p>
          )}
          {data.freelancer.tagline && (
            <p className="text-sm" style={{ color: PAPER_INK_MUTED }}>
              {data.freelancer.tagline}
            </p>
          )}
          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: PAPER_INK_MUTED }}
          >
            {[
              data.freelancer.email,
              data.freelancer.phone,
              data.freelancer.website,
            ]
              .filter(Boolean)
              .join(" · ")}
            {data.freelancer.address && (
              <>
                <br />
                {data.freelancer.address}
              </>
            )}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-display text-lg font-semibold"
            style={{ color: PAPER_INK }}
          >
            Quotation
          </p>
          <p className="text-sm" style={{ color: PAPER_INK_MUTED }}>
            {data.quoteNumber}
          </p>
          <p className="mt-2 text-xs" style={{ color: PAPER_INK_MUTED }}>
            Issued {data.dateIssued}
            <br />
            Valid until {data.validUntil}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: PAPER_INK_MUTED }}
          >
            Prepared for
          </p>
          <p className="mt-1 text-sm font-medium">{data.client.name}</p>
        </div>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: PAPER_INK_MUTED }}
          >
            Project
          </p>
          <p className="mt-1 text-sm font-medium">{data.projectTitle}</p>
        </div>
      </div>

      <div className="mt-8">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: PAPER_INK_MUTED }}
        >
          Scope &amp; Deliverables
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {data.deliverables.map((item) => (
            <li key={item} className="flex gap-2">
              <span style={{ color: PAPER_ACCENT }}>—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: PAPER_INK_MUTED }}
          >
            Estimated Timeline
          </p>
          <p className="mt-1 text-sm">
            {data.timeline.min}–{data.timeline.max} weeks from project start
          </p>
        </div>
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: PAPER_INK_MUTED }}
          >
            Revision Policy
          </p>
          <p className="mt-1 text-sm">{data.revisionPolicy}</p>
        </div>
      </div>

      <div
        className="mt-8 rounded-md border p-5"
        style={{ borderColor: PAPER_BORDER, background: "#faf9f6" }}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">Total Project Investment</p>
          <p
            className="font-display text-2xl font-semibold"
            style={{ color: PAPER_ACCENT }}
          >
            {formatCurrency(data.pricing.total, data.pricing.currency, 0)}
          </p>
        </div>

        <div
          className="mt-4 space-y-1.5 border-t pt-4 text-sm"
          style={{ borderColor: PAPER_BORDER }}
        >
          {data.milestones.map((m) => (
            <div key={m.label} className="flex justify-between">
              <span style={{ color: PAPER_INK_MUTED }}>
                {m.label} ({m.percent}%)
              </span>
              <span className="font-medium">
                {formatCurrency(m.amount, data.pricing.currency, 0)}
              </span>
            </div>
          ))}
        </div>

        {data.paymentDetails && (
          <p className="mt-4 text-xs" style={{ color: PAPER_INK_MUTED }}>
            {data.paymentDetails}
          </p>
        )}
      </div>

      {data.optionalServices.length > 0 && (
        <div className="mt-8">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: PAPER_INK_MUTED }}
          >
            Optional Ongoing Services
          </p>
          <p className="mt-1 text-xs" style={{ color: PAPER_INK_MUTED }}>
            Not included in the total above — available if you'd like them.
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {data.optionalServices.map((item) => (
              <li key={item} className="flex gap-2">
                <span style={{ color: PAPER_ACCENT }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: PAPER_INK_MUTED }}
        >
          Terms &amp; Conditions
        </p>
        <p
          className="mt-2 text-xs leading-relaxed"
          style={{ color: PAPER_INK_MUTED }}
        >
          {data.terms}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <div className="h-px w-full" style={{ background: PAPER_BORDER }} />
          <p className="mt-2 text-xs" style={{ color: PAPER_INK_MUTED }}>
            {data.freelancer.name} — Date
          </p>
        </div>
        <div>
          <div className="h-px w-full" style={{ background: PAPER_BORDER }} />
          <p className="mt-2 text-xs" style={{ color: PAPER_INK_MUTED }}>
            {data.client.name} — Date
          </p>
        </div>
      </div>
    </div>
  );
}
