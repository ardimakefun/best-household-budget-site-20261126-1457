const idrFormatter = new Intl.NumberFormat('id-ID');

export function formatIDR(amount) {
  const n = Math.round(Number(amount) || 0);
  const abs = idrFormatter.format(Math.abs(n));
  return n < 0 ? `-Rp${abs}` : `Rp${abs}`;
}

export function formatShortIDR(amount) {
  const n = Math.round(Number(amount) || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
    return `${sign}Rp${val}jt`;
  }
  if (abs >= 1_000) {
    const val = Math.round(abs / 1_000);
    return `${sign}Rp${val}rb`;
  }
  return `${sign}Rp${abs}`;
}

export function formatPercent(part, total) {
  if (!total || total <= 0) return '0%';
  const pct = (part / total) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return `${String(rounded).replace('.', ',')}%`;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

export function sumBy(list, getter) {
  let total = 0;
  for (const item of list) total += Number(getter(item)) || 0;
  return total;
}
