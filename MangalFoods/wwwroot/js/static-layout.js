(() => {
  const config = window.mangalFoodsConfig || {};

  const applyBodyData = () => {
    const body = document.body;
    if (!body) {
      return;
    }

    body.dataset.deliveryCharge = String(config.deliveryCharge ?? 0);
    body.dataset.freeDeliveryThreshold = String(config.freeDeliveryThreshold ?? 0);
    body.dataset.whatsappNumber = String(config.whatsappNumber || "");
    body.dataset.businessName = String(config.businessName || "Business");
    body.dataset.whatsappDryRun = String(Boolean(config.whatsappDryRun));
    body.dataset.pagePath = window.location.pathname;
    body.dataset.siteBasePath = config.siteBasePath || "";
  };

  const headerMarkup = () => `
<header class="site-header sticky-top" role="banner">
  <nav class="navbar navbar-expand-lg" data-nav-shell>
    <div class="container-fluid container-xl">
      <button class="btn d-lg-none nav-icon-btn mobile-icon-link" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-controls="mobileNav" aria-label="Open navigation menu">
        <i class="bi bi-list"></i>
      </button>

      <a class="navbar-brand brand-mark" href="index.html" aria-label="${config.businessName || "Mangal Foods"} home">
        <span class="brand-title">${config.businessName || "Mangal Foods"}</span>
      </a>

      <div class="d-flex d-lg-none align-items-center gap-2 mobile-quick-actions">
        <a href="shop.html" class="nav-icon-btn mobile-icon-link" aria-label="Search products"><i class="bi bi-search"></i></a>
        <a href="cart.html" class="nav-icon-btn position-relative mobile-icon-link" aria-label="View cart">
          <i class="bi bi-bag"></i>
          <span id="cartCountBadgeMobile" class="cart-count-badge">0</span>
        </a>
      </div>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="sweets.html">Sweets</a></li>
          <li class="nav-item"><a class="nav-link" href="savouries.html">Savouries</a></li>
          <li class="nav-item"><a class="nav-link" href="gifting.html">Gifting</a></li>
          <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
          <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
          <li class="nav-item d-none d-lg-block">
            <form class="d-flex" method="get" action="shop.html" role="search" aria-label="Search products">
              <label class="visually-hidden" for="headerSearch">Search products</label>
              <input id="headerSearch" name="q" class="form-control form-control-sm search-field" type="search" placeholder="Search" />
            </form>
          </li>
          <li class="nav-item ms-lg-2">
            <a class="nav-link position-relative" href="cart.html" aria-label="View cart">
              <i class="bi bi-bag"></i>
              <span id="cartCountBadge" class="cart-count-badge">0</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileNav" aria-labelledby="mobileNavLabel">
    <div class="offcanvas-header">
      <h2 class="offcanvas-title h5" id="mobileNavLabel">Menu</h2>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <nav aria-label="Mobile navigation">
        <ul class="list-unstyled mb-0 mobile-nav-list reveal-stagger">
          <li class="mb-2"><a class="nav-link" href="index.html">Home</a></li>
          <li class="mb-2"><a class="nav-link" href="shop.html">Shop</a></li>
          <li class="mb-2"><a class="nav-link" href="sweets.html">Sweets</a></li>
          <li class="mb-2"><a class="nav-link" href="savouries.html">Savouries</a></li>
          <li class="mb-2"><a class="nav-link" href="gifting.html">Gifting</a></li>
          <li class="mb-2"><a class="nav-link" href="about.html">About</a></li>
          <li class="mb-2"><a class="nav-link" href="contact.html">Contact</a></li>
          <li><a class="nav-link" href="faq.html">FAQ</a></li>
        </ul>
      </nav>
    </div>
  </div>
</header>`;

  const footerMarkup = () => `
<footer class="site-footer mt-5 reveal reveal-up" role="contentinfo">
  <div class="container-xl py-5">
    <div class="row g-4 reveal-stagger">
      <div class="col-lg-4">
        <h2 class="h5 mb-3">${config.businessName || "Mangal Foods"}</h2>
        <p class="text-muted mb-3">Premium Indian sweets, savouries, and gifting experiences crafted for celebration.</p>
        <p class="mb-1"><a href="tel:${config.phoneRaw || "9594928299"}">${config.phoneDisplay || "+91 95949 28299"}</a></p>
        <p class="mb-1"><a href="mailto:${config.email || "hello@mangalfoods.in"}">${config.email || "hello@mangalfoods.in"}</a></p>
        <p class="text-muted mb-0">${config.address || "Bandra West, Mumbai, Maharashtra 400050"}</p>
      </div>
      <div class="col-sm-6 col-lg-4">
        <h2 class="h6 text-uppercase mb-3">Quick Links</h2>
        <ul class="list-unstyled footer-links">
          <li><a href="shop.html">Shop</a></li>
          <li><a href="gifting.html">Gifting</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="col-sm-6 col-lg-4">
        <h2 class="h6 text-uppercase mb-3">Follow</h2>
        <div class="d-flex gap-3 mb-3">
          <a href="${config.instagramUrl || "#"}" target="_blank" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          <a href="${config.facebookUrl || "#"}" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
        </div>
        <form class="newsletter-form" action="contact.html" method="get">
          <label for="newsletterEmail" class="form-label">Newsletter</label>
          <div class="input-group">
            <input id="newsletterEmail" type="email" class="form-control" placeholder="Enter your email" aria-label="Email address" />
            <button type="submit" class="btn btn-dark">Join</button>
          </div>
        </form>
      </div>
    </div>
    <hr class="my-4" />
    <p class="small text-muted mb-0">&copy; <span data-dynamic-year></span> ${config.businessName || "Mangal Foods"}. All rights reserved.</p>
  </div>
</footer>`;

  const cartDrawerMarkup = () => `
<aside class="offcanvas offcanvas-end" tabindex="-1" id="cartDrawer" aria-labelledby="cartDrawerLabel">
  <div class="offcanvas-header">
    <h2 class="offcanvas-title h5" id="cartDrawerLabel">Your Cart</h2>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close cart"></button>
  </div>
  <div class="offcanvas-body">
    <div id="cartDrawerItems" class="mb-3" aria-live="polite"></div>
    <section class="cart-summary card border-0 shadow-sm rounded-4" aria-labelledby="cart-summary-title-drawer">
      <div class="card-body">
        <h2 id="cart-summary-title-drawer" class="h6 mb-3">Order Summary</h2>
        <dl class="row mb-0">
          <dt class="col-7">Subtotal</dt><dd class="col-5 text-end" id="summarySubtotal">₹0</dd>
          <dt class="col-7">Delivery</dt><dd class="col-5 text-end" id="summaryDelivery">₹0</dd>
          <dt class="col-7 fw-semibold">Total</dt><dd class="col-5 text-end fw-semibold" id="summaryTotal">₹0</dd>
        </dl>
      </div>
    </section>
    <a href="checkout.html" class="btn btn-dark w-100 mt-3">Proceed to Checkout</a>
  </div>
</aside>`;

  const markActiveLink = () => {
    const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("a.nav-link").forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("http")) {
        return;
      }

      const href = rawHref.split("?")[0].split("#")[0].toLowerCase();
      if (href === page || (page === "" && href === "index.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  };

  const initializeLayout = () => {
    applyBodyData();

    const headerHost = document.querySelector("[data-site-header]");
    if (headerHost) {
      headerHost.innerHTML = headerMarkup();
    }

    const footerHost = document.querySelector("[data-site-footer]");
    if (footerHost) {
      footerHost.innerHTML = footerMarkup();
    }

    const cartHost = document.querySelector("[data-cart-drawer-host]");
    if (cartHost) {
      cartHost.innerHTML = cartDrawerMarkup();
    }

    document.querySelectorAll("[data-dynamic-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });

    markActiveLink();
  };

  document.addEventListener("DOMContentLoaded", initializeLayout);
})();
