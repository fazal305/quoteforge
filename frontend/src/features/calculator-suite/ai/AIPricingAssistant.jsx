import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader } from "@/features/calculator-suite/components/ui/Card";
import { FeatureToggleRow } from "@/features/calculator-suite/components/ui/FeatureToggleRow";
import { RadioCardGroup } from "@/features/calculator-suite/components/ui/RadioCardGroup";
import {
  complexityLevels,
  features,
  projectTypes,
} from "@/features/calculator-suite/config/pricingConfig";
import { useCalculatorStore } from "@/features/calculator-suite/store/calculatorStore";
import { parseRequirements } from "@/features/calculator-suite/utils/aiAssistant";

const EXAMPLE_PROMPT =
  "A website for a clothing brand with product catalog, online payment, customer accounts, order tracking, WhatsApp notifications and an admin panel.";

export function AIPricingAssistant() {
  const navigate = useNavigate();
  const applyAiSuggestion = useCalculatorStore((s) => s.applyAiSuggestion);

  const [inputText, setInputText] = useState("");
  const [review, setReview] = useState(null);

  const handleAnalyze = () => {
    const result = parseRequirements(inputText);
    setReview({
      projectTypeId: result.projectTypeId,
      complexityId: result.complexityId,
      featureIds: new Set(result.featureIds),
      hasAnyMatch: result.hasAnyMatch,
    });
  };

  const toggleReviewFeature = (featureId) => {
    setReview((r) => {
      const next = new Set(r.featureIds);
      if (next.has(featureId)) next.delete(featureId);
      else next.add(featureId);
      return { ...r, featureIds: next };
    });
  };

  const handleApply = () => {
    applyAiSuggestion({
      projectTypeId: review.projectTypeId,
      complexityId: review.complexityId,
      featureIds: [...review.featureIds],
    });
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader
          title="AI Pricing Assistant"
          description="Describe the project in plain language. This runs entirely in your browser — no account, no API, nothing sent anywhere — and only matches keywords against your feature catalog. Nothing is applied until you review and confirm it below."
        />
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={EXAMPLE_PROMPT}
          rows={5}
          className="w-full resize-y rounded-(--radius-token-sm) border border-(--color-border) bg-(--color-surface) px-3 py-2.5 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-accent)"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setInputText(EXAMPLE_PROMPT)}
            className="text-xs font-medium text-(--color-ink-muted) underline decoration-dotted underline-offset-2 hover:text-(--color-ink-secondary)"
          >
            Try an example
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!inputText.trim()}
            className="rounded-(--radius-token-sm) bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink) transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Analyze
          </button>
        </div>
      </Card>

      {review && (
        <Card>
          <CardHeader
            title="Review Requirements"
            description="Nothing here has affected your pricing yet — adjust anything that's wrong, then apply it to the calculator."
          />

          {!review.hasAnyMatch && (
            <p className="mb-4 rounded-(--radius-token-sm) bg-(--color-warning-soft) px-3 py-2 text-xs text-(--color-warning)">
              Nothing specific was recognized in that description. You can still
              apply this (it'll open a blank Custom Web Application), or go back
              and add more detail — naming features like "login", "admin panel",
              or "online payment" helps.
            </p>
          )}

          <p className="mb-2 text-sm font-medium text-(--color-ink)">
            Project type
          </p>
          <RadioCardGroup
            ariaLabel="Detected project type"
            columns={3}
            value={review.projectTypeId}
            onChange={(id) => setReview((r) => ({ ...r, projectTypeId: id }))}
            options={projectTypes.map((p) => ({
              id: p.id,
              label: p.label,
              description: p.description,
            }))}
          />

          <p className="mb-2 mt-5 text-sm font-medium text-(--color-ink)">
            Complexity
          </p>
          <RadioCardGroup
            ariaLabel="Detected complexity"
            columns={2}
            value={review.complexityId}
            onChange={(id) => setReview((r) => ({ ...r, complexityId: id }))}
            options={complexityLevels.map((c) => ({
              id: c.id,
              label: c.label,
              description: c.description,
              badge: `×${c.multiplier.toFixed(2)}`,
            }))}
          />

          <p className="mb-2 mt-5 text-sm font-medium text-(--color-ink)">
            Detected features{" "}
            <span className="font-normal text-(--color-ink-muted)">
              ({review.featureIds.size} — uncheck anything that doesn't apply)
            </span>
          </p>
          {review.featureIds.size === 0 ? (
            <p className="text-xs text-(--color-ink-muted)">
              No specific features detected — you can add them manually after
              applying.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {features
                .filter((f) => review.featureIds.has(f.id))
                .map((f) => (
                  <FeatureToggleRow
                    key={f.id}
                    id={`ai-feature-${f.id}`}
                    label={f.label}
                    description={f.description}
                    hours={f.hours}
                    complexity={f.complexity}
                    checked={review.featureIds.has(f.id)}
                    onChange={() => toggleReviewFeature(f.id)}
                  />
                ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReview(null)}
              className="rounded-(--radius-token-sm) border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-ink-secondary) transition-colors hover:border-(--color-border-strong)"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-(--radius-token-sm) bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink) transition-opacity hover:opacity-90"
            >
              Apply to Calculator
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
