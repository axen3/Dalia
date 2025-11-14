// app.js – SPA logic for both index.html and product.html
document.addEventListener('DOMContentLoaded', async () => {
  const contentEl = document.getElementById('app-content');
  const spinner = document.getElementById('spinner');

  // Show/hide spinner
  const showSpinner = () => spinner.style.display = 'block';
  const hideSpinner = () => spinner.style.display = 'none';

  // Load products once
  let products = [];
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Failed to load products');
    products = await res.json();
  } catch (e) {
    console.error(e);
    contentEl.innerHTML = '<p style="color:red;">Failed to load products.</p>';
    return;
  }

  // Determine current page
  const currentPage = document.body.dataset.page;
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = parseInt(urlParams.get('id'), 10);

  // Initial render based on URL
  if (currentPage === 'index' || !currentPage) {
    renderProductGrid(products);
  } else if (currentPage === 'product' && urlId) {
    loadProductDetail(urlId);
  }

  // -----------------------------
  // Render Product Grid
  // -----------------------------
  function renderProductGrid(list) {
    const html = list.map(p => `
      <article class="product-card" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <h3>${p.name}</h3>
        <p class="price">$${p.price.toFixed(2)}</p>
      </article>
    `).join('');

    contentEl.innerHTML = `<div class="product-grid">${html}</div>`;

    // Attach click events
    contentEl.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        navigateToProduct(id);
      });
    });

    // Update history
    history.replaceState({ page: 'index' }, '', 'index.html');
  }

  // -----------------------------
  // Navigate to Product Detail
  // -----------------------------
  function navigateToProduct(id) {
    showSpinner();
    const product = products.find(p => p.id === parseInt(id, 10));
    hideSpinner();

    if (!product) {
      contentEl.innerHTML = '<p>Product not found.</p>';
      return;
    }

    // Push new state
    history.pushState(
      { page: 'product', id: parseInt(id, 10) },
      '',
      `product.html?id=${id}`
    );

    renderProductDetail(product);
  }

  // -----------------------------
  // Load Product Detail (used on direct access or popstate)
  // -----------------------------
  async function loadProductDetail(id) {
    showSpinner();
    const product = products.find(p => p.id === parseInt(id, 10));
    hideSpinner();

    if (!product) {
      contentEl.innerHTML = '<p>Product not found.</p>';
      return;
    }

    renderProductDetail(product);
  }

  // -----------------------------
  // Render Product Detail
  // -----------------------------
  function renderProductDetail(p) {
    contentEl.innerHTML = `
      <section class="product-detail">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <h2>${p.name}</h2>
        <p class="price">$${p.price.toFixed(2)}</p>
        <p>${p.description}</p>
        <button id="back-to-shop" style="margin-top:1rem;padding:.6rem 1.2rem;font-size:1rem;">
          Back to Shop
        </button>
      </section>
    `;

    // Back to Shop – SPA navigation
    document.getElementById('back-to-shop').addEventListener('click', () => {
      history.pushState({ page: 'index' }, '', 'index.html');
      renderProductGrid(products);
    });
  }

  // -----------------------------
  // SPA Header Navigation (Home link)
  // -----------------------------
  document.querySelectorAll('nav a[href="index.html"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      history.pushState({ page: 'index' }, '', 'index.html');
      renderProductGrid(products);
    });
  });

  // -----------------------------
  // Handle Browser Back/Forward
  // -----------------------------
  window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state) return;

    if (state.page === 'index') {
      renderProductGrid(products);
    } else if (state.page === 'product' && state.id) {
      loadProductDetail(state.id);
    }
  });

  // -----------------------------
  // Initial History Fix (on direct product.html?id=2 load)
  // -----------------------------
  if (currentPage === 'product' && urlId) {
    const product = products.find(p => p.id === urlId);
    if (product) {
      history.replaceState(
        { page: 'product', id: urlId },
        '',
        `product.html?id=${urlId}`
      );
    }
  }
});