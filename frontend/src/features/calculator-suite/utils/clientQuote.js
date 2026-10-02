import {
  pageTypes,
  projectTypes,
  revisions,
  features as featureCatalog,
} from "@/features/calculator-suite/config/pricingConfig";
import { getPaymentMilestones } from "@/features/calculator-suite/utils/paymentStructure";
import {
  CADENCE_SUFFIX,
  computeOptionalServices,
} from "@/features/calculator-suite/utils/optionalServices";

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildDeliverables(draft) {
  const items = [];

  const projectType = projectTypes.find((p) => p.id === draft.projectTypeId);
  if (projectType) {
    items.push(
      `${projectType.label} — full project setup, responsive design foundation, and deployment`,
    );
  }

  const pageLabels = draft.selectedPages
    .filter((sel) => sel.quantity > 0)
    .map((sel) => {
      const pageType = pageTypes.find((p) => p.id === sel.pageTypeId);
      if (!pageType) return null;
      return sel.quantity > 1
        ? `${pageType.label} (×${sel.quantity})`
        : pageType.label;
    })
    .filter(Boolean);

  const customLabels = draft.customPages
    .filter((p) => p.name.trim())
    .map((p) => (p.quantity > 1 ? `${p.name} (×${p.quantity})` : p.name));

  const allPages = [...pageLabels, ...customLabels];
  if (allPages.length > 0) {
    items.push(`Pages: ${allPages.join(", ")}`);
  }

  const featureLabels = draft.selectedFeatureIds
    .map((id) => featureCatalog.find((f) => f.id === id)?.label)
    .filter(Boolean);
  if (featureLabels.length > 0) {
    items.push(...featureLabels);
  }

  return items;
}

/**
 * Transforms a saved QuoteRecord into the shape the client-facing document
 * renders. Internal pricing mechanics (multipliers, contingency %, effective
 * hourly rate) are deliberately left out — only the final numbers a client
 * should see are included.
 */
export function buildClientQuoteData(record, branding) {
  const { draft, pricing } = record;
  const totalIncludedRounds =
    revisions.includedRounds + draft.additionalRevisionRounds;
  const validUntil = addDays(record.createdAt, branding.defaultValidityDays);
  const milestones = getPaymentMilestones(
    draft.paymentStructure,
    pricing.recommendedQuote,
  );
  const optional = computeOptionalServices(
    draft,
    pricing.effectiveHourlyRate ?? 0,
  );
  const optionalServices = [];
  if (optional.maintenance) {
    optionalServices.push(
      `${optional.maintenance.label}: ${optional.maintenance.cost.toFixed(0)} ${pricing.currency}/${CADENCE_SUFFIX[optional.maintenance.cadence]} — ${optional.maintenance.description}`,
    );
  }
  for (const item of optional.oneTimeItems) {
    optionalServices.push(
      `${item.label}: ${item.price} ${item.currency} one-time`,
    );
  }
  for (const item of optional.monthlyItems) {
    optionalServices.push(
      `${item.label}: ${item.price} ${item.currency}/month`,
    );
  }
  for (const item of optional.annualItems) {
    optionalServices.push(`${item.label}: ${item.price} ${item.currency}/year`);
  }

  return {
    quoteNumber: record.quoteNumber,
    dateIssued: formatDate(record.createdAt),
    validUntil: formatDate(validUntil),
    freelancer: {
      name: branding.companyOrFreelancerName,
      tagline: branding.tagline,
      email: branding.email,
      phone: branding.phone,
      website: branding.website,
      address: branding.address,
      logoDataUrl: branding.logoDataUrl,
    },
    client: {
      name: record.clientName,
    },
    projectTitle: record.projectTitle,
    deliverables: buildDeliverables(draft),
    timeline: pricing.estimatedWeeksRange,
    pricing: {
      total: pricing.recommendedQuote,
      currency: pricing.currency,
    },
    milestones,
    optionalServices,
    revisionPolicy: `${totalIncludedRounds} round${totalIncludedRounds === 1 ? "" : "s"} of revisions included. Additional rounds billed at the standard hourly rate.`,
    terms: branding.defaultTermsAndConditions,
    paymentDetails: branding.paymentDetails,
  };
}
