import { sumBy } from './format.js';

const STORAGE_KEY = 'anggaranku.household.v1';
export const WEEKS_PER_MONTH = 4.33;

export function createDemoState() {
  return {
    household: {
      label: 'Contoh keluarga',
      name: 'Keluarga Budi & Sari',
      members: 4,
      memberNote: '2 dewasa, 2 anak sekolah',
      monthlyIncome: 8500000,
      monthlySavingsTarget: 570000,
      weekLabel: 'Minggu ke-4 November 2026 (23–29 Nov)',
      monthLabel: 'November 2026',
    },
    envelopes: [
      {
        id: 'belanja',
        name: 'Belanja Dapur & Pasar',
        subtitle: 'Beras, lauk pauk, sayur, minyak & susu',
        limit: 450000,
        transactions: [
          { id: 'tx-1', date: '23 Nov', note: 'Beras 5 kg, minyak 2 L & bumbu dapur', amount: 151000 },
          { id: 'tx-2', date: '24 Nov', note: 'Telur 2 kg, ayam 2 kg & sayuran segar', amount: 164000 },
        ],
      },
      {
        id: 'transport',
        name: 'Transportasi & BBM',
        subtitle: 'Bensin harian, parkir & antar sekolah',
        limit: 160000,
        transactions: [
          { id: 'tx-3', date: '23 Nov', note: 'Isi BBM motor kerja & antar anak', amount: 65000 },
          { id: 'tx-4', date: '26 Nov', note: 'Parkir stasiun & bensin tambahan', amount: 45000 },
        ],
      },
      {
        id: 'anak',
        name: 'Uang Saku & Bekal Anak',
        subtitle: 'Jajan sehat & keperluan 2 anak sekolah',
        limit: 150000,
        transactions: [
          { id: 'tx-5', date: '23 Nov', note: 'Uang saku minggu ke-4 (2 anak)', amount: 75000 },
          { id: 'tx-6', date: '25 Nov', note: 'Roti tawar, selai & bahan bekal', amount: 30000 },
        ],
      },
      {
        id: 'makan-luar',
        name: 'Makan Luar & Jajan',
        subtitle: 'Kuliner keluarga & camilan sore',
        limit: 100000,
        transactions: [
          { id: 'tx-7', date: '25 Nov', note: 'Soto ayam keluarga pulang les', amount: 55000 },
          { id: 'tx-8', date: '27 Nov', note: 'Martabak manis & teh hangat', amount: 30000 },
        ],
      },
      {
        id: 'rumah',
        name: 'Rumah Tangga & Kebersihan',
        subtitle: 'Gas elpiji 3 kg, galon air & sabun cuci',
        limit: 80000,
        transactions: [
          { id: 'tx-9', date: '24 Nov', note: 'Gas elpiji 3 kg & isi ulang 2 galon', amount: 45000 },
        ],
      },
      {
        id: 'cadangan',
        name: 'Kesehatan & Cadangan',
        subtitle: 'Vitamin, obat ringan & dana tak terduga',
        limit: 60000,
        transactions: [
          { id: 'tx-10', date: '26 Nov', note: 'Vitamin anak & plester P3K', amount: 15000 },
        ],
      },
    ],
    bills: [
      { id: 'bill-1', day: 2, name: 'Kontrakan Rumah', category: 'Hunian', amount: 1350000, paid: true },
      { id: 'bill-2', day: 5, name: 'SPP & Les 2 Anak', category: 'Pendidikan', amount: 450000, paid: true },
      { id: 'bill-3', day: 12, name: 'Listrik PLN', category: 'Utilitas', amount: 265000, paid: true },
      { id: 'bill-4', day: 15, name: 'Air PDAM', category: 'Utilitas', amount: 85000, paid: true },
      { id: 'bill-5', day: 20, name: 'Internet Rumah & Data', category: 'Komunikasi', amount: 230000, paid: false },
      { id: 'bill-6', day: 25, name: 'BPJS Kesehatan (4 jiwa)', category: 'Kesehatan', amount: 120000, paid: false },
    ],
    debts: [
      { id: 'debt-1', name: 'Kredit Motor Harian', balance: 6400000, apr: 14, minPayment: 550000 },
      { id: 'debt-2', name: 'Cicilan Laptop Sekolah', balance: 2700000, apr: 18, minPayment: 350000 },
      { id: 'debt-3', name: 'Pinjaman Koperasi Kantor', balance: 1800000, apr: 9, minPayment: 200000 },
    ],
    debtConfig: {
      extraMonthly: 200000,
      strategy: 'avalanche',
    },
    shopping: [
      { id: 'shop-1', name: 'Beras Pandan Wangi', category: 'Sembako', qty: 1, unit: 'sak 5 kg', price: 74000, checked: true },
      { id: 'shop-2', name: 'Telur Ayam Negeri', category: 'Protein', qty: 2, unit: 'kg', price: 29000, checked: true },
      { id: 'shop-3', name: 'Dada & Paha Ayam', category: 'Protein', qty: 2, unit: 'kg', price: 36000, checked: true },
      { id: 'shop-4', name: 'Minyak Goreng Pouch', category: 'Sembako', qty: 1, unit: '2 L', price: 37000, checked: true },
      { id: 'shop-5', name: 'Bayam, Wortel & Tomat', category: 'Sayur & Buah', qty: 1, unit: 'paket', price: 34000, checked: true },
      { id: 'shop-6', name: 'Tempe, Tahu & Bumbu', category: 'Protein', qty: 1, unit: 'paket', price: 40000, checked: true },
      { id: 'shop-7', name: 'Ikan Kembung Segar', category: 'Protein', qty: 1, unit: 'kg', price: 42000, checked: false },
      { id: 'shop-8', name: 'Susu UHT Anak', category: 'Anak', qty: 2, unit: 'karton', price: 21000, checked: false },
      { id: 'shop-9', name: 'Pisang & Pepaya', category: 'Sayur & Buah', qty: 2, unit: 'kg', price: 17000, checked: false },
    ],
  };
}

