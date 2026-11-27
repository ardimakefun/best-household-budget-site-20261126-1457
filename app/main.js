import { formatIDR } from './format.js';
import { getBudgetSummary, resetDemoData } from './state.js';
import * as dashboardView from './views/dashboard.js';

const ROUTES = {
  '/': () => Promise.resolve(dashboardView),
  '/amplop': () => import('./views/envelopes.js'),
  '/tagihan': () => import('./views/bills.js'),
  '/utang': () => import('./views/debt.js'),
  '/belanja': () => import('./views/shopping.js'),
};

const appEl = document.getElementById('app');
const toastEl = document.getElementById('toast');
const sidebarCapEl = document.getElementById('sidebar-weekly-cap');
const resetBtn = document.getElementById('reset-demo-btn');

let toastTimer = null;
let pendingEnvelopeId = null;

function notify(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function currentRoute() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const clean = raw.startsWith('/') ? raw : `/${raw}`;
  return ROUTES[clean] ? clean : '/';
}

function updateNavHighlight(route) {
  for (const link of document.querySelectorAll('#main-nav .nav-link')) {
    link.classList.toggle('is-active', link.getAttribute('data-route') === route);
  }
  if (sidebarCapEl) {
    sidebarCapEl.textContent = `${formatIDR(getBudgetSummary().weeklyBudget)}/mgg`;
  }
}

async function render() {
  window.__shotReady = false;
  const route = currentRoute();
  updateNavHighlight(route);
  const loader = ROUTES[route] ?? ROUTES['/'];
  const view = await loader();
  document.title = `${view.title} | AnggaranKu`;
  appEl.innerHTML = view.render({ preselectedEnvelopeId: pendingEnvelopeId });
  if (typeof view.mount === 'function') {
    view.mount(appEl, {
      rerender: render,
      notify,
      setPendingEnvelope(id) {
        pendingEnvelopeId = id;
      },
      clearPendingEnvelope() {
        pendingEnvelopeId = null;
      },
    });
  }
  updateNavHighlight(route);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    resetDemoData();
    pendingEnvelopeId = null;
    notify('Data Contoh keluarga berhasil dipulihkan.');
    render();
  });
}

window.addEventListener('hashchange', render);
render();
