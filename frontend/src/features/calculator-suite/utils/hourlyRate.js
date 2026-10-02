/**
 * Working hours != billable hours. This walks: income target -> business
 * costs -> tax gross-up -> minimum rate -> margin -> recommended rate,
 * with every intermediate number preserved so the UI can show its work.
 */
export function calculateHourlyRate(profile) {
  const {
    desiredMonthlyIncomeUsd,
    monthlyExpensesUsd,
    equipmentMonthlyUsd,
    workspaceMonthlyUsd,
    taxRatePercent,
    profitMarginPercent,
    workingHoursPerMonth,
    billableHoursPerMonth,
  } = profile;

  const totalMonthlyCosts =
    monthlyExpensesUsd + equipmentMonthlyUsd + workspaceMonthlyUsd;
  const requiredMonthlyRevenue = desiredMonthlyIncomeUsd + totalMonthlyCosts;

  const taxRate = Math.min(Math.max(taxRatePercent, 0), 95) / 100;
  const requiredMonthlyRevenueAfterTax = requiredMonthlyRevenue / (1 - taxRate);

  const safeBillableHours = Math.max(billableHoursPerMonth, 1);
  const minimumHourlyRate = requiredMonthlyRevenueAfterTax / safeBillableHours;

  const margin = Math.max(profitMarginPercent, 0) / 100;
  const recommendedHourlyRate = minimumHourlyRate * (1 + margin);

  const nonBillableHoursPerMonth = Math.max(
    workingHoursPerMonth - billableHoursPerMonth,
    0,
  );
  const billableRatioPercent =
    workingHoursPerMonth > 0
      ? (billableHoursPerMonth / workingHoursPerMonth) * 100
      : 0;

  const steps = [
    { label: "Desired monthly income", value: desiredMonthlyIncomeUsd },
    {
      label: "Monthly business costs",
      value: totalMonthlyCosts,
      note: "Software + equipment + workspace/internet",
    },
    { label: "Required monthly revenue", value: requiredMonthlyRevenue },
    {
      label: `Grossed up for ${taxRatePercent}% tax`,
      value: requiredMonthlyRevenueAfterTax,
    },
    {
      label: `÷ ${billableHoursPerMonth} billable hours/month`,
      value: minimumHourlyRate,
      note: "Minimum sustainable hourly rate",
    },
    {
      label: `+ ${profitMarginPercent}% target margin`,
      value: recommendedHourlyRate,
      note: "Recommended hourly rate",
    },
  ];

  return {
    totalMonthlyCosts,
    requiredMonthlyRevenue,
    requiredMonthlyRevenueAfterTax,
    minimumHourlyRate,
    recommendedHourlyRate,
    nonBillableHoursPerMonth,
    billableRatioPercent,
    steps,
  };
}
