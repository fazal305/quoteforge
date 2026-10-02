export const PAYMENT_STRUCTURE_LABELS = {
  "100_upfront": "100% Upfront",
  "50_50": "50 / 50",
  "30_40_30": "30 / 40 / 30",
  custom: "Custom Milestones",
};

export function getPaymentMilestones(structure, total) {
  switch (structure) {
    case "100_upfront":
      return [{ label: "Due at start", percent: 100, amount: total }];
    case "50_50":
      return [
        {
          label: "Deposit (before work begins)",
          percent: 50,
          amount: total * 0.5,
        },
        {
          label: "Final payment (on delivery)",
          percent: 50,
          amount: total * 0.5,
        },
      ];
    case "30_40_30":
      return [
        {
          label: "Deposit (before work begins)",
          percent: 30,
          amount: total * 0.3,
        },
        {
          label: "Milestone payment (midpoint)",
          percent: 40,
          amount: total * 0.4,
        },
        {
          label: "Final payment (on delivery)",
          percent: 30,
          amount: total * 0.3,
        },
      ];
    case "custom":
      return [
        {
          label: "Milestones defined in the client-facing quote",
          percent: 100,
          amount: total,
        },
      ];
    default:
      return [];
  }
}
