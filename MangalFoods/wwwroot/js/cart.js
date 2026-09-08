(() => {
  const storageKeys = {
    cart: "mangalfoods.cart",
    catalog: "mangalfoods.catalog"
  };

  const inrFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  const bodyData = document.body?.dataset || {};
  const deliveryChargePaise = Math.round(Number(bodyData.deliveryCharge || "0") * 100);
  const freeDeliveryThresholdPaise = Math.round(Number(bodyData.freeDeliveryThreshold || "0") * 100);

  const toPaise = (amount) => Math.round(Number(amount || 0) * 100);
  const fromPaise = (paise) => paise / 100;
  const formatInr = (paise) => `₹${inrFormatter.format(fromPaise(paise))}`;

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getCart = () => {
    const cart = readJson(storageKeys.cart, []);
    return Array.isArray(cart) ? cart : [];
  };

  const saveCart = (cart) => {
    writeJson(storageKeys.cart, cart);
    document.dispatchEvent(new CustomEvent("mangalfoods:cart-updated"));
  };

  const getCatalog = () => {
    const catalog = readJson(storageKeys.catalog, []);
    return Array.isArray(catalog) ? catalog : [];
  };

  const upsertCatalogItem = (item) => {
    if (!item || !item.id) {
      return;
    }

    const catalog = getCatalog();
    const existingIndex = catalog.findIndex((entry) => Number(entry.id) === Number(item.id));

    const normalized = {
      id: Number(item.id),
      name: item.name || "Product",
      slug: item.slug || "",
      image: item.image || "/images/products/placeholder-product.webp",
      pricePaise: toPaise(item.price || 0)
    };

    if (existingIndex >= 0) {
      catalog[existingIndex] = normalized;
    } else {
      catalog.push(normalized);
    }

    writeJson(storageKeys.catalog, catalog);
  };

  const resolveVariantAndPrice = (button) => {
    const variantSelectId = button.dataset.variantSelectId;
    const defaultVariant = button.dataset.defaultVariant || "Standard";

    if (!variantSelectId) {
      const dataPrice = Number(button.dataset.productPrice || 0);
      return {
        variant: defaultVariant,
        price: dataPrice
      };
    }

    const select = document.getElementById(variantSelectId);
    if (!select || !(select instanceof HTMLSelectElement) || select.selectedIndex < 0) {
      return {
        variant: defaultVariant,
        price: Number(button.dataset.productPrice || 0)
      };
    }

    const selectedOption = select.options[select.selectedIndex];
    const variant = selectedOption.value || defaultVariant;
    const optionPrice = Number(selectedOption.dataset.price || button.dataset.productPrice || 0);
    return { variant, price: optionPrice };
  };

  const resolveQuantity = (button) => {
    const quantityInputId = button.dataset.quantityInputId;
    if (!quantityInputId) {
      return 1;
    }

    const input = document.getElementById(quantityInputId);
    const quantity = Number(input instanceof HTMLInputElement ? input.value : "1");
    return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  };

  const addToCart = (entry) => {
    const cart = getCart();
    const key = `${entry.productId}::${entry.variant}`;
    const existing = cart.find((item) => `${item.productId}::${item.variant}` === key);

    if (existing) {
      existing.quantity += entry.quantity;
    } else {
      cart.push(entry);
    }

    saveCart(cart);
  };

  const bindAddToCartButtons = () => {
    document.querySelectorAll(".js-add-to-cart").forEach((button) => {
      if (!(button instanceof HTMLButtonElement) || button.dataset.boundAddToCart === "true") {
        return;
      }

      button.dataset.boundAddToCart = "true";
      button.addEventListener("click", () => {
        const productId = Number(button.dataset.productId || 0);
        if (!productId) {
          return;
        }

        const { variant, price } = resolveVariantAndPrice(button);
        const quantity = resolveQuantity(button);

        addToCart({
          productId,
          variant,
          quantity
        });

        upsertCatalogItem({
          id: productId,
          name: button.dataset.productName,
          slug: button.dataset.productSlug,
          image: button.dataset.productImage,
          price
        });

        const originalText = button.textContent;
        button.classList.add("is-added");
        button.textContent = "Added";
        window.setTimeout(() => {
          button.textContent = originalText || "Add to Cart";
          button.classList.remove("is-added");
        }, 760);
      });
    });
  };

  const computeTotals = (cart, catalog) => {
    const catalogMap = new Map(catalog.map((item) => [Number(item.id), item]));

    let subtotalPaise = 0;
    const lines = cart.map((item) => {
      const product = catalogMap.get(Number(item.productId));
      const unitPricePaise = product?.pricePaise ?? 0;
      const quantity = Number(item.quantity || 0);
      const lineSubtotalPaise = unitPricePaise * quantity;
      subtotalPaise += lineSubtotalPaise;

      return {
        ...item,
        productName: product?.name || `Product #${item.productId}`,
        productSlug: product?.slug || "",
        productImage: product?.image || "/images/products/placeholder-product.webp",
        unitPricePaise,
        lineSubtotalPaise
      };
    });

    const deliveryPaise = subtotalPaise <= 0
      ? 0
      : subtotalPaise >= freeDeliveryThresholdPaise
        ? 0
        : deliveryChargePaise;

    const totalPaise = subtotalPaise + deliveryPaise;

    return {
      lines,
      subtotalPaise,
      deliveryPaise,
      totalPaise
    };
  };

  const updateCartBadges = () => {
    const count = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    ["cartCountBadge", "cartCountBadgeMobile"].forEach((id) => {
      const badge = document.getElementById(id);
      if (badge) {
        const previous = Number(badge.textContent || "0");
        badge.textContent = String(count);
        badge.setAttribute("aria-label", `Cart items: ${count}`);

        if (previous !== count) {
          badge.classList.remove("is-bump");
          void badge.offsetWidth;
          badge.classList.add("is-bump");
        }
      }
    });
  };

  const updateSummaryDom = (totals) => {
    const subtotalEl = document.getElementById("summarySubtotal");
    const deliveryEl = document.getElementById("summaryDelivery");
    const totalEl = document.getElementById("summaryTotal");

    if (subtotalEl) {
      subtotalEl.textContent = formatInr(totals.subtotalPaise);
    }

    if (deliveryEl) {
      deliveryEl.textContent = totals.deliveryPaise === 0 && totals.subtotalPaise > 0
        ? "FREE"
        : formatInr(totals.deliveryPaise);
    }

    if (totalEl) {
      totalEl.textContent = formatInr(totals.totalPaise);
    }
  };

  const renderCartItemsPage = () => {
    const container = document.getElementById("cartItemsContainer");
    if (!container) {
      return;
    }

    const emptyState = document.getElementById("cartEmptyState");
    const clearButton = document.getElementById("clearCartButton");

    const cart = getCart();
    const catalog = getCatalog();
    const totals = computeTotals(cart, catalog);

    if (!totals.lines.length) {
      container.innerHTML = "";
      emptyState?.classList.remove("d-none");
      clearButton?.classList.add("d-none");
      updateSummaryDom(totals);
      return;
    }

    emptyState?.classList.add("d-none");
    clearButton?.classList.remove("d-none");

    container.innerHTML = totals.lines.map((line, index) => `
      <article class="p-3 bg-white rounded-4 shadow-sm" data-cart-index="${index}">
        <div class="d-flex gap-3 align-items-start">
          <img src="${line.productImage}" alt="${line.productName}" width="92" height="78" class="rounded-3" loading="lazy" />
          <div class="flex-grow-1">
            <h2 class="h6 mb-1">${line.productName}</h2>
            <p class="text-muted small mb-1">Variant: ${line.variant || "Standard"}</p>
            <p class="small mb-2">${formatInr(line.unitPricePaise)} each</p>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-outline-dark btn-sm js-cart-decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
              <span aria-live="polite">${line.quantity}</span>
              <button type="button" class="btn btn-outline-dark btn-sm js-cart-increase" data-index="${index}" aria-label="Increase quantity">+</button>
              <button type="button" class="btn btn-link btn-sm text-danger text-decoration-none ms-2 js-cart-remove" data-index="${index}">Remove</button>
            </div>
          </div>
          <p class="fw-semibold mb-0">${formatInr(line.lineSubtotalPaise)}</p>
        </div>
      </article>`).join("");

    updateSummaryDom(totals);
    bindCartLineActions();
  };

  const bindCartLineActions = () => {
    const mutateQuantity = (index, delta) => {
      const cart = getCart();
      const line = cart[index];
      if (!line) {
        return;
      }

      line.quantity = Math.max(1, Number(line.quantity || 1) + delta);
      saveCart(cart);
      renderCartItemsPage();
      renderCartDrawer();
      updateCartBadges();

      const updatedLine = document.querySelector(`[data-cart-index="${index}"]`);
      if (updatedLine instanceof HTMLElement && window.matchMedia("(max-width: 991.98px)").matches) {
        updatedLine.classList.remove("is-qty-updated");
        void updatedLine.offsetWidth;
        updatedLine.classList.add("is-qty-updated");
      }
    };

    document.querySelectorAll(".js-cart-increase").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => mutateQuantity(Number(button.dataset.index), 1));
    });

    document.querySelectorAll(".js-cart-decrease").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => mutateQuantity(Number(button.dataset.index), -1));
    });

    document.querySelectorAll(".js-cart-remove").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const cart = getCart();
        if (index < 0 || index >= cart.length) {
          return;
        }

        const line = button.closest("article");
        if (line instanceof HTMLElement) {
          line.classList.add("cart-line-leaving");
        }

        window.setTimeout(() => {
          cart.splice(index, 1);
          saveCart(cart);
          renderCartItemsPage();
          renderCartDrawer();
          updateCartBadges();
        }, line instanceof HTMLElement ? 180 : 0);
      });
    });
  };

  const bindClearCart = () => {
    const clearButton = document.getElementById("clearCartButton");
    if (!clearButton) {
      return;
    }

    clearButton.addEventListener("click", () => {
      saveCart([]);
      renderCartItemsPage();
      renderCartDrawer();
      updateCartBadges();
    });
  };

  const renderCartDrawer = () => {
    const drawer = document.getElementById("cartDrawerItems");
    if (!drawer) {
      return;
    }

    const cart = getCart();
    const catalog = getCatalog();
    const totals = computeTotals(cart, catalog);

    if (!totals.lines.length) {
      drawer.innerHTML = "<p class='text-muted mb-0'>Your cart is empty.</p>";
      updateSummaryDom(totals);
      return;
    }

    drawer.innerHTML = totals.lines.map((line) => `
      <div class="d-flex justify-content-between small mb-2">
        <div>
          <strong>${line.productName}</strong><br />
          <span class="text-muted">${line.variant || "Standard"} x ${line.quantity}</span>
        </div>
        <span>${formatInr(line.lineSubtotalPaise)}</span>
      </div>`).join("");

    updateSummaryDom(totals);
  };

  const initializeCartModule = () => {
    bindAddToCartButtons();
    bindClearCart();
    renderCartItemsPage();
    renderCartDrawer();
    updateCartBadges();
  };

  document.addEventListener("DOMContentLoaded", initializeCartModule);
  document.addEventListener("mangalfoods:cart-updated", () => {
    renderCartDrawer();
    updateCartBadges();
  });
  window.addEventListener("storage", () => {
    renderCartDrawer();
    updateCartBadges();
  });

  window.mangalFoods = window.mangalFoods || {};
  window.mangalFoods.bindAddToCartButtons = bindAddToCartButtons;
  window.mangalFoods.getCart = getCart;
  window.mangalFoods.getCatalog = getCatalog;
  window.mangalFoods.computeTotals = (cart, catalog) => computeTotals(cart, catalog);
  window.mangalFoods.formatInrPaise = formatInr;
})();
