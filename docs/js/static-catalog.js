(() => {
  const dataPath = "./data/products.json";

  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const formatInr = (value) => `₹${inr.format(value || 0)}`;

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const getDiscountPercent = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) {
      return 0;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getQueryParam = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  };

  const parseBoolean = (value) => normalize(value) === "true";

  const resolveAssetPath = (path) => {
    const value = (path || "").toString().trim();
    if (!value) {
      return "./images/products/placeholder-product.webp";
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    if (value.startsWith("/")) {
      return `.${value}`;
    }

    return value;
  };

  const fetchProducts = async () => {
    const response = await fetch(dataPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load products: ${response.status}`);
    }

    const raw = await response.json();
    return Array.isArray(raw) ? raw : [];
  };

  const toCardMarkup = (product) => {
    const discount = getDiscountPercent(product.price, product.originalPrice);
    const primaryImage = Array.isArray(product.images) && product.images.length
      ? resolveAssetPath(product.images[0])
      : "./images/products/placeholder-product.webp";

    const badge = product.isBestseller
      ? '<span class="badge text-bg-dark product-badge">Bestseller</span>'
      : product.isFeatured
        ? '<span class="badge text-bg-secondary product-badge">New</span>'
        : "";

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="product-card h-100 reveal reveal-up" aria-label="${product.name}">
          <div class="product-image-wrap">
            <img src="${primaryImage}" alt="${product.name}" class="img-fluid product-image" loading="lazy" />
            ${badge}
          </div>
          <div class="p-3 d-flex flex-column">
            <h3 class="h6 mb-1">${product.name}</h3>
            <p class="small text-muted mb-2">${product.shortDescription || ""}</p>
            <p class="mb-2 rating-text" aria-label="Rating ${product.rating || 0} out of 5">★ ${(Number(product.rating || 0)).toFixed(1)}</p>
            <div class="mb-3">
              <span class="fw-semibold">${formatInr(product.price)}</span>
              ${product.originalPrice > product.price ? `<span class="text-muted text-decoration-line-through ms-2">${formatInr(product.originalPrice)}</span><span class="text-success ms-2">${discount}% off</span>` : ""}
            </div>
            <div class="mt-auto d-flex gap-2">
              <button type="button" class="btn btn-dark btn-sm flex-grow-1 js-add-to-cart"
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-product-image="${primaryImage}"
                data-product-slug="${product.slug}"
                data-default-variant="${(product.variants && product.variants[0] ? product.variants[0].name : "Standard")}">Add to Cart</button>
              <a href="product.html?slug=${encodeURIComponent(product.slug)}" class="btn btn-outline-dark btn-sm">View Details</a>
            </div>
          </div>
        </article>
      </div>`;
  };

  const renderEmptyState = (root) => {
    root.innerHTML = `
      <div class="empty-state p-4 rounded-4 text-center">
        <h2 class="h5">No products found</h2>
        <p class="text-muted mb-0">Try changing your search or filters.</p>
      </div>`;
  };

  const renderGrid = (root, products) => {
    if (!root) {
      return;
    }

    if (!products.length) {
      renderEmptyState(root);
      return;
    }

    root.innerHTML = `<div class="row g-4">${products.map(toCardMarkup).join("")}</div>`;
    window.mangalFoods?.bindAddToCartButtons?.();
  };

  const applyFilters = (products, state) => {
    let result = [...products];

    if (state.q) {
      result = result.filter((product) => {
        const tags = Array.isArray(product.tags) ? product.tags.join(" ") : "";
        return [product.name, product.category, product.description, tags]
          .some((field) => normalize(field).includes(state.q));
      });
    }

    if (state.category) {
      result = result.filter((product) => normalize(product.category) === state.category);
    }

    if (state.maxPrice > 0) {
      result = result.filter((product) => Number(product.price || 0) <= state.maxPrice);
    }

    if (state.bestseller) {
      result = result.filter((product) => Boolean(product.isBestseller));
    }

    if (state.featured) {
      result = result.filter((product) => Boolean(product.isFeatured));
    }

    if (state.vegetarian) {
      result = result.filter((product) => Boolean(product.vegetarian));
    }

    switch (state.sort) {
      case "bestseller":
        result.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case "price-asc":
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.rating || 0) - Number(a.rating || 0));
        break;
    }

    return result;
  };

  const renderHomeSections = (products) => {
    const map = {
      bestsellers: (p) => p.isBestseller,
      laddoos: (p) => Array.isArray(p.tags) && p.tags.some((tag) => {
        const t = normalize(tag);
        return t === "ladoo" || t === "laddoo";
      }),
      savouries: (p) => normalize(p.category) === "savouries",
      gifting: (p) => normalize(p.category) === "gift hampers",
      festive: (p) => normalize(p.category) === "festive collection",
      corporate: (p) => normalize(p.category) === "corporate gifting"
    };

    Object.entries(map).forEach(([key, predicate]) => {
      const root = document.querySelector(`[data-home-grid="${key}"]`);
      if (!root) {
        return;
      }

      const subset = products.filter(predicate);
      renderGrid(root, subset);
    });
  };

  const renderCategoryPage = (products) => {
    const root = document.querySelector("[data-category-grid]");
    if (!root) {
      return;
    }

    const category = root.getAttribute("data-category-name") || "";
    const titleEl = document.querySelector("[data-category-title]");
    const descEl = document.querySelector("[data-category-description]");

    if (titleEl && root.getAttribute("data-category-title-text")) {
      titleEl.textContent = root.getAttribute("data-category-title-text");
    }

    if (descEl && root.getAttribute("data-category-description-text")) {
      descEl.textContent = root.getAttribute("data-category-description-text");
    }

    const subset = products.filter((p) => normalize(p.category) === normalize(category));
    renderGrid(root, subset);
  };

  const renderShopPage = (products) => {
    const root = document.querySelector("[data-shop-grid]");
    if (!root) {
      return;
    }

    const searchInput = document.getElementById("pageSearch");
    const categoryInput = document.getElementById("filterCategory");
    const maxPriceInput = document.getElementById("filterPrice");
    const bestsellerInput = document.getElementById("filterBestseller");
    const featuredInput = document.getElementById("filterFeatured");
    const vegetarianInput = document.getElementById("filterVegetarian");
    const sortInput = document.getElementById("sortBy");

    const state = {
      q: normalize(getQueryParam("q") || (searchInput ? searchInput.value : "")),
      category: normalize(getQueryParam("category") || (categoryInput ? categoryInput.value : "")),
      maxPrice: Number(getQueryParam("maxPrice") || (maxPriceInput ? maxPriceInput.value : 5000)),
      bestseller: parseBoolean(getQueryParam("bestseller")) || Boolean(bestsellerInput?.checked),
      featured: parseBoolean(getQueryParam("featured")) || Boolean(featuredInput?.checked),
      vegetarian: parseBoolean(getQueryParam("vegetarian")) || Boolean(vegetarianInput?.checked),
      sort: getQueryParam("sort") || (sortInput ? sortInput.value : "featured")
    };

    if (searchInput) searchInput.value = state.q;
    if (categoryInput) categoryInput.value = state.category ? categoryInput.value = [...categoryInput.options].find((opt) => normalize(opt.value) === state.category)?.value || "" : "";
    if (maxPriceInput) maxPriceInput.value = String(state.maxPrice || 5000);
    if (bestsellerInput) bestsellerInput.checked = state.bestseller;
    if (featuredInput) featuredInput.checked = state.featured;
    if (vegetarianInput) vegetarianInput.checked = state.vegetarian;
    if (sortInput) sortInput.value = state.sort;

    const syncAndRender = () => {
      const filtered = applyFilters(products, state);
      renderGrid(root, filtered);
    };

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.q = normalize(searchInput.value);
        syncAndRender();
      });
    }

    if (categoryInput) {
      categoryInput.addEventListener("change", () => {
        state.category = normalize(categoryInput.value);
        syncAndRender();
      });
    }

    if (maxPriceInput) {
      maxPriceInput.addEventListener("input", () => {
        state.maxPrice = Number(maxPriceInput.value);
        syncAndRender();
      });
    }

    if (bestsellerInput) {
      bestsellerInput.addEventListener("change", () => {
        state.bestseller = bestsellerInput.checked;
        syncAndRender();
      });
    }

    if (featuredInput) {
      featuredInput.addEventListener("change", () => {
        state.featured = featuredInput.checked;
        syncAndRender();
      });
    }

    if (vegetarianInput) {
      vegetarianInput.addEventListener("change", () => {
        state.vegetarian = vegetarianInput.checked;
        syncAndRender();
      });
    }

    if (sortInput) {
      sortInput.addEventListener("change", () => {
        state.sort = sortInput.value;
        syncAndRender();
      });
    }

    syncAndRender();
  };

  const toOption = (variant) => {
    const name = variant?.name || "Standard";
    const price = Number(variant?.price || 0);
    return `<option value="${name}" data-price="${price}">${name} - ${formatInr(price)}</option>`;
  };

  const renderProductPage = (products) => {
    const root = document.querySelector("[data-product-page]");
    if (!root) {
      return;
    }

    const slug = getQueryParam("slug");
    const product = products.find((p) => normalize(p.slug) === normalize(slug));

    if (!product) {
      root.innerHTML = "<section class='py-5'><div class='container-xl'><h1 class='h3'>Product not found</h1></div></section>";
      return;
    }

    const primaryImage = product.images?.[0]
      ? resolveAssetPath(product.images[0])
      : "./images/products/placeholder-product.webp";
    const thumbs = (product.images || []).slice(1).map((img) => resolveAssetPath(img));
    const discount = getDiscountPercent(product.price, product.originalPrice);

    root.innerHTML = `
    <section class="py-4 py-lg-5">
      <div class="container-xl">
        <div class="row g-4 g-lg-5">
          <div class="col-lg-6 reveal reveal-left image-reveal">
            <img id="productMainImage" src="${primaryImage}" class="img-fluid rounded-4 shadow-sm product-main-image" alt="${product.name}" loading="lazy" />
            ${thumbs.length ? `<div class="row g-2 mt-2 product-thumbnails reveal-stagger">${thumbs.map((image) => `<div class="col-4"><button type="button" class="btn p-0 border-0 bg-transparent product-thumb-button" data-product-thumb="${image}" aria-label="View alternate image of ${product.name}"><img src="${image}" class="img-fluid rounded-3" alt="${product.name} alternate view" loading="lazy" /></button></div>`).join("")}</div>` : ""}
          </div>
          <div class="col-lg-6">
            <h1 class="h2 mb-2 reveal reveal-up" style="transition-delay: 40ms;">${product.name}</h1>
            <p class="mb-2 rating-text reveal reveal-up" style="transition-delay: 110ms;">★ ${(Number(product.rating || 0)).toFixed(1)}</p>
            <div class="mb-3 reveal reveal-up" style="transition-delay: 180ms;">
              <span class="h4">${formatInr(product.price)}</span>
              ${product.originalPrice > product.price ? `<span class="text-muted text-decoration-line-through ms-2">${formatInr(product.originalPrice)}</span><span class="text-success ms-2">${discount}% off</span>` : ""}
            </div>
            <p class="text-muted reveal reveal-up" style="transition-delay: 250ms;">${product.description || ""}</p>

            <div class="mb-3 reveal reveal-up" style="transition-delay: 320ms;">
              <label for="variant" class="form-label">Variant</label>
              <select id="variant" class="form-select">
                ${(product.variants || []).map(toOption).join("")}
              </select>
            </div>

            <div class="mb-3 reveal reveal-up" style="transition-delay: 390ms;">
              <label class="form-label">Quantity</label><br />
              <div class="quantity-selector" role="group" aria-label="Quantity selector">
                <button type="button" class="btn btn-outline-dark btn-sm js-qty-decrease" data-target="productQuantity" aria-label="Decrease quantity">-</button>
                <input id="productQuantity" type="number" min="1" value="1" class="form-control form-control-sm text-center quantity-input" aria-label="Quantity" />
                <button type="button" class="btn btn-outline-dark btn-sm js-qty-increase" data-target="productQuantity" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="d-flex gap-2 mb-4 reveal reveal-up" style="transition-delay: 460ms;">
              <button type="button"
                      class="btn btn-dark js-add-to-cart"
                      data-product-id="${product.id}"
                      data-product-name="${product.name}"
                      data-product-price="${product.price}"
                      data-product-image="${primaryImage}"
                      data-product-slug="${product.slug}"
                      data-variant-select-id="variant"
                      data-quantity-input-id="productQuantity">Add to Cart</button>
              <a href="checkout.html" class="btn btn-success">Buy via WhatsApp</a>
            </div>

            <section class="rounded-4 p-3 bg-white shadow-sm reveal reveal-up" style="transition-delay: 530ms;">
              <h2 class="h6">Product Information</h2>
              <p class="mb-1"><strong>Ingredients:</strong> ${product.ingredients || "N/A"}</p>
              <p class="mb-1"><strong>Shelf life:</strong> ${product.shelfLife || "N/A"}</p>
              <p class="mb-0"><strong>Storage:</strong> ${product.storageInstructions || "N/A"}</p>
            </section>
          </div>
        </div>
      </div>
    </section>`;

    window.mangalFoods?.bindAddToCartButtons?.();

    document.dispatchEvent(new CustomEvent("mangalfoods:product-rendered"));
  };

  const initializeCatalog = async () => {
    try {
      const products = await fetchProducts();
      renderHomeSections(products);
      renderCategoryPage(products);
      renderShopPage(products);
      renderProductPage(products);
    } catch {
      const fallbackRoots = [
        ...document.querySelectorAll("[data-home-grid], [data-category-grid], [data-shop-grid], [data-product-page]")
      ];
      fallbackRoots.forEach((root) => {
        if (root instanceof HTMLElement) {
          root.innerHTML = "<div class='empty-state p-4 text-center'><p class='text-muted mb-0'>Unable to load products right now.</p></div>";
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", initializeCatalog);
})();
