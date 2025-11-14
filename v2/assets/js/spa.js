// ========================================
// spa.js – SPA Core (Relative Imports)
// ========================================

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const spinner = $('#spinner');

export const showSpinner = () => spinner.classList.remove('hidden');
export const hideSpinner = () => spinner.classList.add('hidden');

export let PRODUCTS = [];

export async function loadShared() {
  const [header, footer] = await Promise.all([
    fetch('../../includes/header.html').then(r => r.text()),
    fetch('../../includes/footer.html').then(r => r.text())
  ]);
  $('#header').innerHTML = header;
  $('#footer').innerHTML = footer;
  attachNav();
}

export function attachNav() {
  $$('.nav-home').forEach(l => {
    l.onclick = e => {
      e.preventDefault();
      history.pushState({ page: 'home' }, '', '/');
      import('./handler.js').then(m => m.renderHome());
    };
  });

  $$('.nav-page').forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      const url = link.getAttribute('href');
      history.pushState({ page: 'static', url }, '', url);
      loadStaticPage(url);
    };
  });
}

export async function loadProducts() {
  const res = await fetch('../../data/products.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  PRODUCTS = await res.json();
  return PRODUCTS;
}

export function goToProduct(id) {
  showSpinner();
  history.pushState({ page: 'product', id }, '', `/product?id=${id}`);
  import('./handler.js').then(m => m.renderProduct(id).finally(hideSpinner));
}

export async function loadStaticPage(url) {
  showSpinner();
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Page not found');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    document.title = doc.title;
    const content = doc.querySelector('#app-content')?.innerHTML || '<p>Content missing.</p>';
    $('#app-content').innerHTML = content;
    $('#app-content').classList.add('page-content');
  } catch (err) {
    $('#app-content').innerHTML = '<p class="text-red-600 text-center">Page not found.</p>';
  } finally {
    hideSpinner();
  }
}

window.addEventListener('popstate', () => {
  const id = new URLSearchParams(location.search).get('id');
  const state = history.state || {};
  if (state.page === 'product' && id) {
    import('./handler.js').then(m => m.renderProduct(id));
  } else if (state.page === 'static') {
    loadStaticPage(state.url);
  } else {
    import('./handler.js').then(m => m.renderHome());
  }
});