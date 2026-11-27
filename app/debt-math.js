export function simulateDebtPayoff(debts, extraMonthly = 0, strategy = 'avalanche') {
  const activeDebts = debts.filter((d) => d.balance > 0 && d.minPayment > 0);
  const initialTotal = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  if (activeDebts.length === 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, series: [{ month: 0, balance: 0 }], payoffMonths: {} };
  }

  const state = activeDebts.map((d) => ({
    id: d.id,
    balance: Math.round(d.balance),
    apr: Number(d.apr) || 0,
    minPayment: Math.round(d.minPayment),
    paidOffMonth: null,
  }));

  const fixedMonthlyBudget = state.reduce((sum, d) => sum + d.minPayment, 0) + Math.max(0, Math.round(extraMonthly));
  const series = [{ month: 0, balance: initialTotal }];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const maxMonths = 120;

  while (state.some((d) => d.balance > 0) && month < maxMonths) {
    month += 1;
    for (const debt of state) {
      if (debt.balance <= 0) continue;
      const interest = Math.round((debt.balance * (debt.apr / 100)) / 12);
      debt.balance += interest;
      totalInterest += interest;
    }

    let remainingPool = fixedMonthlyBudget;
    for (const debt of state) {
      if (debt.balance <= 0) continue;
      const pay = Math.min(debt.balance, debt.minPayment, remainingPool);
      debt.balance -= pay;
      remainingPool -= pay;
      totalPaid += pay;
      if (debt.balance === 0 && debt.paidOffMonth === null) debt.paidOffMonth = month;
    }

    const prioritized = state
      .filter((d) => d.balance > 0)
      .sort((a, b) => (strategy === 'snowball' ? a.balance - b.balance : b.apr - a.apr));

    for (const debt of prioritized) {
      if (remainingPool <= 0) break;
      const pay = Math.min(debt.balance, remainingPool);
      debt.balance -= pay;
      remainingPool -= pay;
      totalPaid += pay;
      if (debt.balance === 0 && debt.paidOffMonth === null) debt.paidOffMonth = month;
    }

    const endBalance = state.reduce((sum, d) => sum + d.balance, 0);
    series.push({ month, balance: endBalance });
  }

  const payoffMonths = {};
  for (const d of state) payoffMonths[d.id] = d.paidOffMonth ?? maxMonths;

  return {
    months: month,
    totalInterest,
    totalPaid,
    series,
    payoffMonths,
    monthlyOutlay: fixedMonthlyBudget,
  };
}

export function monthlyInterestOf(debt) {
  return Math.round((debt.balance * (debt.apr / 100)) / 12);
}
