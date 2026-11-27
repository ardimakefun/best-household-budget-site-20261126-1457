import { renderPageHeader } from '../components.js';
import { escapeHtml, formatIDR, formatPercent, formatShortIDR } from '../format.js';
import { addBill, getBudgetSummary, getState, removeBill, toggleBillPaid } from '../state.js';

export const title = 'Kalender Tagihan';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function renderCalendarCells(bills) {
  /* November 2026 dimulai pada hari Minggu (index ke-6 dalam urutan Sen..Min). */
  const leadingEmpty = 6;
  const daysInMonth = 30;
  const byDay = new Map();
  for (const bill of bills) {
    const list = byDay.get(bill.day) ?? [];
    list.push(bill);
    byDay.set(bill.day, list);
  }

  const cells = [];
  for (let i = 0; i < leadingEmpty; i++) {
    cells.push('<div class="cal-cell is-empty" aria-hidden="true"></div>');
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBills = byDay.get(day) ?? [];
    const chips = dayBills
      .map(
        (b) => `<button type="button" class="cal-bill-chip ${b.paid ? 'is-paid' : 'is-due'}" data-action="toggle-bill" data-id="${escapeHtml(b.id)}" title="${escapeHtml(b.name)} (${formatIDR(b.amount)})">
          ${b.paid ? '✓' : '•'} ${escapeHtml(b.name.split(' ')[0])} ${formatShortIDR(b.amount)}
        </button>`,
      )
      .join('');
    cells.push(`<div class="cal-cell">
      <div class="cal-day">${day}</div>
      ${chips}
    </div>`);
  }
  return cells.join('');
}

export function render() {
  const state = getState();
  const summary = getBudgetSummary();
  const paidCount = state.bills.filter((b) => b.paid).length;
  const pctPaid = summary.totalBills > 0 ? Math.round((summary.paidBills / summary.totalBills) * 100) : 0;

  const billRows = state.bills
    .map(
      (b) => `<div class="row-item">
        <div class="row-main">
          <span class="badge ${b.paid ? 'badge-ok' : 'badge-warn'}">Tgl ${b.day}</span>
          <div>
            <strong>${escapeHtml(b.name)}</strong>
            <div class="envelope-meta">${escapeHtml(b.category)} · ${b.paid ? 'Sudah dibayar' : 'Menunggu pembayaran'}</div>
          </div>
        </div>
        <div class="row-actions">
          <strong class="num">${formatIDR(b.amount)}</strong>
          <button type="button" class="${b.paid ? 'btn-outline' : 'btn-primary'}" data-action="toggle-bill" data-id="${escapeHtml(b.id)}">
            ${b.paid ? 'Batalkan Lunas' : 'Tandai Lunas'}
          </button>
          <button type="button" class="btn-danger-ghost" data-action="del-bill" data-id="${escapeHtml(b.id)}">Hapus</button>
        </div>
      </div>`,
    )
    .join('');

  return `${renderPageHeader('Kalender Tagihan Bulanan', `Pantau tanggal jatuh tempo & status bayar (${state.household.monthLabel})`, state.household)}

  <section class="kpi-strip" aria-label="Ringkasan tagihan bulanan">
    <div class="kpi-box">
      <div class="kpi-label">Total Tagihan Bulanan</div>
      <div class="kpi-value num">${formatIDR(summary.totalBills)}</div>
      <div class="kpi-note">${state.bills.length} pos komitmen tetap</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Sudah Lunas</div>
      <div class="kpi-value num" style="color:var(--forest-800);">${formatIDR(summary.paidBills)}</div>
      <div class="kpi-note">${paidCount} dari ${state.bills.length} tagihan (${formatPercent(summary.paidBills, summary.totalBills)})</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Belum Dibayar</div>
      <div class="kpi-value num" style="color:var(--amber-600);">${formatIDR(summary.unpaidBills)}</div>
      <div class="kpi-note">${state.bills.length - paidCount} tagihan mendatang</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Porsi dari Penghasilan</div>
      <div class="kpi-value num">${formatPercent(summary.totalBills, state.household.monthlyIncome)}</div>
      <div class="kpi-note num">Dari ${formatIDR(state.household.monthlyIncome)}/bln</div>
    </div>
  </section>

  <section class="card" aria-label="Kalender November 2026">
    <div class="card-title-row">
      <h2>Kalender Jatuh Tempo — ${escapeHtml(state.household.monthLabel)}</h2>
      <div class="envelope-meta">Klik tagihan pada tanggal untuk ubah status lunas · <span class="badge badge-ok">✓ Lunas</span> <span class="badge badge-warn">• Belum</span></div>
    </div>
    <div class="progress-track" style="margin-bottom:14px;">
      <div class="progress-fill-green" style="width:${pctPaid}%;"></div>
    </div>
    <div class="calendar-grid">
      ${WEEKDAYS.map((d) => `<div class="cal-head">${d}</div>`).join('')}
      ${renderCalendarCells(state.bills)}
    </div>
  </section>

  <section class="grid-2">
    <div class="card">
      <div class="card-title-row">
        <h2>Daftar Tagihan Tetap (${state.bills.length})</h2>
      </div>
      <div class="table-list">${billRows}</div>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h2>Tambah Tagihan Rutin</h2>
      </div>
      <form id="add-bill-form" class="form-grid" style="grid-template-columns:1fr 1fr;">
        <label class="field" style="grid-column:1 / -1;">
          <span>Nama Tagihan</span>
          <input type="text" name="name" placeholder="Contoh: Iuran Sampah & Keamanan" required>
        </label>
        <label class="field">
          <span>Tanggal (1–30)</span>
          <input type="number" name="day" min="1" max="30" value="28" required>
        </label>
        <label class="field">
          <span>Nominal (Rp)</span>
          <input type="number" name="amount" min="1000" step="1000" placeholder="Contoh: 50.000" required>
        </label>
        <label class="field" style="grid-column:1 / -1;">
          <span>Kategori</span>
          <select name="category">
            <option value="Hunian">Hunian</option>
            <option value="Utilitas">Utilitas</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Komunikasi">Komunikasi</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </label>
        <div style="grid-column:1 / -1;">
          <button type="submit" class="btn-primary">Tambahkan ke Kalender</button>
        </div>
      </form>
    </div>
  </section>`;
}

export function mount(root, { rerender, notify }) {
  for (const btn of root.querySelectorAll('[data-action="toggle-bill"]')) {
    btn.addEventListener('click', () => {
      const paid = toggleBillPaid(btn.getAttribute('data-id'));
      if (paid !== null) {
        notify(paid ? 'Tagihan ditandai lunas.' : 'Status tagihan dikembalikan ke belum lunas.');
        rerender();
      }
    });
  }

  for (const btn of root.querySelectorAll('[data-action="del-bill"]')) {
    btn.addEventListener('click', () => {
      if (removeBill(btn.getAttribute('data-id'))) {
        notify('Tagihan dihapus dari daftar.');
        rerender();
      }
    });
  }

  const form = root.querySelector('#add-bill-form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const ok = addBill({
        name: String(data.get('name') || ''),
        day: data.get('day'),
        amount: data.get('amount'),
        category: String(data.get('category') || 'Lainnya'),
      });
      if (ok) {
        notify('Tagihan baru ditambahkan ke kalender.');
        rerender();
      }
    });
  }
}
