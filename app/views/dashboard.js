import { renderEnvelopeCard, renderPageHeader } from '../components.js';
import { simulateDebtPayoff } from '../debt-math.js';
import { escapeHtml, formatIDR, formatPercent, sumBy } from '../format.js';
import {
  WEEKS_PER_MONTH,
  addEnvelopeExpense,
  getBudgetSummary,
  getShoppingSummary,
  getState,
  toggleBillPaid,
} from '../state.js';
import { renderMonthlyAllocationBar } from '../svg-charts.js';

export const title = 'Ringkasan';

export function render() {
  const state = getState();
  const summary = getBudgetSummary();
  const shop = getShoppingSummary();
  const income = state.household.monthlyIncome;

  const baseDebt = simulateDebtPayoff(state.debts, 0, state.debtConfig.strategy);
  const extraDebt = simulateDebtPayoff(state.debts, state.debtConfig.extraMonthly, state.debtConfig.strategy);
  const savedInterest = Math.max(0, baseDebt.totalInterest - extraDebt.totalInterest);

  const allocSegments = [
    { label: `Amplop (${formatIDR(summary.weeklyBudget)} × ${String(WEEKS_PER_MONTH).replace('.', ',')})`, value: summary.monthlyEnvelopeEquiv, color: '#1d4a36' },
    { label: 'Tagihan Tetap Bulanan', value: summary.totalBills, color: '#387659' },
    { label: 'Cicilan Minimum Utang', value: summary.totalMinDebt, color: '#b85d2b' },
    { label: summary.savingsResidual >= 0 ? 'Tabungan & Ekstra Utang' : 'Selisih Defisit', value: Math.max(0, summary.savingsResidual), color: '#d9a84e' },
  ];

  const envOptions = state.envelopes
    .map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)}</option>`)
    .join('');

  const upcomingBills = state.bills.filter((b) => !b.paid).slice(0, 3);
  const billRows = upcomingBills.length > 0
    ? upcomingBills
        .map(
          (b) => `<div class="row-item" style="padding:8px 10px;">
            <div>
              <strong>${escapeHtml(b.name)}</strong>
              <div class="envelope-meta">Jatuh tempo tgl ${b.day} · ${escapeHtml(b.category)}</div>
            </div>
            <div class="row-actions">
              <span class="num" style="font-weight:700;">${formatIDR(b.amount)}</span>
              <button type="button" class="btn-outline" data-action="dash-pay-bill" data-id="${escapeHtml(b.id)}">Lunas</button>
            </div>
          </div>`,
        )
        .join('')
    : '<p class="envelope-meta" style="margin:6px 0;">Semua tagihan bulan ini sudah lunas.</p>';

  const goals = Array.isArray(state.savingsGoals) ? state.savingsGoals : [];
  const goalMonthlyTotal = sumBy(goals, (g) => g.monthly);
  const goalCards = goals
    .map((g) => {
      const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
      const remaining = Math.max(0, g.target - g.saved);
      const months = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : null;
      return `<div class="card">
        <div class="card-title-row">
          <h3>${escapeHtml(g.name)}</h3>
          <span class="badge badge-ok num">${pct}%</span>
        </div>
        <div class="kpi-value num">${formatIDR(g.saved)} <span style="font-size:0.85rem;color:var(--ink-500);font-weight:500;">dari ${formatIDR(g.target)}</span></div>
        <div class="progress-track" style="margin:10px 0 8px;"><div class="progress-fill-green" style="width:${pct}%"></div></div>
        <p class="envelope-meta num" style="margin:0;">
          Sisa <strong>${formatIDR(remaining)}</strong> · ${formatIDR(g.monthly)}/bln
          ${months !== null ? ` → tercapai dalam <strong>${months} bulan</strong>` : ''}
        </p>
      </div>`;
    })
    .join('');

  return `${renderPageHeader('Ringkasan Amplop Mingguan', `${state.household.name} · ${state.household.weekLabel}`, state.household)}

  <section class="hero-ribbon" aria-label="Saldo amplop dan kesesuaian bulanan">
    <div class="hero-balance-box">
      <div>
        <div class="hero-kicker">Sisa Kas Amplop Minggu Ini (${escapeHtml(state.household.label)})</div>
        <div class="hero-amount num">${formatIDR(summary.weeklyRemaining)}</div>
        <div class="hero-stats num">
          <span>Plafon: <strong>${formatIDR(summary.weeklyBudget)}/mgg</strong></span>
          <span>Terpakai: <strong>${formatIDR(summary.weeklySpent)}</strong> (${formatPercent(summary.weeklySpent, summary.weeklyBudget)})</span>
        </div>
      </div>

      <form class="quick-spend-form" id="dash-quick-spend">
        <label>
          <span>Amplop</span>
          <select name="envelopeId" required>${envOptions}</select>
        </label>
        <label>
          <span>Nominal (Rp)</span>
          <input type="number" name="amount" min="1000" step="1000" placeholder="Contoh: 25.000" required>
        </label>
        <div class="quick-note-row">
          <label>
            <span>Catatan</span>
            <input type="text" name="note" placeholder="Contoh: Beli lauk">
          </label>
          <button type="submit" class="btn-gold">+ Catat</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h2>Kesesuaian Anggaran Bulanan</h2>
        <span class="badge badge-ok num">${formatIDR(income)}/bln</span>
      </div>
      ${renderMonthlyAllocationBar(allocSegments)}
      <div class="reconcile-list">
        ${allocSegments
          .map(
            (seg) => `<div class="reconcile-item">
              <span><span class="legend-dot" style="background:${seg.color};"></span>${escapeHtml(seg.label)}</span>
              <strong class="num">${formatIDR(seg.value)} <span style="color:var(--ink-500);font-weight:500;">(${formatPercent(seg.value, income)})</span></strong>
            </div>`,
          )
          .join('')}
      </div>
      <p class="envelope-meta num" style="margin:12px 0 0;padding-top:8px;border-top:1px dashed var(--cream-300);">
        Total rencana bulanan: <strong>${formatIDR(summary.monthlyEnvelopeEquiv + summary.totalBills + summary.totalMinDebt + Math.max(0, summary.savingsResidual))}</strong>
        ${summary.savingsResidual < 0 ? ` · <span style="color:var(--danger-600);font-weight:700;">Defisit ${formatIDR(Math.abs(summary.savingsResidual))}</span>` : ' · Seluruh penghasilan teralokasi seimbang'}
      </p>
    </div>
  </section>

  <section aria-label="Target tabungan">
    <div class="card-title-row">
      <h2>Target Tabungan</h2>
      <span class="badge badge-ok num">${formatIDR(goalMonthlyTotal)}/bln</span>
    </div>
    <p class="envelope-meta num" style="margin:0 0 12px;">
      Total alokasi ${formatIDR(goalMonthlyTotal)}/bln — sama dengan sisa penghasilan setelah amplop, tagihan, dan cicilan minimum (${formatIDR(summary.savingsResidual)}/bln).
    </p>
    <div class="grid-3">
      ${goalCards}
    </div>
  </section>

  <section aria-label="Progres amplop per kategori">
    <div class="card-title-row">
      <h2>Amplop Mingguan (6 Kategori)</h2>
      <a href="#/amplop" class="btn-outline">Kelola & Riwayat &rarr;</a>
    </div>
    <div class="grid-3">
      ${state.envelopes.map((env) => renderEnvelopeCard(env)).join('')}
    </div>
  </section>

  <section class="grid-3" aria-label="Ringkasan tagihan, utang, dan belanja">
    <div class="card">
      <div class="card-title-row">
        <h3>Kalender Tagihan</h3>
        <a href="#/tagihan">Lihat Kalender &rarr;</a>
      </div>
      <div class="envelope-meta num" style="margin-bottom:8px;">
        Lunas: <strong>${formatIDR(summary.paidBills)}</strong> · Sisa: <strong>${formatIDR(summary.unpaidBills)}</strong>
      </div>
      <div class="table-list">${billRows}</div>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h3>Pelacak Utang</h3>
        <a href="#/utang">Simulasi Ekstra &rarr;</a>
      </div>
      <div class="kpi-value num">${formatIDR(summary.totalDebt)}</div>
      <p class="envelope-meta num" style="margin:6px 0 10px;">
        Cicilan minimum <strong>${formatIDR(summary.totalMinDebt)}/bln</strong>. Dengan ekstra <strong>+${formatIDR(state.debtConfig.extraMonthly)}/bln</strong> (${state.debtConfig.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'}):
      </p>
      <div class="card-muted num" style="padding:10px 12px;font-size:0.84rem;">
        <div>Lunas dalam <strong>${extraDebt.months} bulan</strong> (tanpa ekstra: ${baseDebt.months} bln)</div>
        <div>Hemat bunga: <strong style="color:var(--forest-800);">${formatIDR(savedInterest)}</strong></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h3>Daftar Belanja Mingguan</h3>
        <a href="#/belanja">Buka Daftar &rarr;</a>
      </div>
      <div class="kpi-value num">${shop.checkedCount}/${shop.totalItems} item dibeli</div>
      <p class="envelope-meta num" style="margin:6px 0 10px;">
        Sudah dicentang: <strong>${formatIDR(shop.checkedTotal)}</strong> · Rencana sisa: <strong>${formatIDR(shop.pendingTotal)}</strong>
      </p>
      <div class="card-muted num" style="padding:10px 12px;font-size:0.84rem;">
        <div>Total daftar: <strong>${formatIDR(shop.grandTotal)}</strong></div>
        <div>Plafon Amplop Dapur: <strong>${formatIDR(shop.envelopeLimit)}</strong> (${shop.grandTotal <= shop.envelopeLimit ? `cadangan ${formatIDR(shop.envelopeLimit - shop.grandTotal)}` : `lebih ${formatIDR(shop.grandTotal - shop.envelopeLimit)}`})</div>
      </div>
    </div>
  </section>`;
}

export function mount(root, { rerender, notify, setPendingEnvelope }) {
  const form = root.querySelector('#dash-quick-spend');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const ok = addEnvelopeExpense(String(data.get('envelopeId')), data.get('amount'), String(data.get('note') || ''));
      if (ok) {
        notify('Pengeluaran dicatat ke amplop.');
        rerender();
      }
    });
  }

  for (const btn of root.querySelectorAll('[data-action="dash-pay-bill"]')) {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const paid = toggleBillPaid(id);
      if (paid !== null) {
        notify(paid ? 'Tagihan ditandai lunas.' : 'Status lunas dibatalkan.');
        rerender();
      }
    });
  }

  for (const link of root.querySelectorAll('[data-action="jump-envelope"]')) {
    link.addEventListener('click', () => {
      setPendingEnvelope(link.getAttribute('data-id'));
    });
  }
}
