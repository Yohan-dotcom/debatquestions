// Hash-based router for Debat Intense
// Replaces the monolithic goTo() function with history support.

const PAGES = [
  'pg-onboard',
  'pg-home',
  'pg-end',
  'pg-profil',
  'pg-live',
  'pg-week',
  'pg-pay'
];

// Maps page ids to the corresponding bottom-nav button id.
const NAV_MAP = {
  'pg-home':   'ni-home',
  'pg-live':   'ni-live',
  'pg-week':   'ni-week',
  'pg-profil': 'ni-profil',
  'pg-pay':    'ni-pay'
};

let currentPage = null;

// ── Hooks ──────────────────────────────────────────────────────
// Consumers can register callbacks that fire after every page transition.
// Each callback receives (newPageId, previousPageId).
const hooks = [];

/**
 * Register a post-navigation hook.
 * @param {function(string, string|null): void} fn
 */
function onNavigate(fn) {
  if (typeof fn === 'function') {
    hooks.push(fn);
  }
}

// ── Core navigation ────────────────────────────────────────────

/**
 * Navigate to the given page.
 * @param {string} pageId - one of the PAGES ids
 * @param {object} [opts]
 * @param {boolean} [opts.replace=false] - replace the current history entry
 *   instead of pushing a new one (useful for redirects).
 */
function goTo(pageId, opts) {
  opts = opts || {};

  if (PAGES.indexOf(pageId) === -1) {
    console.warn('[Router] unknown page:', pageId);
    return;
  }

  const prev = currentPage;

  // Avoid redundant transitions (prevents display bugs from double-taps).
  if (pageId === currentPage) return;

  // 1. Hide all pages
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('show');
  }

  // Special handling: onboard is not a .page element, it uses display.
  var onboard = document.getElementById('pg-onboard');
  if (onboard) {
    onboard.style.display = (pageId === 'pg-onboard') ? 'flex' : 'none';
  }

  // 2. Show target page
  var target = document.getElementById(pageId);
  if (target && target.classList.contains('page')) {
    target.classList.add('show');
  }

  // 3. Update bottom nav active state
  var navItems = document.querySelectorAll('.ni');
  for (var j = 0; j < navItems.length; j++) {
    navItems[j].classList.remove('on');
  }
  if (NAV_MAP[pageId]) {
    var activeNav = document.getElementById(NAV_MAP[pageId]);
    if (activeNav) activeNav.classList.add('on');
  }

  // 4. Scroll to top to prevent stale scroll positions bleeding between pages
  window.scrollTo(0, 0);

  // 5. Update hash for history / back-button support
  var hash = '#' + pageId;
  if (opts.replace) {
    history.replaceState({ page: pageId }, '', hash);
  } else {
    history.pushState({ page: pageId }, '', hash);
  }

  currentPage = pageId;

  // 6. Fire hooks
  for (var h = 0; h < hooks.length; h++) {
    try {
      hooks[h](pageId, prev);
    } catch (e) {
      console.error('[Router] hook error:', e);
    }
  }
}

/**
 * Return the id of the currently visible page.
 * @returns {string|null}
 */
function getCurrentPage() {
  return currentPage;
}

// ── History (back button) ──────────────────────────────────────

function handlePopState(event) {
  var pageId = null;
  if (event.state && event.state.page) {
    pageId = event.state.page;
  } else {
    // Fall back to parsing the hash
    pageId = location.hash.replace('#', '');
  }

  if (pageId && PAGES.indexOf(pageId) !== -1) {
    // Use replace so we don't double-push onto the history stack.
    goTo(pageId, { replace: true });
  }
}

/**
 * Initialise the router.  Call once after the DOM is ready.
 * If the URL already contains a hash matching a known page, navigate there;
 * otherwise go to the provided default page.
 * @param {string} [defaultPage='pg-onboard']
 */
function init(defaultPage) {
  defaultPage = defaultPage || 'pg-onboard';

  window.addEventListener('popstate', handlePopState);

  var initial = location.hash.replace('#', '');
  if (initial && PAGES.indexOf(initial) !== -1) {
    goTo(initial, { replace: true });
  } else {
    goTo(defaultPage, { replace: true });
  }
}

export { goTo, getCurrentPage, init, onNavigate, PAGES, NAV_MAP };
export default { goTo, getCurrentPage, init, onNavigate, PAGES, NAV_MAP };
