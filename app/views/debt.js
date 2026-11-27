import { renderPageHeader } from '../components.js';
import { monthlyInterestOf, simulateDebtPayoff } from '../debt-math.js';
import { escapeHtml, formatIDR, formatPercent } from '../format.js';
import {
  addDebt,
  getBudgetSummary,
  getState,
  recordDebtPayment,
  removeDebt,
  setDebtExtraMonthly,
  setDebtStrategy,
} from '../state.js';
import { renderDebtPayoffChart } from '../svg-charts.js';

export const title = 'Pelacak Utang';

const EXTRA_PRESETS = [0, 150000, 200000, 350000, 570000];

export function render() {
  const state = getState();
  const summary = getBudgetSummary();
  const { extraMonthly, strategy } = state.debtConfig;

  const baseSim = simulateDebtPayoff(state.debts, 0, strategy);
  const extraSim = simulateDebtPayoff(state.debts, extraMonthly, strategy);
  const monthsSaved = Math.max(0, baseSim.months - extraSim.months);
  const interestSaved = Math.max(0, baseSim.totalInterest - extraSim.totalInterest);
  const savingsLeftAfterExtra = state.household.monthlySavingsTarget - extraMonthly;

  const debtCards = state.debts
    .map((d) => {
      const mInterest = monthlyInterestOf(d);
      const payoffM = d.balance === 0 ? 0 : extraSim.payoffMonths[d.id] ?? extraSim.months;
      const isPaidOff = d.balance <= 0;
      const defaultPay = Math.min(d.balance, d.minPayment);
      const defaultPlaceholder = formatIDR(defaultPay).replace(/^Rp/, '');
      return `<article class="card" style="padding:16px;">
        <div class="card-title-row">
          <h3>${escapeHtml(d.name)}</h3>
          <span class="badge ${isPaidOff ? 'badge-ok' : 'badge-warn'} num">${isPaidOff ? 'Lunas' : `Bunga ${String(d.apr).replace('.', ',')}%/thn`}</span>
        </div>
        <div class="kpi-value num">${formatIDR(d.balance)}</div>
        <div class="envelope-meta num" style="margin:6px 0 10px;">
          Cicilan minimum: <strong>${formatIDR(d.minPayment)}/bln</strong> · Bunga bulan ini: <strong>${formatIDR(mInterest)}</strong>
        </div>
        <div class="envelope-meta num" style="margin-bottom:10px;">
          ${isPaidOff ? 'Saldo sudah Rp0.' : `Proyeksi lunas (${strategy === 'avalanche' ? 'Avalanche' : 'Snowball'}): <strong>bulan ke-${payoffM}</strong>`}
        </div>
        <div class="row-actions" style="justify-content:space-between;">
          ${isPaidOff ? '<span class="badge badge-ok">Terlunasi</span>' : `<form class="inline-edit-box" data-form="pay-debt" data-id="${escapeHtml(d.id)}">
            <input type="number" name="amount" min="10000" step="10000" placeholder="Contoh: ${escapeHtml(defaultPlaceholder)}" aria-label="Bayar ${escapeHtml(d.name)}">
            <button type="submit" class="btn-primary">Bayar</button>
          </form>`}
          <button type="button" class="btn-danger-ghost" data-action="del-debt" data-id="${escapeHtml(d.id)}">Hapus</button>
        </div>
      </article>`;
    })
    .join('');

  const presetBtns = EXTRA_PRESETS.map(
    (val) => `<button type="button" class="btn-outline ${extraMonthly === val ? 'is-selected' : ''}" data-action="preset-extra" data-val="${val}">
      +${formatIDR(val)}
    </button>`,
  ).join('');

  return `${renderPageHeader('Pelacak & Simulasi Pelunasan Utang', 'Uji dampak pembayaran ekstra bulanan terhadap waktu lunas dan penghematan bunga', state.household)}

  <section class="kpi-strip" aria-label="Ringkasan utang keluarga">
    <div class="kpi-box">
      <div class="kpi-label">Total Sisa Utang</div>
      <div class="kpi-value num">${formatIDR(summary.totalDebt)}</div>
      <div class="kpi-note">${state.debts.filter((d) => d.balance > 0).length} pinjaman aktif</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Cicilan Minimum Total</div>
      <div class="kpi-value num">${formatIDR(summary.totalMinDebt)}/bln</div>
      <div class="kpi-note num">${formatPercent(summary.totalMinDebt, state.household.monthlyIncome)} dari penghasilan</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Tanpa Ekstra vs +${formatIDR(extraMonthly)}</div>
      <div class="kpi-value num">${extraSim.months} bln <span style="font-size:0.86rem;font-weight:600;color:var(--ink-500);">(dari ${baseSim.months} bln)</span></div>
      <div class="kpi-note" style="color:var(--forest-800);font-weight:600;">Lebih cepat ${monthsSaved} bulan</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Estimasi Hemat Bunga</div>
      <div class="kpi-value num" style="color:var(--forest-800);">${formatIDR(interestSaved)}</div>
      <div class="kpi-note num">Total bunga turun dari ${formatIDR(baseSim.totalInterest)} ke ${formatIDR(extraSim.totalInterest)}</div>
    </div>
  </section>

  <section class="card" aria-label="Simulator pembayaran ekstra">
    <div class="card-title-row">
      <h2>Simulasi Pembayaran Ekstra & Proyeksi Saldo</h2>
      <div class="preset-row">
        <button type="button" class="btn-outline ${strategy === 'avalanche' ? 'is-selected' : ''}" data-action="strategy" data-val="avalanche">Avalanche (Bunga Tertinggi)</button>
        <button type="button" class="btn-outline ${strategy === 'snowball' ? 'is-selected' : ''}" data-action="strategy" data-val="snowball">Snowball (Saldo Terkecil)</button>
      </div>
    </div>

    <div class="sim-controls" style="margin-bottom:14px;">
      <div class="range-wrap">
        <label for="extra-slider" style="font-size:0.86rem;font-weight:600;">Ekstra per bulan:</label>
        <input id="extra-slider" type="range" min="0" max="800000" step="25000" value="${Math.min(800000, extraMonthly)}">
        <strong class="num" id="extra-readout" style="min-width:110px;">+${formatIDR(extraMonthly)}</strong>
      </div>
      <div class="preset-row">${presetBtns}</div>
    </div>

    <p class="envelope-meta num" style="margin:0 0 12px;">
      Total alokasi cicilan simulasi: <strong>${formatIDR(summary.totalMinDebt + extraMonthly)}/bln</strong> ·
      ${savingsLeftAfterExtra >= 0
        ? `Dari pos Tabungan & Cadangan (${formatIDR(state.household.monthlySavingsTarget)}/bln), tersisa <strong>${formatIDR(savingsLeftAfterExtra)}/bln</strong> untuk dana darurat.`
        : `<span style="color:var(--amber-600);font-weight:600;">Melebihi pos Tabungan/Cadangan sebesar ${formatIDR(Math.abs(savingsLeftAfterExtra))}/bln.</span>`}
      Metode otomatis mengalihkan cicilan minimum utang yang lunas ke prioritas berikutnya.
    </p>

    ${renderDebtPayoffChart(baseSim.series, extraSim.series)}

    <div class="envelope-meta" style="display:flex;flex-wrap:wrap;gap:16px;margin-top:8px;">
      <span><span class="legend-dot" style="background:#b85d2b;"></span>Garis putus: Minimum saja (${baseSim.months} bln · bunga ${formatIDR(baseSim.totalInterest)})</span>
      <span><span class="legend-dot" style="background:#1d4a36;"></span>Garis hijau: Dengan ekstra +${formatIDR(extraMonthly)}/bln (${extraSim.months} bln · bunga ${formatIDR(extraSim.totalInterest)})</span>
    </div>
  </section>

  <section aria-label="Daftar pinjaman aktif">
    <div class="card-title-row">
      <h2>Daftar Utang & Catat Pembayaran</h2>
    </div>
    <div class="grid-3">${debtCards}</div>
  </section>

  <section class="card" aria-label="Tambah utang baru">
    <div class="card-title-row">
      <h2>Tambah Pinjaman / Cicilan Baru</h2>
    </div>
    <form id="add-debt-form" class="form-grid">
      <label class="field">
        <span>Nama Pinjaman</span>
        <input type="text" name="name" placeholder="Contoh: Cicilan Kulkas" required>
      </label>
      <label class="field">
        <span>Sisa Saldo (Rp)</span>
        <input type="number" name="balance" min="50000" step="10000" placeholder="Contoh: 1.500.000" required>
      </label>
      <label class="field">
        <span>Bunga (%/tahun)</span>
        <input type="number" name="apr" min="0" max="60" step="0.5" value="12" required>
      </label>
      <label class="field">
        <span>Minimum/Bln (Rp)</span>
        <input type="number" name="minPayment" min="25000" step="5000" placeholder="Contoh: 150.000" required>
      </label>
      <div style="grid-column:1 / -1;">
        <button type="submit" class="btn-primary">Tambahkan ke Pelacak Utang</button>
      </div>
    </form>
  </section>`;
}

