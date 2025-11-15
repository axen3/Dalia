/* =================================
   LOAD HEADER & FOOTER (ONCE)
================================= */
async function loadHeaderFooter() {
    if (!document.querySelector("header")) {
        const headerRes = await fetch("/includes/header.html");
        document.body.insertAdjacentHTML("afterbegin", await headerRes.text());
        initHeaderMenu();
    }

    if (!document.querySelector("footer")) {
        const footerRes = await fetch("/includes/footer.html");
        document.body.insertAdjacentHTML("beforeend", await footerRes.text());
    }

    bindSpaLinks(); // header/footer links
}

/* =================================
   HEADER MOBILE MENU
================================= */
function initHeaderMenu() {
    const menuBtn = document.querySelector(".menu-btn");
    const navMenu = document.querySelector("nav ul");

    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", () => navMenu.classList.toggle("show"));
    }
}

/* =================================
   SPA LINK BINDING
================================= */
function bindSpaLinks() {
    document.querySelectorAll("a[href^='/']").forEach(link => {
        link.removeEventListener("click", link._spaHandler);

        const handler = (e) => {
            const href = link.getAttribute("href");
            if (!href.startsWith("/")) return;
            e.preventDefault();

            // Close mobile menu if open
            const navMenu = document.querySelector("nav ul");
            if (navMenu && navMenu.classList.contains("show")) {
                navMenu.classList.remove("show");
            }

            // Save index scroll
            const currentState = history.state || {};
            if(window.location.search === "" || window.location.pathname === "/") {
                currentState.scrollY = window.scrollY;
                history.replaceState(currentState, "");
            }

            // Push URL and render SPA route
            window.history.pushState({}, "", href);
            renderRoute();
        };

        link.addEventListener("click", handler);
        link._spaHandler = handler;
    });
}

/* =================================
   ROUTE HANDLER
================================= */
async function renderRoute() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("id")) {
        await renderProduct(urlParams.get("id"));
    } else if (urlParams.has("page")) {
        await renderPage(urlParams.get("page"));
    } else {
        await renderProductList();
    }

    bindSpaLinks(); // re-bind any new links in content
}

/* =================================
   INITIALIZE SPA
================================= */
document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderFooter(); // load once
    renderRoute();
    window.addEventListener("popstate", () => renderRoute());
});