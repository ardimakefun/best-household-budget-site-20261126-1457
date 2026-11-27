import { renderPageHeader } from '../components.js';
import { escapeHtml, formatIDR } from '../format.js';
import {
  addShoppingItem,
  getShoppingSummary,
  getState,
  removeShoppingItem,
  stepShoppingQty,
  syncShoppingToEnvelope,
  toggleShoppingItem,
} from '../state.js';

export const title = 'Daftar Belanja';

let filterStatus = 'all';

export function render() {
  const state = getState();
  const shop = getShoppingSummary();

  const filtered = state.shopping.filter((item) => {
    if (filterStatus === 'pending') return !item.checked;
    if (filterStatus === 'done') return item.checked;
    return true;
  });

  const cap = shop.envelopeLimit || 1;
  const checkedWidth = Math.min(100, Math.round((shop.checkedTotal / cap) * 100));
  const pendingWidth = Math.min(100 - checkedWidth, Math.round((shop.pendingTotal / cap) * 100));
  const headroom = shop.envelopeLimit - shop.grandTotal;
  const needsSync = shop.checkedTotal !== shop.envelopeSpent;

  const itemRows = filtered.length > 0
    ? filtered
        .map((item) => {
          const subtotal = item.qty * item.price;
          return `<div class="row-item">
            <div class="row-main">
              <input class="shop-check" type="checkbox" ${item.checked ? 'checked' : ''} data-action="toggle-shop" data-id="${escapeHtml(item.id)}" aria-label="Tandai ${escapeHtml(item.name)}">
              <div>
                <strong class="${item.checked ? 'is-checked-text' : ''}">${escapeHtml(item.name)}</strong>
                <div class="envelope-meta num">${escapeHtml(item.category)} · ${formatIDR(item.price)} / ${escapeHtml(item.unit)}</div>
              </div>
            </div>
            <div class="row-actions">
              <div class="qty-box" aria-label="Jumlah ${escapeHtml(item.name)}">
                <button type="button" data-action="qty-down" data-id="${escapeHtml(item.id)}" aria-label="Kurangi jumlah">-</button>
                <span class="num">${item.qty}</span>
                <button type="button" data-action="qty-up" data-id="${escapeHtml(item.id)}" aria-label="Tambah jumlah">+</button>
              </div>
              <strong class="num" style="min-width:96px;text-align:right;">${formatIDR(subtotal)}</strong>
              <button type="button" class="btn-danger-ghost" data-action="del-shop" data-id="${escapeHtml(item.id)}">Hapus</button>
            </div>
          </div>`;
        })
        .join('')
    : '<p class="envelope-meta">Tidak ada barang belanja pada kategori filter ini.</p>';

  return `${renderPageHeader('Daftar Belanja Mingguan', 'Centang belanjaan berjalan agar selalu selaras dengan Amplop Belanja Dapur', state.household)}

  <section class="kpi-strip" aria-label="Ringkasan total daftar belanja">
    <div class="kpi-box">
      <div class="kpi-label">Sudah Dibeli (Dicentang)</div>
      <div class="kpi-value num" style="color:var(--forest-800);">${formatIDR(shop.checkedTotal)}</div>
      <div class="kpi-note">${shop.checkedCount} dari ${shop.totalItems} barang</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Rencana Sisa Minggu Ini</div>
      <div class="kpi-value num">${formatIDR(shop.pendingTotal)}</div>
      <div class="kpi-note">${shop.pendingCount} barang belum dibeli</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Total Seluruh Daftar</div>
      <div class="kpi-value num">${formatIDR(shop.grandTotal)}</div>
      <div class="kpi-note num">Plafon Amplop Dapur: ${formatIDR(shop.envelopeLimit)}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Selisih Terhadap Plafon</div>
      <div class="kpi-value num" style="color:${headroom >= 0 ? 'var(--forest-800)' : 'var(--danger-600)'};">${headroom >= 0 ? `+${formatIDR(headroom)}` : formatIDR(headroom)}</div>
      <div class="kpi-note">${headroom >= 0 ? 'Aman di dalam amplop' : 'Melebihi plafon dapur'}</div>
    </div>
  </section>

  <section class="card" aria-label="Keselarasan daftar belanja dengan amplop">
    <div class="card-title-row">
      <h2>Perbandingan dengan Amplop Belanja Dapur & Pasar</h2>
      <button type="button" class="${needsSync ? 'btn-primary' : 'btn-outline'}" id="sync-shop-btn" ${needsSync ? '' : 'disabled'}>
        ${needsSync ? `Sinkronkan ke Amplop (${formatIDR(shop.checkedTotal)})` : 'Sudah Selaras dengan Amplop ✓'}
      </button>
    </div>
    <div class="progress-track" style="margin-bottom:10px;">
      <div class="progress-fill-green" style="width:${checkedWidth}%;"></div>
      <div class="progress-fill-amber" style="width:${pendingWidth}%;"></div>
    </div>
    <div class="envelope-meta num" style="display:flex;flex-wrap:wrap;gap:14px;">
      <span><span class="legend-dot" style="background:var(--forest-800);"></span>Terbeli: <strong>${formatIDR(shop.checkedTotal)}</strong></span>
      <span><span class="legend-dot" style="background:var(--gold-400);"></span>Rencana sisa: <strong>${formatIDR(shop.pendingTotal)}</strong></span>
      <span>Terpakai di Amplop Dapur saat ini: <strong>${formatIDR(shop.envelopeSpent)}</strong> / ${formatIDR(shop.envelopeLimit)}</span>
    </div>
  </section>

  <section class="grid-2" style="grid-template-columns: 1.45fr 1fr;">
    <div class="card">
      <div class="card-title-row">
        <h2>Daftar Item Belanja (${filtered.length})</h2>
        <div class="preset-row">
          <button type="button" class="btn-outline ${filterStatus === 'all' ? 'is-selected' : ''}" data-action="shop-filter" data-val="all">Semua (${shop.totalItems})</button>
          <button type="button" class="btn-outline ${filterStatus === 'pending' ? 'is-selected' : ''}" data-action="shop-filter" data-val="pending">Belum (${shop.pendingCount})</button>
          <button type="button" class="btn-outline ${filterStatus === 'done' ? 'is-selected' : ''}" data-action="shop-filter" data-val="done">Dibeli (${shop.checkedCount})</button>
        </div>
      </div>
      <div class="table-list">${itemRows}</div>
    </div>

    <div class="card">
      <div class="card-title-row">
        <h2>Tambah Item Belanja</h2>
      </div>
      <form id="add-shop-form" class="form-grid" style="grid-template-columns:1fr 1fr;">
        <label class="field" style="grid-column:1 / -1;">
          <span>Nama Barang</span>
          <input type="text" name="name" placeholder="Contoh: Bawang Merah & Putih" required>
        </label>
        <label class="field">
          <span>Kategori</span>
          <select name="category">
            <option value="Sembako">Sembako</option>
            <option value="Protein">Protein</option>
            <option value="Sayur & Buah">Sayur & Buah</option>
            <option value="Anak">Anak</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </label>
        <label class="field">
          <span>Satuan</span>
          <input type="text" name="unit" value="kg" placeholder="kg / ikat / pcs">
        </label>
        <label class="field">
          <span>Jumlah</span>
          <input type="number" name="qty" min="1" step="1" value="1" required>
        </label>
        <label class="field">
          <span>Harga Satuan (Rp)</span>
          <input type="number" name="price" min="500" step="500" placeholder="18000" required>
        </label>
        <div style="grid-column:1 / -1;">
          <button type="submit" class="btn-primary">Tambah ke Daftar</button>
        </div>
      </form>
    </div>
  </section>`;
}

