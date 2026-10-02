import { useRef, useState } from "react";

import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { NumberField } from "@/features/calculator-suite/components/ui/NumberField";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import { experienceLevels, marketPositioning } from "@/features/calculator-suite/config/pricingConfig";
import { geographyOptions } from "@/features/calculator-suite/config/geography";
import { useExchangeRate } from "@/features/calculator-suite/hooks/useExchangeRate";
import { useBusinessStore } from "@/features/calculator-suite/store/businessStore";
import { formatCurrency } from "@/features/calculator-suite/utils/format";

const PRICING_PHILOSOPHIES = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Price cautiously — win the work, build a track record.",
  },
  {
    id: "market_average",
    label: "Market Average",
    description: "Price in line with typical positioning for your experience.",
  },
  {
    id: "premium",
    label: "Premium",
    description: "Price as a specialist offering, not a commodity rate.",
  },
];

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-(--color-ink)">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
      />
      {hint && (
        <p className="mt-1.5 text-xs text-(--color-ink-muted)">{hint}</p>
      )}
    </div>
  );
}

function TextAreaField({ label, value, onChange, hint, rows = 4 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-(--color-ink)">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1.5 w-full resize-y rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
      />
      {hint && (
        <p className="mt-1.5 text-xs text-(--color-ink-muted)">{hint}</p>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-(--color-ink)">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <p className="mt-1.5 text-xs text-(--color-ink-muted)">{hint}</p>
      )}
    </div>
  );
}

