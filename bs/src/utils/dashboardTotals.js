export function calculateYearlyPurchases(purchases = [], supplierPayments = [], bsYear, yearStart, yearEnd) {
  const purchasesThisYear = purchases.filter((p) => {
    const d = new Date(p.date);
    return d >= yearStart && (!yearEnd || d < yearEnd);
  });
  const purchaseCost = purchasesThisYear.reduce((s, p) => s + Number(p.totalValue || 0), 0);

  const paymentsThisYear = supplierPayments.filter((p) => {
    const d = new Date(p.date);
    return d >= yearStart && (!yearEnd || d < yearEnd);
  });
  const amountPaid = paymentsThisYear.reduce((s, p) => s + Number(p.amount || 0), 0);
  const amountToBePaid = Math.max(0, purchaseCost - amountPaid);
  const paidRatio = purchaseCost > 0 ? Math.min(1, amountPaid / purchaseCost) : 0;

  return {
    year: bsYear,
    purchaseCost,
    amountPaid,
    amountToBePaid,
    paidRatio
  };
}

export function calculateYearlyCost(purchases = [], remunerations = [], noSalaryIds = new Set(), yearStart, yearEnd) {
  const purchasesThisYear = purchases.filter((p) => {
    const d = new Date(p.date);
    return d >= yearStart && (!yearEnd || d < yearEnd);
  });
  const purchaseCost = purchasesThisYear.reduce((s, p) => s + Number(p.totalValue || 0), 0);
  const staffCost = remunerations
    .filter((r) => {
      const d = new Date(r.date);
      return !noSalaryIds.has(r.staff_id) && d >= yearStart && (!yearEnd || d < yearEnd);
    })
    .reduce((s, r) => s + Number(r.amount || 0), 0);
  return purchaseCost + staffCost;
}

export function calculateAllTimeSummary({
  revenueTotal = 0,
  recoveredTotal = 0,
  purchases = [],
  remunerations = [],
  noSalaryIds = new Set(),
  supplierPayments = [],
  staffPayments = [],
  customerOpeningNet = 0,
  supplierOpeningNet = 0,
  staffOpeningNet = 0
}) {
  const totalRevenue = Number(revenueTotal || 0);
  const totalPurchases = purchases.reduce((s, p) => s + Number(p.totalValue || 0), 0);
  const totalStaffCost = remunerations
    .filter((r) => !noSalaryIds.has(r.staff_id))
    .reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalCost = totalPurchases + totalStaffCost;

  const amountToBeRecovered = Math.max(0, totalRevenue - Number(recoveredTotal || 0) + customerOpeningNet);

  const totalSupplierPaid = supplierPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalStaffPaid = staffPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const amountPaid = totalSupplierPaid + totalStaffPaid;

  const supplierPayable = Math.max(0, totalPurchases - totalSupplierPaid + supplierOpeningNet);
  const totalStaffEarned = remunerations.reduce((s, r) => s + Number(r.amount || 0), 0);
  const staffPayable = Math.max(0, totalStaffEarned - totalStaffPaid + staffOpeningNet);
  const amountToBePaid = supplierPayable + staffPayable;

  return {
    totalRevenue,
    totalCost,
    amountToBeRecovered,
    amountPaid,
    amountToBePaid
  };
}
