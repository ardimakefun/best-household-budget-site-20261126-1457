import { escapeHtml, formatIDR, formatShortIDR } from './format.js';

export function renderProgressRing({ pct, size = 76 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  const color = pct > 100 ? '#a63429' : pct >= 80 ? '#b85d2b' : '#1d4a36';
  const track = pct > 100 ? '#f6d6d2' : '#e6dfce';

  return `<svg width="${size}" height="${size}" viewBox="0 0 84 84" role="img" aria-label="Terpakai ${pct}%">
    <circle cx="42" cy="42" r="${r}" fill="none" stroke="${track}" stroke-width="8"/>
    <circle cx="42" cy="42" r="${r}" fill="none" stroke="${color}" stroke-width="8"
      stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}"
      transform="rotate(-90 42 42)"/>
    <text x="42" y="46" text-anchor="middle" font-size="15" font-weight="700" fill="#15241c">${pct}%</text>
  </svg>`;
}

export function renderMonthlyAllocationBar(segments) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0) || 1;
  const width = 560;
  let x = 0;
  const rects = segments
    .map((seg) => {
      const w = (Math.max(0, seg.value) / total) * width;
      const rect = `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="24" fill="${seg.color}"/>`;
      x += w;
      return rect;
    })
    .join('');

  return `<svg class="svg-chart" viewBox="0 0 ${width} 24" role="img" aria-label="Alokasi pendapatan bulanan">
    <defs><clipPath id="alloc-clip"><rect x="0" y="0" width="${width}" height="24" rx="12"/></clipPath></defs>
    <g clip-path="url(#alloc-clip)">${rects}</g>
  </svg>`;
}

export function renderEnvelopeCompareChart(envelopes, getTotals) {
  const rowH = 36;
  const topPad = 10;
  const leftLabel = 205;
  const rightPad = 128;
  const chartW = 680;
  const barAreaW = chartW - leftLabel - rightPad;
  const maxVal = Math.max(1, ...envelopes.map((e) => Math.max(e.limit, getTotals(e).spent)));
  const totalH = topPad + envelopes.length * rowH + 8;

  const rows = envelopes
    .map((env, idx) => {
      const { spent, pct } = getTotals(env);
      const y = topPad + idx * rowH;
      const capW = (env.limit / maxVal) * barAreaW;
      const spentW = (spent / maxVal) * barAreaW;
      const fill = pct > 100 ? '#a63429' : pct >= 80 ? '#b85d2b' : '#1d4a36';
      return `<g>
        <text x="0" y="${y + 18}" font-size="13" font-weight="600" fill="#15241c">${escapeHtml(env.name)}</text>
        <rect x="${leftLabel}" y="${y + 4}" width="${capW.toFixed(1)}" height="19" rx="6" fill="#e8e0cc"/>
        <rect x="${leftLabel}" y="${y + 4}" width="${Math.min(barAreaW, spentW).toFixed(1)}" height="19" rx="6" fill="${fill}"/>
        <text x="${leftLabel + barAreaW + 12}" y="${y + 18}" font-size="12" font-weight="600" fill="#46574e">${formatShortIDR(spent)} / ${formatShortIDR(env.limit)}</text>
      </g>`;
    })
    .join('');

  return `<svg class="svg-chart" viewBox="0 0 ${chartW} ${totalH}" role="img" aria-label="Perbandingan plafon dan realisasi amplop mingguan">${rows}</svg>`;
}

export function renderDebtPayoffChart(baseSeries, extraSeries) {
  const w = 680;
  const h = 230;
  const padL = 68;
  const padR = 24;
  const padT = 20;
  const padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const maxMonths = Math.max(1, baseSeries[baseSeries.length - 1]?.month ?? 1, extraSeries[extraSeries.length - 1]?.month ?? 1);
  const maxBal = Math.max(1, baseSeries[0]?.balance ?? 1, extraSeries[0]?.balance ?? 1);

  const toX = (m) => padL + (m / maxMonths) * plotW;
  const toY = (b) => padT + plotH - (b / maxBal) * plotH;

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];
  const grid = gridLevels
    .map((ratio) => {
      const val = maxBal * ratio;
      const y = toY(val);
      return `<g>
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="#e4dcc8" stroke-width="1"/>
        <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#627269">${formatShortIDR(val)}</text>
      </g>`;
    })
    .join('');

  const xStep = maxMonths <= 12 ? 2 : Math.ceil(maxMonths / 6);
  const xTicks = [];
  for (let m = 0; m <= maxMonths; m += xStep) xTicks.push(m);
  if (xTicks[xTicks.length - 1] !== maxMonths) xTicks.push(maxMonths);
  const axisX = xTicks
    .map((m) => `<text x="${toX(m).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="11" fill="#627269">Bln ${m}</text>`)
    .join('');

  const toPoints = (series) => series.map((p) => `${toX(p.month).toFixed(1)},${toY(p.balance).toFixed(1)}`).join(' ');
  const extraEnd = extraSeries[extraSeries.length - 1] ?? { month: 0, balance: 0 };
  const areaPoints = `${toPoints(extraSeries)} ${toX(extraEnd.month).toFixed(1)},${toY(0).toFixed(1)} ${toX(0).toFixed(1)},${toY(0).toFixed(1)}`;

  const baseEnd = baseSeries[baseSeries.length - 1] ?? { month: 0, balance: 0 };

  return `<svg class="svg-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik proyeksi pelunasan utang">
    ${grid}
    ${axisX}
    <polygon points="${areaPoints}" fill="rgba(29, 74, 54, 0.11)"/>
    <polyline points="${toPoints(baseSeries)}" fill="none" stroke="#b85d2b" stroke-width="2.5" stroke-dasharray="6 4"/>
    <polyline points="${toPoints(extraSeries)}" fill="none" stroke="#1d4a36" stroke-width="3" stroke-linecap="round"/>
    <line x1="${toX(extraEnd.month).toFixed(1)}" y1="${(padT + 18).toFixed(1)}" x2="${toX(extraEnd.month).toFixed(1)}" y2="${toY(0).toFixed(1)}" stroke="#1d4a36" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
    <circle cx="${toX(baseEnd.month).toFixed(1)}" cy="${toY(baseEnd.balance).toFixed(1)}" r="4.5" fill="#b85d2b"/>
    <circle cx="${toX(extraEnd.month).toFixed(1)}" cy="${toY(extraEnd.balance).toFixed(1)}" r="5" fill="#1d4a36"/>
    <rect x="${(toX(extraEnd.month) - 44).toFixed(1)}" y="${(padT + 2).toFixed(1)}" width="88" height="20" rx="10" fill="#e5eee8" stroke="#1d4a36" stroke-width="1"/>
    <text x="${toX(extraEnd.month).toFixed(1)}" y="${(padT + 15.5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#1d4a36">Lunas bln ${extraEnd.month}</text>
  </svg>`;
}

export function renderStatusBadge(pct) {
  if (pct > 100) return '<span class="badge badge-over">Melebihi</span>';
  if (pct >= 80) return '<span class="badge badge-warn">Hampir Penuh</span>';
  return '<span class="badge badge-ok">Aman</span>';
}

export function formatAllocationSummary(items) {
  return items.map((i) => `${i.label}: ${formatIDR(i.value)}`).join(' · ');
}