export function mount(root, { rerender, notify }) {
  for (const box of root.querySelectorAll('[data-action="toggle-shop"]')) {
    box.addEventListener('change', () => {
      const checked = toggleShoppingItem(box.getAttribute('data-id'));
      if (checked !== null) {
        notify(checked ? 'Barang ditandai sudah dibeli.' : 'Barang dikembalikan ke rencana.');
        rerender();
      }
    });
  }

  for (const btn of root.querySelectorAll('[data-action="qty-down"]')) {
    btn.addEventListener('click', () => {
      if (stepShoppingQty(btn.getAttribute('data-id'), -1)) rerender();
    });
  }

  for (const btn of root.querySelectorAll('[data-action="qty-up"]')) {
    btn.addEventListener('click', () => {
      if (stepShoppingQty(btn.getAttribute('data-id'), 1)) rerender();
    });
  }

  for (const btn of root.querySelectorAll('[data-action="del-shop"]')) {
    btn.addEventListener('click', () => {
      if (removeShoppingItem(btn.getAttribute('data-id'))) {
        notify('Barang dihapus dari daftar belanja.');
        rerender();
      }
    });
  }

  for (const btn of root.querySelectorAll('[data-action="shop-filter"]')) {
    btn.addEventListener('click', () => {
      filterStatus = btn.getAttribute('data-val') || 'all';
      rerender();
    });
  }

  const syncBtn = root.querySelector('#sync-shop-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      if (syncShoppingToEnvelope()) {
        notify('Total item tercentang disinkronkan ke Amplop Belanja Dapur.');
        rerender();
      }
    });
  }

  const addForm = root.querySelector('#add-shop-form');
  if (addForm) {
    addForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(addForm);
      const ok = addShoppingItem({
        name: String(data.get('name') || ''),
        category: String(data.get('category') || 'Sembako'),
        qty: data.get('qty'),
        unit: String(data.get('unit') || 'pcs'),
        price: data.get('price'),
      });
      if (ok) {
        notify('Barang baru ditambahkan ke daftar belanja.');
        rerender();
      }
    });
  }
}