let state = loadInitialState();

function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.envelopes) && Array.isArray(parsed.bills) && Array.isArray(parsed.debts) && Array.isArray(parsed.shopping)) {
        return parsed;
      }
    }
  } catch {
    /* Abaikan jika penyimpanan lokal tidak tersedia. */
  }
  return createDemoState();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Abaikan jika kuota penyimpanan penuh. */
  }
}

export function getState() {
  return state;
}

export function getEnvelopeTotals(envelope) {
  const spent = sumBy(envelope.transactions, (t) => t.amount);
  const remaining = envelope.limit - spent;
  const pct = envelope.limit > 0 ? Math.round((spent / envelope.limit) * 100) : 0;
  return { spent, remaining, pct };
}

export function getBudgetSummary() {
  const weeklyBudget = sumBy(state.envelopes, (e) => e.limit);
  const weeklySpent = sumBy(state.envelopes, (e) => sumBy(e.transactions, (t) => t.amount));
  const weeklyRemaining = weeklyBudget - weeklySpent;
  const monthlyEnvelopeEquiv = Math.round(weeklyBudget * WEEKS_PER_MONTH);
  const totalBills = sumBy(state.bills, (b) => b.amount);
  const paidBills = sumBy(state.bills.filter((b) => b.paid), (b) => b.amount);
  const unpaidBills = totalBills - paidBills;
  const totalDebt = sumBy(state.debts, (d) => d.balance);
  const totalMinDebt = sumBy(state.debts.filter((d) => d.balance > 0), (d) => d.minPayment);
  const savingsResidual = state.household.monthlyIncome - monthlyEnvelopeEquiv - totalBills - totalMinDebt;
  return {
    weeklyBudget,
    weeklySpent,
    weeklyRemaining,
    monthlyEnvelopeEquiv,
    totalBills,
    paidBills,
    unpaidBills,
    totalDebt,
    totalMinDebt,
    savingsResidual,
  };
}