export function mount(root, { rerender, notify }) {
  const slider = root.querySelector('#extra-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      const readout = root.querySelector('#extra-readout');
      if (readout) readout.textContent = `+${formatIDR(slider.value)}`;
    });
    slider.addEventListener('change', () => {
      setDebtExtraMonthly(slider.value);
      rerender();
    });
  }

  for (const btn of root.querySelectorAll('[data-action="preset-extra"]')) {
    btn.addEventListener('click', () => {
      setDebtExtraMonthly(btn.getAttribute('data-val'));
      rerender();
    });
  }

  for (const btn of root.querySelectorAll('[data-action="strategy"]')) {
    btn.addEventListener('click', () => {
      setDebtStrategy(btn.getAttribute('data-val'));
      notify(`Strategi diubah ke ${btn.getAttribute('data-val') === 'avalanche' ? 'Avalanche' : 'Snowball'}.`);
      rerender();
    });
  }

  for (const payForm of root.querySelectorAll('[data-form="pay-debt"]')) {
    payForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const id = payForm.getAttribute('data-id');
      const rawAmt = String(new FormData(payForm).get('amount') ?? '').trim();
      let amt = rawAmt;
      if (rawAmt === '') {
        const debt = getState().debts.find((d) => d.id === id);
        if (!debt || debt.balance <= 0) return;
        amt = Math.min(debt.balance, debt.minPayment);
      }
      if (recordDebtPayment(id, amt)) {
        notify('Pembayaran utang dicatat dan saldo diperbarui.');
        rerender();
      }
    });
  }

  for (const delBtn of root.querySelectorAll('[data-action="del-debt"]')) {
    delBtn.addEventListener('click', () => {
      if (removeDebt(delBtn.getAttribute('data-id'))) {
        notify('Pinjaman dihapus dari daftar.');
        rerender();
      }
    });
  }

  const addForm = root.querySelector('#add-debt-form');
  if (addForm) {
    addForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(addForm);
      const ok = addDebt({
        name: String(data.get('name') || ''),
        balance: data.get('balance'),
        apr: data.get('apr'),
        minPayment: data.get('minPayment'),
      });
      if (ok) {
        notify('Pinjaman baru ditambahkan ke simulasi.');
        rerender();
      }
    });
  }
}
