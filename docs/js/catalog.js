(() => {
  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  const formatInr = (value) => `₹${inr.format(value || 0)}`;

  const getDiscountPercent = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) {
      return 0;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const pick = (obj, camel, pascal) => obj?.[camel] ?? obj?.[pascal];

  const normalizeProduct = (raw) => {
    const variantsRaw = pick(raw, "variants", "Variants");
    const imagesRaw = pick(raw, "images", "Images");
    const tagsRaw = pick(raw, "tags", "Tags");

    return {
      id: Number(pick(raw, "id", "Id") || 0),
      name: pick(raw, "name", "Name") || "",
      slug: pick(raw, "slug", "Slug") || "",
      category: pick(raw, "category", "Category") || "",
      shortDescription: pick(raw, "shortDescription", "ShortDescription") || "",
      description: pick(raw, "description", "Description") || "",
      price: Number(pick(raw, "price", "Price") || 0),
      originalPrice: Number(pick(raw, "originalPrice", "OriginalPrice") || 0),
      rating: Number(pick(raw, "rating", "Rating") || 0),
      isFeatured: Boolean(pick(raw, "isFeatured", "IsFeatured")),
      isBestseller: Boolean(pick(raw, "isBestseller", "IsBestseller")),
      vegetarian: Boolean(pick(raw, "vegetarian", "Vegetarian")),
      images: Array.isArray(imagesRaw) ? imagesRaw : [],
      tags: Array.isArray(tagsRaw) ? tagsRaw : [],
      variants: Array.isArray(variantsRaw)
        ? variantsRaw.map((v) => ({
          name: pick(v, "name", "Name") || "Standard",
          price: Number(pick(v, "price", "Price") || 0)
        }))
        : []
    };
  };

  const renderProductCard = (product) => {
    const discount = getDiscountPercent(product.price, product.originalPrice);
    const image = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/images/products/placeholder-product.webp";
    const badge = product.isBestseller
      ? '<span class="badge text-bg-dark product-badge">Bestseller</span>'
      : product.isFeatured
        ? '<span class="badge text-bg-secondary product-badge">New</span>'
        : "";

    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="product-card h-100" aria-label="${product.name}">
          <div class="product-image-wrap">
            <img src="${image}" alt="${product.name}" class="img-fluid product-image" loading="lazy" />
            ${badge}
          </div>
          <div class="p-3 d-flex flex-column">
            <h3 class="h6 mb-1">${product.name}</h3>
            <p class="small text-muted mb-2">${product.shortDescription || ""}</p>
            <p class="mb-2 rating-text" aria-label="Rating ${product.rating || 0} out of 5">★ ${(product.rating || 0).toFixed(1)}</p>
            <div class="mb-3">
              <span class="fw-semibold">${formatInr(product.price)}</span>
              ${product.originalPrice > product.price ? `<span class="text-muted text-decoration-line-through ms-2">${formatInr(product.originalPrice)}</span><span class="text-success ms-2">${discount}% off</span>` : ""}
            </div>
            <div class="mt-auto d-flex gap-2">
              <button type="button" class="btn btn-dark btn-sm flex-grow-1 js-add-to-cart"
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-product-image="${image}"
                data-product-slug="${product.slug}"
                data-default-variant="${(product.variants && product.variants[0] ? product.variants[0].name : "Standard")}">Add to Cart</button>
              <a href="/product/${product.slug}" class="btn btn-outline-dark btn-sm">View Details</a>
            </div>
          </div>
        </article>
      </div>`;
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

  const renderGrid = (gridRoot, products) => {
    if (!gridRoot) {
      return;
    }

    if (!products.length) {
      gridRoot.innerHTML = `
        <div class="empty-state p-4 rounded-4 text-center">
          <h2 class="h5">No products found</h2>
          <p class="text-muted mb-0">Try changing your search or filters.</p>
        </div>`;
      return;
    }

    gridRoot.innerHTML = `<div class="row g-4">${products.map(renderProductCard).join("")}</div>`;
  };

  const initCatalog = () => {
    const root = document.querySelector("[data-catalog-root]");
    if (!root) {
      return;
    }

    const raw = root.getAttribute("data-catalog") || "[]";
    let products = [];
    try {
      const parsed = JSON.parse(raw);
      products = Array.isArray(parsed) ? parsed.map(normalizeProduct) : [];
    } catch {
      products = [];
    }

    const gridRoot = document.getElementById("productGridRoot");
    const searchInput = document.getElementById("pageSearch");
    const categoryInput = document.getElementById("filterCategory");
    const maxPriceInput = document.getElementById("filterPrice");
    const bestsellerInput = document.getElementById("filterBestseller");
    const featuredInput = document.getElementById("filterFeatured");
    const vegetarianInput = document.getElementById("filterVegetarian");
    const sortInput = document.getElementById("sortBy");

    const state = {
      q: normalize(searchInput ? searchInput.value : ""),
      category: normalize(categoryInput ? categoryInput.value : ""),
      maxPrice: Number(maxPriceInput ? maxPriceInput.value : 0),
      bestseller: Boolean(bestsellerInput && bestsellerInput.checked),
      featured: Boolean(featuredInput && featuredInput.checked),
      vegetarian: Boolean(vegetarianInput && vegetarianInput.checked),
      sort: sortInput ? sortInput.value : "featured"
    };

    const syncAndRender = () => {
      const filtered = applyFilters(products, state);
      renderGrid(gridRoot, filtered);
      window.mangalFoods?.bindAddToCartButtons?.();
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

  document.addEventListener("DOMContentLoaded", initCatalog);
})();
