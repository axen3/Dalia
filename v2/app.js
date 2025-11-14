document.addEventListener('DOMContentLoaded', async () => {
  const contentEl = document.getElementById('app-content');
  const spinner = document.getElementById('spinner');
  const showSpinner = () => spinner.style.display = 'block';
  const hideSpinner = () => spinner.style.display = 'none';

  // Load products
  let products = [];
  try {
    const res = await fetch(
      document.body.dataset.page === 'product' ? '../products.json' : 'products.json'
    );
    products = await res.json();
  } catch (e) {
    contentEl.innerHTML = '<p style="color:red;">Failed to load products.</p>';
    return;
  }

  const page = document.body.dataset.page;
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = parseInt(urlParams.get('id'), 10);

  // === INDEX PAGE ===
  if (page === 'index') {
    renderProductGrid(products);
  }

  // === PRODUCT PAGE ===
  if (page === 'product') {
    if (!urlId) {
      contentEl.innerHTML = '<p>Invalid product ID.</p>';
      return;
    }
    showSpinner();
    const product = products.find(p => p.id === urlId);
    hideSpinner();
    if (product) {
      renderProductDetail(product);
      history.replaceState({ page: 'product', id: urlId }, '', `?id=${urlId}`);
    } else {
      contentEl.innerHTML = '<p>Product not found.</p>';
    }
  }

  // === Render Grid ===
  function renderProductGrid(list) {
    const html = list.map(p => `
      <article class="product-card" data-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="brand">by ${p.brand}</p>
          <p class="price">$${p.price.toFixed(2)}</p>
          <p class="stock ${p.inStock ? 'in' : 'out'}">
            ${p.inStock ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </article>
    `).join('');

    contentEl.innerHTML = `<div class="product-grid">${html}</div>`;

    // Click → go to product page (SPA)
    contentEl.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        history.pushState({ page: 'product', id }, '', `product?id=${id}`);
        const product = products.find(p => p.id === parseInt(id));
        renderProductDetail(product);
      });
    });

    history.replaceState({ page: 'index' }, '', 'index.html');
  }

  // === Render Detail ===
  function renderProductDetail(p) {
    const stockText = p.inStock
      ? '<span style="color:green;">In Stock</span>'
      : '<span style="color:red;">Out of Stock</span>';
    const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    contentEl.innerHTML = `
      <section class="product-detail">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <h2>${p.name}</h2>
        <p class="brand">by <strong>${p.brand}</strong></p>
        <p class="price">$${p.price.toFixed(2)}</p>
        <p class="rating">${stars} (${p.rating})</p>
        <p class="stock-status">${stockText}</p>
        <p class="description">${p.description}</p>
        <button id="back-to-shop">Back to Shop</button>
      </section>
    `;

    document.getElementById('back-to-shop').addEventListener('click', () => {
      history.pushState({ page: 'index' }, '', 'index.html');
      renderProductGrid(products);
    });
  }

  // === Browser Back/Forward ===
  window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state) return;
    if (state.page === 'index') {
      renderProductGrid(products);
    } else if (state.page === 'product') {
      const product = products.find(p => p.id === state.id);
      if (product) renderProductDetail(product);
    }
  });

  // === SPA Home Link ===
  document.querySelectorAll('nav a[href="index.html"], nav a[href="../index.html"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      history.pushState({ page: 'index' }, '', 'index.html');
      renderProductGrid(products);
    });
  });
});