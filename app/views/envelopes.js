import { renderEnvelopeCard, renderPageHeader } from '../components.js';
import { escapeHtml, formatIDR, formatPercent } from '../format.js';
import {
  WEEKS_PER_MONTH,
  addEnvelopeExpense,
  getBudgetSummary,
  getState,
  removeEnvelopeExpense,
  updateEnvelopeLimit,
} from '../state.js';
import { renderEnvelopeCompareChart } from '../svg-charts.js';
import { getEnvelopeTotals } from '../state.js';

export const title = 'Amplop Mingguan';

let filterEnvId = 'all';

export function render({ preselectedEnvelopeId } = {}) {
  const state = getState();
  const summary = getBudgetSummary();
  const activeId = preselectedEnvelopeId || state.envelopes[0]?.id || '';

  const envOptions = state.envelopes
    .map((e) => {
      const { remaining } = getEnvelopeTotals(e);
      const sel = e.id === activeId ? 'selected' : '';
      return `<option value="${escapeHtml(e.id)}" ${sel}>${escapeHtml(e.name)} (sisa ${formatIDR(remaining)})</option>`;
    })
    .join('');

  const filterOptions = [
    `<option value="all" ${filterEnvId === 'all' ? 'selected' : ''}>Semua Amplop</option>`,
    ...state.envelopes.map(
      (e) => `<option value="${escapeHtml(e.id)}" ${filterEnvId === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`,
    ),
  ].join('');

  const allTransactions = [];
  for (const env of state.envelopes) {
    if (filterEnvId !== 'all' && env.id !== filterEnvId) continue;
    for (const tx of env.transactions) {
      allTransactions.push({ ...tx, envId: env.id, envName: env.name });
    }
  }

  const txRows = allTransactions.length > 0
    ? allTransactions
        .map(
          (tx) => `<div class="row-item">
            <div class="row-main">
              <span class="badge badge-ok">${escapeHtml(tx.envName)}</span>
              <div>
                <strong>${escapeHtml(tx.note)}</strong>
                <div class="envelope-meta">${escapeHtml(tx.date)}</div>
              </div>
            </div>
            <div class="row-actions">
              <strong class="num" style="color:var(--danger-600);">-${formatIDR(tx.amount)}</strong>
              <button type="button" class="btn-danger-ghost" data-action="del-tx" data-env="${escapeHtml(tx.envId)}" data-tx="${escapeHtml(tx.id)}">Hapus</button>
            </div>
          </div>`,
        )
        .join('')
    : '<p class="envelope-meta">Belum ada catatan pengeluaran untuk filter ini.</p>';

  return `${renderPageHeader('Amplop Mingguan', `Atur plafon & catat setiap pengeluaran kas (${state.household.weekLabel})`, state.household)}

  <section class="kpi-strip" aria-label="Ringkasan amplop mingguan">
    <div class="kpi-box">
      <div class="kpi-label">Plafon Mingguan</div>
      <div class="kpi-value num">${formatIDR(summary.weeklyBudget)}</div>
      <div class="kpi-note">Total 6 amplop kategori</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Sudah Terpakai</div>
      <div class="kpi-value num">${formatIDR(summary.weeklySpent)}</div>
      <div class="kpi-note num">${formatPercent(summary.weeklySpent, summary.weeklyBudget)} dari plafon</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Sisa Kas Amplop</div>
      <div class="kpi-value num">${formatIDR(summary.weeklyRemaining)}</div>
      <div class="kpi-note">Tersedia hingga akhir minggu</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Setara Bulanan (× ${String(WEEKS_PER_MONTH).replace('.', ',')})</div>
      <div class="kpi-value num">${formatIDR(summary.monthlyEnvelopeEquiv)}</div>
      <div class="kpi-note num">Dari gaji ${formatIDR(state.household.monthlyIncome)}/bln</div>
    </div>
  </section>

  <section class="grid-2">
    <div class="card">
      <div class="card-title-row">
        <h2>Catat Pengeluaran Amplop</h2>
      </div>
      <form id="env-spend-form" class="form-grid" style="grid-template-columns:1fr 1fr;">
        <label class="field" style="grid-column:1 / -1;">
          <span>Pilih Amplop</span>
          <select name="envelopeId" required>${envOptions}</select>
        </label>
        <label class="field">
          <span>Nominal (Rp)</span>
          <input type="number" name="amount" min="500" step="500" placeholder="35000" required>
        </label>
        <label class="field">
          <span>Tanggal / Hari</span>
          <input type="text" name="date" value="27 Nov" placeholder="27 Nov">
        </label>
        <label class="field" style="grid-column:1 / -1;">
          <span>Keterangan Pengeluaran</span>
          <input type="text" name="note" placeholder="Contoh: Beli beras & telur di pasar" required>
        </label>
        <div style="grid-column:1 / -1;">
          <button type="submit" class="btn-primary">Kurangi Saldo Amplop</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h2>Realisasi vs Plafon Mingguan</h2>
        <span class="envelope-meta">${escapeHtml(state.household.label)}</span>
      </div>
      ${renderEnvelopeCompareChart(state.envelopes, getEnvelopeTotals)}
    </div>
  </section>

  <section aria-label="Daftar amplop interaktif">
    <div class="card-title-row">
      <h2>Saldo per Amplop & Ubah Plafon</h2>
    </div>
    <div class="grid-3">
      ${state.envelopes.map((env) => renderEnvelopeCard(env, { showManageControls: true })).join('')}
    </div>
  </section>

  <section class="card" aria-label="Riwayat transaksi amplop">
    <div class="card-title-row">
      <h2>Riwayat Pengeluaran Minggu Ini (${allTransactions.length})</h2>
      <select id="tx-filter" aria-label="Filter amplop" style="padding:6px 10px;border-radius:7px;border:1px solid var(--cream-300);background:#fff;">${filterOptions}</select>
    </div>
    <div class="table-list">${txRows}</div>
  </section>`;
}

export function mount(root, { rerender, notify, clearPendingEnvelope }) {
  clearPendingEnvelope();

  const form = root.querySelector('#env-spend-form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const ok = addEnvelopeExpense(
        String(data.get('envelopeId')),
        data.get('amount'),
        String(data.get('note') || ''),
        String(data.get('date') || 'Hari ini'),
      );
      if (ok) {
        notify('Pengeluaran tercatat dan sisa amplop diperbarui.');
        rerender();
      }
    });
  }

  for (const btn of root.querySelectorAll('[data-action="pick-envelope"]')) {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const select = root.querySelector('#env-spend-form select[name="envelopeId"]');
      const amountInput = root.querySelector('#env-spend-form input[name="amount"]');
      if (select && id) select.value = id;
      if (amountInput) {
        amountInput.focus();
        amountInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  for (const limitForm of root.querySelectorAll('[data-form="edit-limit"]')) {
    limitForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const id = limitForm.getAttribute('data-id');
      const val = new FormData(limitForm).get('limit');
      if (updateEnvelopeLimit(id, val)) {
        notify('Plafon amplop mingguan diperbarui.');
        rerender();
      }
    });
  }

  for (const delBtn of root.querySelectorAll('[data-action="del-tx"]')) {
    delBtn.addEventListener('click', () => {
      const envId = delBtn.getAttribute('data-env');
      const txId = delBtn.getAttribute('data-tx');
      if (removeEnvelopeExpense(envId, txId)) {
        notify('Transaksi dihapus dan saldo amplop dikembalikan.');
        rerender();
      }
    });
  }

  const filterSelect = root.querySelector('#tx-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      filterEnvId = filterSelect.value;
      rerender();
    });
  }
}
