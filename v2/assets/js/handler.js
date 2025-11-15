/* =================================
   FETCH DATA
================================= */
async function getProducts() {
    if (!window._productsCache) {
        const res = await fetch("/data/products.json");
        window._productsCache = await res.json();
    }
    return window._productsCache;
}

async function getPages() {
    if (!window._pagesCache) {
        const res = await fetch("/data/pages.json");
        window._pagesCache = await res.json();
    }
    return window._pagesCache;
}

/* =================================
   RENDER PRODUCT LIST
================================= */
async function renderProductList() {
    const container = document.getElementById("main-content");
    const scrollY = history.state?.scrollY || 0;

    container.innerHTML = `
        <section class="hero">
            <h1>Welcome to MyStore</h1>
            <p>Discover our exclusive products for all your needs</p>
        </section>
        <h2 class="products-heading">Our Products</h2>
        <div id="product-list" class="products-grid"></div>
    `;

    const products = await getProducts();
    const productGrid = document.getElementById("product-list");

    productGrid.innerHTML = products.map(p => `
        <a class="product-card" href="/?id=${p.id}">
            <div class="product-image">
                <img src="${p.image}" alt="${p.name}">
                <div class="overlay"><span>View Product</span></div>
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="brand">${p.brand}</p>
                <p class="description">${p.shortDescription}</p>
                <p class="price">$${(p.price/100).toFixed(2)} ${p.originalPrice ? `<span class="original">$${(p.originalPrice/100).toFixed(2)}</span>` : ""}</p>
                <p class="shipping">${p.shipping ? "Free Shipping" : ""}</p>
            </div>
        </a>
    `).join("");

    window.scrollTo(0, scrollY);
}

/* =================================
   RENDER PRODUCT PAGE
================================= */
async function renderProduct(id) {
    window.scrollTo(0,0);
    const container = document.getElementById("main-content");
    const products = await getProducts();
    const product = products.find(p => p.id == id);

    if (!product) {
        container.innerHTML = "<h2>Product Not Found</h2>";
        return;
    }

    container.innerHTML = `
        <div class="product-page">
            <div class="product-images">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="brand">Brand: ${product.brand}</p>
                <p class="price">$${(product.price/100).toFixed(2)} ${product.originalPrice ? `<span class="original">$${(product.originalPrice/100).toFixed(2)}</span>` : ""}</p>
                <p class="description">${product.shortDescription}</p>
            </div>
        </div>
    `;
}

/* =================================
   RENDER STATIC PAGE
================================= */
async function renderPage(pageKey) {
    window.scrollTo(0,0);
    const pages = await getPages();
    const page = pages[pageKey];
    const container = document.getElementById("main-content");

    if (!page) {
        container.innerHTML = `<h2>Page Not Found</h2>`;
        return;
    }

    container.innerHTML = `
        <section class="page">
            <h1>${page.heading}</h1>
            ${page.content.map(block => {
                if(block.type === "paragraph") return `<p>${block.text}</p>`;
                if(block.type === "image") return `<img src="${block.src}" alt="${block.alt}">`;
                return "";
            }).join("")}
        </section>
    `;
}