export function getShoppingSummary() {
  let checkedTotal = 0;
  let pendingTotal = 0;
  let checkedCount = 0;
  for (const item of state.shopping) {
    const subtotal = item.qty * item.price;
    if (item.checked) {
      checkedTotal += subtotal;
      checkedCount += 1;
    } else {
      pendingTotal += subtotal;
    }
  }
  const kitchenEnv = state.envelopes.find((e) => e.id === 'belanja') ?? state.envelopes[0];
  const envTotals = kitchenEnv ? getEnvelopeTotals(kitchenEnv) : { spent: 0, remaining: 0, pct: 0 };
  return {
    totalItems: state.shopping.length,
    checkedCount,
    pendingCount: state.shopping.length - checkedCount,
    checkedTotal,
    pendingTotal,
    grandTotal: checkedTotal + pendingTotal,
    envelopeLimit: kitchenEnv ? kitchenEnv.limit : 0,
    envelopeSpent: envTotals.spent,
    envelopeRemaining: envTotals.remaining,
  };
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function addEnvelopeExpense(envelopeId, amount, note, date = 'Hari ini') {
  const env = state.envelopes.find((e) => e.id === envelopeId);
  const cleanAmount = Math.round(Number(amount));
  if (!env || !Number.isFinite(cleanAmount) || cleanAmount <= 0) return false;
  env.transactions.unshift({
    id: makeId('tx'),
    date: date.trim() || 'Hari ini',
    note: note.trim() || `Pengeluaran ${env.name}`,
    amount: cleanAmount,
  });
  persist();
  return true;
}

export function removeEnvelopeExpense(envelopeId, txId) {
  const env = state.envelopes.find((e) => e.id === envelopeId);
  if (!env) return false;
  const idx = env.transactions.findIndex((t) => t.id === txId);
  if (idx === -1) return false;
  env.transactions.splice(idx, 1);
  persist();
  return true;
}

export function updateEnvelopeLimit(envelopeId, newLimit) {
  const env = state.envelopes.find((e) => e.id === envelopeId);
  const clean = Math.round(Number(newLimit));
  if (!env || !Number.isFinite(clean) || clean <= 0) return false;
  env.limit = clean;
  persist();
  return true;
}

export function toggleBillPaid(billId) {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return null;
  bill.paid = !bill.paid;
  persist();
  return bill.paid;
}

export function addBill({ name, day, category, amount }) {
  const cleanDay = Math.min(31, Math.max(1, Math.round(Number(day))));
  const cleanAmount = Math.round(Number(amount));
  if (!name.trim() || !Number.isFinite(cleanAmount) || cleanAmount <= 0) return false;
  state.bills.push({
    id: makeId('bill'),
    day: cleanDay,
    name: name.trim(),
    category: category || 'Lainnya',
    amount: cleanAmount,
    paid: false,
  });
  state.bills.sort((a, b) => a.day - b.day);
  persist();
  return true;
}

export function removeBill(billId) {
  const idx = state.bills.findIndex((b) => b.id === billId);
  if (idx === -1) return false;
  state.bills.splice(idx, 1);
  persist();
  return true;
}

export function setDebtStrategy(strategy) {
  if (strategy !== 'avalanche' && strategy !== 'snowball') return;
  state.debtConfig.strategy = strategy;
  persist();
}

export function setDebtExtraMonthly(extra) {
  const clean = Math.max(0, Math.round(Number(extra) || 0));
  state.debtConfig.extraMonthly = clean;
  persist();
}

export function recordDebtPayment(debtId, amount) {
  const debt = state.debts.find((d) => d.id === debtId);
  const clean = Math.round(Number(amount));
  if (!debt || !Number.isFinite(clean) || clean <= 0 || debt.balance <= 0) return false;
  debt.balance = Math.max(0, debt.balance - clean);
  persist();
  return true;
}

export function addDebt({ name, balance, apr, minPayment }) {
  const cleanBal = Math.round(Number(balance));
  const cleanApr = Math.max(0, Number(apr));
  const cleanMin = Math.round(Number(minPayment));
  if (!name.trim() || !Number.isFinite(cleanBal) || cleanBal <= 0 || !Number.isFinite(cleanMin) || cleanMin <= 0) {
    return false;
  }
  state.debts.push({
    id: makeId('debt'),
    name: name.trim(),
    balance: cleanBal,
    apr: Number.isFinite(cleanApr) ? cleanApr : 0,
    minPayment: cleanMin,
  });
  persist();
  return true;
}

export function removeDebt(debtId) {
  const idx = state.debts.findIndex((d) => d.id === debtId);
  if (idx === -1) return false;
  state.debts.splice(idx, 1);
  persist();
  return true;
}

export function toggleShoppingItem(itemId) {
  const item = state.shopping.find((i) => i.id === itemId);
  if (!item) return null;
  item.checked = !item.checked;
  persist();
  return item.checked;
}

export function stepShoppingQty(itemId, delta) {
  const item = state.shopping.find((i) => i.id === itemId);
  if (!item) return false;
  item.qty = Math.max(1, item.qty + delta);
  persist();
  return true;
}

export function addShoppingItem({ name, category, qty, unit, price }) {
  const cleanQty = Math.max(1, Math.round(Number(qty) || 1));
  const cleanPrice = Math.round(Number(price));
  if (!name.trim() || !Number.isFinite(cleanPrice) || cleanPrice <= 0) return false;
  state.shopping.push({
    id: makeId('shop'),
    name: name.trim(),
    category: category || 'Sembako',
    qty: cleanQty,
    unit: (unit || 'pcs').trim(),
    price: cleanPrice,
    checked: false,
  });
  persist();
  return true;
}

export function removeShoppingItem(itemId) {
  const idx = state.shopping.findIndex((i) => i.id === itemId);
  if (idx === -1) return false;
  state.shopping.splice(idx, 1);
  persist();
  return true;
}

export function syncShoppingToEnvelope() {
  const kitchenEnv = state.envelopes.find((e) => e.id === 'belanja');
  if (!kitchenEnv) return false;
  const checkedTotal = sumBy(state.shopping.filter((i) => i.checked), (i) => i.qty * i.price);
  const currentSpent = sumBy(kitchenEnv.transactions, (t) => t.amount);
  const delta = checkedTotal - currentSpent;
  if (delta === 0) return false;
  if (delta > 0) {
    kitchenEnv.transactions.unshift({
      id: makeId('tx'),
      date: 'Hari ini',
      note: 'Sinkronisasi item tercentang daftar belanja',
      amount: delta,
    });
  } else {
    kitchenEnv.transactions = checkedTotal > 0
      ? [{ id: makeId('tx'), date: 'Hari ini', note: 'Penyesuaian total daftar belanja tercentang', amount: checkedTotal }]
      : [];
  }
  persist();
  return true;
}

export function resetDemoData() {
  state = createDemoState();
  persist();
}
