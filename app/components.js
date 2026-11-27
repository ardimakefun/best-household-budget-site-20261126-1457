import { escapeHtml, formatIDR } from './format.js';
import { getEnvelopeTotals } from './state.js';
import { renderProgressRing, renderStatusBadge } from './svg-charts.js';

export function renderPageHeader(title, subtitle, household) {
  return `<header class="page-header">
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p class="page-sub">${escapeHtml(subtitle)}</p>
    </div>
    <div class="demo-tag" title="Data ilustratif terukur">
      <span class="demo-dot" aria-hidden="true"></span>
      <span>${escapeHtml(household.label)}: ${escapeHtml(household.members)} jiwa · ${formatIDR(household.monthlyIncome)}/bln</span>
    </div>
  </header>`;
}

export function renderEnvelopeCard(envelope, { showManageControls = false } = {}) {
  const { spent, remaining, pct } = getEnvelopeTotals(envelope);
  const isOver = remaining < 0;

  const manageBlock = showManageControls
    ? `<div class="envelope-manage">
        <button type="button" class="btn-outline" data-action="pick-envelope" data-id="${escapeHtml(envelope.id)}">+ Catat</button>
        <form class="inline-edit-box" data-form="edit-limit" data-id="${escapeHtml(envelope.id)}">
          <input type="number" name="limit" min="10000" step="5000" value="${envelope.limit}" aria-label="Plafon ${escapeHtml(envelope.name)}">
          <button type="submit" class="btn-outline">Simpan Plafon</button>
        </form>
      </div>`
    : `<div class="row-actions">
        <span class="envelope-meta num">Terpakai ${formatIDR(spent)} / ${formatIDR(envelope.limit)}</span>
        <a href="#/amplop" class="btn-outline" data-action="jump-envelope" data-id="${escapeHtml(envelope.id)}">Catat</a>
      </div>`;

  return `<article class="envelope-card">
    <div class="envelope-top">
      ${renderProgressRing({ pct, size: 74 })}
      <div class="envelope-info">
        <div class="card-title-row" style="margin-bottom:2px;">
          <h3>${escapeHtml(envelope.name)}</h3>
          ${renderStatusBadge(pct)}
        </div>
        <p class="envelope-sub">${escapeHtml(envelope.subtitle)}</p>
      </div>
    </div>
    <div class="envelope-remaining ${isOver ? 'is-over' : ''}">
      <span class="envelope-meta">${isOver ? 'Kelebihan pakai' : 'Sisa amplop'}</span>
      <strong class="num">${isOver ? formatIDR(Math.abs(remaining)) : formatIDR(remaining)}</strong>
    </div>
    ${showManageControls ? `<div class="envelope-meta num">Terpakai minggu ini: <strong>${formatIDR(spent)}</strong> dari plafon <strong>${formatIDR(envelope.limit)}</strong></div>` : ''}
    ${manageBlock}
  </article>`;
}
