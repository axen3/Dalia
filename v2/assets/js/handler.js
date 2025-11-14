// ========================================
// handler.js – Renders Home Grid & Product Detail
// ========================================

import { PRODUCTS, showSpinner, hideSpinner } from './spa.js';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ==== RENDER HOME GRID ====
export async function renderHome() {
  showSpinner();
  try {
    if (PRODUCTS.length === 0) {
      await import('./spa.js').then(m => m.loadProducts());
    }

    const html = PRODUCTS.map(p => {
      const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
      return `
        <article class="card" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" class="w-full h-48 object-cover rounded-t-lg">
          <div class="info p-4">
            <h3 class="font-semibold text-lg">${p.name}</h3>
            <p class="text-sm text-gray-600">${p.brand}</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="price text-indigo-600 font-bold">$${(p.price / 100).toFixed(2)}</span>
              ${p.originalPrice ? `<span class="original text-gray-400 line-through text-sm">$${(p.originalPrice / 100).toFixed(2)}</span>` : ''}
              ${discount ? `<span class="discount bg-red-100 text-red-600 text-xs px-2 py-1 rounded">-${discount}%</span>` : ''}
            </div>
            ${p.shipping === 'free' ? '<p class="text-xs text-green-600 mt-1">Free shipping</p>' : ''}
          </div>
        </article>
      `;
    }).join('');

    $('#app-content').innerHTML = `
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${html}
      </div>
    `;

    // Attach click to cards
    $$('.card').forEach(card => {
      card.onclick = () => {
        const id = card.dataset.id;
        import('./spa.js').then(m => m.goToProduct(id));
      };
    });

  } catch (err) {
    console.error('renderHome error:', err);
    $('#app-content').innerHTML = '<p class="text-center text-red-600">Failed to load products.</p>';
  } finally {
    hideSpinner();
  }
}

// ==== RENDER PRODUCT DETAIL ====
export async function renderProduct(id) {
  showSpinner();
  try {
    if (PRODUCTS.length === 0) {
      await import('./spa.js').then(m => m.loadProducts());
    }

    const p = PRODUCTS.find(x => x.id == id);
    if (!p) throw new Error('Product not found');

    // Thumbnails
    const thumbs = p.images?.map((src, i) => `
      <img src="${src}" alt="thumb ${i+1}" class="thumbnail w-16 h-16 object-cover rounded cursor-pointer border-2 ${i===0?'border-indigo-600':'border-gray-300'}"
           onclick="switchMainImage(this.src, this)">
    `).join('') || '';

    // Description blocks
    const blocks = p.descriptionBlocks?.map(b => {
      if (b.type === 'h1') return `<h1 class="text-2xl font-bold mt-8 mb-4">${b.content}</h1>`;
      if (b.type === 'paragraph') return `<p class="text-gray-700 mb-4">${b.content}</p>`;
      if (b.type === 'ul') return `<ul class="list-disc list-inside text-gray-700 mb-6">${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
      if (b.type === 'image') return `<img src="${b.src}" alt="${b.alt}" class="w-full rounded-lg my-6 shadow-md max-h-96 object-cover">`;
      return '';
    }).join('') || '';

    // Colors
    const colors = p.colors?.map((c, i) => `
      <button class="color-btn w-8 h-8 rounded-full border-2 ${i===0?'border-indigo-600':'border-gray-300'}"
              style="background:${c.hex}" title="${c.name}"
              onclick="selectColor(this, '${c.name}')"></button>
    `).join('') || '';

    // Sizes
    const sizes = p.sizes?.length ? p.sizes.map((s, i) => `
      <button class="size-btn px-3 py-1 border rounded text-sm ${i===0?'bg-indigo-600 text-white':'bg-white text-gray-700'} hover:bg-indigo-600 hover:text-white"
              onclick="selectSize(this, '${s}')">${s}</button>
    `).join('') : '<p class="text-sm text-gray-500">One size</p>';

    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

    $('#app-content').innerHTML = `
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Image Gallery -->
        <div>
          <img id="mainImg" src="${p.image}" alt="${p.name}" class="main w-full rounded-lg shadow-md">
          ${thumbs ? `<div class="thumbnails flex gap-2 mt-4">${thumbs}</div>` : ''}
        </div>

        <!-- Product Info -->
        <div>
          <h1 class="text-3xl font-bold">${p.name}</h1>
          <p class="text-lg text-gray-600 mt-1">${p.brand}</p>

          <div class="mt-4 flex items-center gap-3">
            <span class="text-3xl font-bold text-indigo-600">$${(p.price/100).toFixed(2)}</span>
            ${p.originalPrice ? `<span class="line-through text-gray-400">$${(p.originalPrice/100).toFixed(2)}</span>` : ''}
            ${discount ? `<span class="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">-${discount}%</span>` : ''}
          </div>

          <p class="mt-3 ${p.shipping === 'free' ? 'text-green-600' : ''}">${p.shipping === 'free' ? 'Free shipping' : ''}</p>
          <p class="mt-4 text-gray-700">${p.shortDescription || ''}</p>

          <!-- Color -->
          ${colors ? `
            <div class="mt-6">
              <p class="font-medium mb-2">Color: <span id="selectedColor" class="text-indigo-600">${p.colors[0].name}</span></p>
              <div class="flex gap-2">${colors}</div>
            </div>
          ` : ''}

          <!-- Size -->
          <div class="mt-6">
            <p class="font-medium mb-2">Size: <span id="selectedSize" class="text-indigo-600">${p.sizes?.[0] || 'One size'}</span></p>
            <div class="flex gap-2 flex-wrap">${sizes}</div>
          </div>

          <button class="btn btn-primary mt-8 w-full">Add to Cart</button>
          <button id="backBtn" class="btn btn-outline mt-4 w-full">Back to Shop</button>
        </div>
      </div>

      <!-- Description -->
      <div class="prose mt-12 max-w-none">${blocks}</div>
    `;

    // Back button
    $('#backBtn').onclick = () => {
      history.pushState({ page: 'home' }, '', '/');
      renderHome();
    };

  } catch (err) {
    console.error('renderProduct error:', err);
    $('#app-content').innerHTML = '<p class="text-center text-red-600">Product not found.</p>';
  } finally {
    hideSpinner();
  }
}

// ==== GLOBAL HELPERS (for onclick) ====
window.switchMainImage = (src, thumb) => {
  $('#mainImg').src = src;
  $$('.thumbnail').forEach(t => t.classList.remove('border-indigo-600'));
  thumb.classList.add('border-indigo-600');
};

window.selectColor = (btn, name) => {
  $$('.color-btn').forEach(b => b.classList.remove('border-indigo-600'));
  btn.classList.add('border-indigo-600');
  $('#selectedColor').textContent = name;
};

window.selectSize = (btn, size) => {
  $$('.size-btn').forEach(b => {
    b.classList.remove('bg-indigo-600', 'text-white');
    b.classList.add('bg-white', 'text-gray-700');
  });
  btn.classList.add('bg-indigo-600', 'text-white');
  btn.classList.remove('bg-white', 'text-gray-700');
  $('#selectedSize').textContent = size;
};