export function SettingsPage() {
  const profile = useBusinessStore((s) => s.profile);
  const currency = useBusinessStore((s) => s.currency);
  const branding = useBusinessStore((s) => s.branding);
  const pricingPhilosophy = useBusinessStore((s) => s.pricingPhilosophy);
  const updateProfile = useBusinessStore((s) => s.updateProfile);
  const updateCurrency = useBusinessStore((s) => s.updateCurrency);
  const updateBranding = useBusinessStore((s) => s.updateBranding);
  const setPricingPhilosophy = useBusinessStore((s) => s.setPricingPhilosophy);
  const resetToDefaults = useBusinessStore((s) => s.resetToDefaults);

  const { usdToPkr, isLive, liveRate, isLoading, error, refresh } =
    useExchangeRate();
  const [logoError, setLogoError] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    if (!file.type.startsWith("image/")) {
      setLogoError("Please choose an image file (PNG, JPG, or SVG).");
      return;
    }
    if (file.size > 1024 * 1024) {
      setLogoError("Please choose an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateBranding({ logoDataUrl: reader.result });
    reader.onerror = () =>
      setLogoError("Could not read that file. Try a different image.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader
          title="Your Profile"
          description="Feeds the hourly rate calculator and the effective rate used in every quote."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Name"
            value={profile.freelancerName}
            onChange={(v) => updateProfile({ freelancerName: v })}
          />
          <TextField
            label="Location"
            value={profile.location}
            onChange={(v) => updateProfile({ location: v })}
          />
          <SelectField
            label="Default experience level"
            value={profile.experienceLevelId}
            onChange={(v) => updateProfile({ experienceLevelId: v })}
            options={experienceLevels}
            hint="Used as the starting point for new quotes — still editable per quote."
          />
          <NumberField
            label="Desired hourly rate"
            value={profile.desiredHourlyRateUsd}
            onChange={(v) => updateProfile({ desiredHourlyRateUsd: v })}
            suffix="USD"
            hint="For reference against the calculated recommended rate."
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Pricing Philosophy"
          description="A general orientation — doesn't change any numbers by itself, but worth being deliberate about."
        />
        <RadioCardGroup
          ariaLabel="Pricing philosophy"
          columns={3}
          value={pricingPhilosophy}
          onChange={setPricingPhilosophy}
          options={PRICING_PHILOSOPHIES}
        />
      </Card>

      <Card>
        <CardHeader
          title="Market Context"
          description="Your recommended price shouldn't be based only on your personal hourly rate — this is informational context, not a multiplier."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            label="Where you're based"
            value={profile.primaryCountryId ?? "pakistan"}
            onChange={(v) => updateProfile({ primaryCountryId: v })}
            options={geographyOptions}
          />
          <SelectField
            label="Where most clients are"
            value={profile.targetMarketCountryId ?? "other"}
            onChange={(v) => updateProfile({ targetMarketCountryId: v })}
            options={geographyOptions}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {marketPositioning.map((m) => (
            <div
              key={m.id}
              className="rounded-(--radius-token-md) border border-(--color-border) p-3"
            >
              <p className="text-sm font-medium text-(--color-ink)">
                {m.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-(--color-ink-secondary)">
                {m.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-(--color-ink-muted)">
          Pick a positioning per-quote in the Calculator — this section is
          context only.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Currency"
          description="Primary/secondary display currency and exchange rate source."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            label="Primary currency"
            value={currency.primaryCurrency}
            onChange={(v) => updateCurrency({ primaryCurrency: v })}
            options={[
              { id: "USD", label: "USD" },
              { id: "PKR", label: "PKR" },
            ]}
          />
          <SelectField
            label="Secondary currency"
            value={currency.secondaryCurrency}
            onChange={(v) => updateCurrency({ secondaryCurrency: v })}
            options={[
              { id: "USD", label: "USD" },
              { id: "PKR", label: "PKR" },
            ]}
          />
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm text-(--color-ink)">
          <input
            type="checkbox"
            checked={currency.useLiveRates}
            onChange={(e) => updateCurrency({ useLiveRates: e.target.checked })}
            className="h-4 w-4 accent-(--color-accent)"
          />
          Use a live exchange rate when available
        </label>

        <div className="mt-4 rounded-(--radius-token-md) bg-(--color-surface-sunken) p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-(--color-ink)">
              1 USD = {formatCurrency(usdToPkr, "PKR", 2)}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="rounded-(--radius-token-sm) border border-(--color-border) px-2.5 py-1 font-medium text-(--color-ink-secondary) hover:border-(--color-border-strong) disabled:opacity-50"
            >
              {isLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-(--color-ink-muted)">
            <dt>Source</dt>
            <dd className="text-(--color-ink-secondary)">
              {isLive ? liveRate.source : "Manual fallback (Settings)"}
            </dd>
            <dt>Fetched</dt>
            <dd className="text-(--color-ink-secondary)">
              {isLive ? new Date(liveRate.fetchedAt).toLocaleString() : "n/a"}
            </dd>
            <dt>Currency pair</dt>
            <dd className="text-(--color-ink-secondary)">USD / PKR</dd>
            <dt>Data type</dt>
            <dd className="text-(--color-ink-secondary)">
              {isLive ? "Live market rate" : "User-configured estimate"}
            </dd>
          </dl>
          {error && <p className="mt-3 text-(--color-danger)">{error}</p>}
        </div>

        <div className="mt-5">
          <NumberField
            label="Fallback USD → PKR rate"
            value={currency.fallbackUsdToPkr}
            onChange={(v) => updateCurrency({ fallbackUsdToPkr: v })}
            step={0.5}
            hint="Used automatically whenever the live rate is off or unreachable."
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Branding"
          description="Shown on every client-facing quote and PDF."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Company / freelancer name"
            value={branding.companyOrFreelancerName}
            onChange={(v) => updateBranding({ companyOrFreelancerName: v })}
          />
          <TextField
            label="Tagline"
            value={branding.tagline}
            onChange={(v) => updateBranding({ tagline: v })}
          />
          <TextField
            label="Email"
            type="email"
            value={branding.email}
            onChange={(v) => updateBranding({ email: v })}
          />
          <TextField
            label="Phone"
            value={branding.phone}
            onChange={(v) => updateBranding({ phone: v })}
          />
          <TextField
            label="Website"
            value={branding.website}
            onChange={(v) => updateBranding({ website: v })}
          />
          <TextField
            label="Address"
            value={branding.address}
            onChange={(v) => updateBranding({ address: v })}
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-(--color-ink)">Logo</p>
          <div className="mt-2 flex items-center gap-4">
            {branding.logoDataUrl ? (
              <img
                src={branding.logoDataUrl}
                alt="Current logo"
                className="h-12 w-auto rounded-(--radius-token-sm) border border-(--color-border) bg-white p-1"
              />
            ) : (
              <div className="flex h-12 w-20 items-center justify-center rounded-(--radius-token-sm) border border-dashed border-(--color-border) text-[10px] text-(--color-ink-muted)">
                No logo
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-(--radius-token-sm) border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-ink-secondary) hover:border-(--color-border-strong)"
              >
                Upload image
              </button>
              {branding.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => updateBranding({ logoDataUrl: null })}
                  className="rounded-(--radius-token-sm) px-3 py-1.5 text-xs font-medium text-(--color-danger) hover:bg-(--color-danger-soft)"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
          {logoError && (
            <p className="mt-2 text-xs text-(--color-danger)">{logoError}</p>
          )}
        </div>

        <div className="mt-5">
          <TextField
            label="Payment details"
            value={branding.paymentDetails}
            onChange={(v) => updateBranding({ paymentDetails: v })}
            hint="Shown on client quotes, e.g. bank transfer instructions."
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Quote Defaults"
          description="Applied to every new client-facing quote."
        />
        <TextAreaField
          label="Default terms & conditions"
          value={branding.defaultTermsAndConditions}
          onChange={(v) => updateBranding({ defaultTermsAndConditions: v })}
        />
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <NumberField
            label="Quote validity"
            value={branding.defaultValidityDays}
            onChange={(v) => updateBranding({ defaultValidityDays: v })}
            suffix="days"
          />
          <TextField
            label="Revision policy"
            value={branding.defaultRevisionPolicy}
            onChange={(v) => updateBranding({ defaultRevisionPolicy: v })}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Reset all settings to their development defaults? This cannot be undone.",
              )
            ) {
              resetToDefaults();
            }
          }}
          className="rounded-(--radius-token-sm) border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-ink-secondary) hover:border-(--color-border-strong)"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
