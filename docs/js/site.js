(() => {
  const mediaReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => mediaReduce.matches;
  let rafId = 0;
  let heroParallaxHandler = null;

  const bindQuantitySelectors = () => {
    document.querySelectorAll(".js-qty-increase").forEach((button) => {
      if (!(button instanceof HTMLButtonElement) || button.dataset.qtyBound === "true") {
        return;
      }

      button.dataset.qtyBound = "true";
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target || "");
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        target.value = String(Math.max(1, (parseInt(target.value, 10) || 1) + 1));
      });
    });

    document.querySelectorAll(".js-qty-decrease").forEach((button) => {
      if (!(button instanceof HTMLButtonElement) || button.dataset.qtyBound === "true") {
        return;
      }

      button.dataset.qtyBound = "true";
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target || "");
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        target.value = String(Math.max(1, (parseInt(target.value, 10) || 1) - 1));
      });
    });
  };

  const initPageLifecycleState = () => {
    document.body.classList.add("page-is-entering");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.body.classList.remove("page-is-entering");
        document.body.classList.add("is-page-ready");
      });
    });
  };

  const initHeaderScrollState = () => {
    const apply = () => {
      document.body.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
  };

  const initScrollReveal = () => {
    if (reduceMotion()) {
      document.querySelectorAll(".reveal, .reveal-stagger, .image-reveal").forEach((el) => el.classList.add("is-visible"));
      document.body.classList.add("is-page-ready");
      return;
    }

    const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger, .image-reveal");
    if (!revealTargets.length) {
      return;
    }

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    });

    revealTargets.forEach((target) => observer.observe(target));
  };

  const initHeroParallax = () => {
    if (reduceMotion() || window.matchMedia("(max-width: 991.98px)").matches) {
      return;
    }

    const heroMedia = document.querySelector("[data-hero-parallax]");
    if (!(heroMedia instanceof HTMLElement)) {
      return;
    }

    const heroImage = heroMedia.querySelector("img");
    if (!(heroImage instanceof HTMLImageElement)) {
      return;
    }

    heroMedia.classList.add("is-parallax");

    const update = () => {
      rafId = 0;
      const rect = heroMedia.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height * 0.4 - viewportHeight * 0.5) / viewportHeight));
      const offset = progress * -10;
      heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1)`;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    heroParallaxHandler = onScroll;
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  };

  const initPageTransitions = () => {
    if (reduceMotion()) {
      return;
    }

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      const url = new URL(anchor.href, window.location.origin);
      const sameOrigin = url.origin === window.location.origin;
      if (!sameOrigin) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("page-is-leaving");
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 220);
    });
  };

  const initOffcanvasState = () => {
    const offcanvasIds = ["mobileNav", "cartDrawer", "mobileFilters"];
    offcanvasIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }

      element.addEventListener("shown.bs.offcanvas", () => {
        document.body.classList.add("menu-open");

        if (id === "mobileNav") {
          const firstLink = element.querySelector("a.nav-link");
          if (firstLink instanceof HTMLElement) {
            firstLink.focus();
          }
        }
      });

      element.addEventListener("hidden.bs.offcanvas", () => {
        const anyOpen = document.querySelector(".offcanvas.show");
        if (!anyOpen) {
          document.body.classList.remove("menu-open");
        }
      });
    });
  };

  const initSearchMicroInteraction = () => {
    const searchField = document.getElementById("headerSearch");
    if (searchField instanceof HTMLInputElement) {
      searchField.addEventListener("focus", () => {
        searchField.parentElement?.classList.add("is-search-focused");
      });

      searchField.addEventListener("blur", () => {
        searchField.parentElement?.classList.remove("is-search-focused");
      });
    }

    const pageSearch = document.getElementById("pageSearch");
    if (pageSearch instanceof HTMLInputElement && window.matchMedia("(max-width: 991.98px)").matches) {
      const form = pageSearch.closest(".search-bar");
      pageSearch.addEventListener("focus", () => {
        form?.classList.add("is-mobile-search-active");
      });
      pageSearch.addEventListener("blur", () => {
        form?.classList.remove("is-mobile-search-active");
      });
    }
  };

  const initProductGallery = () => {
    const mainImage = document.getElementById("productMainImage");
    if (!(mainImage instanceof HTMLImageElement)) {
      return;
    }

    const thumbs = document.querySelectorAll(".product-thumb-button[data-product-thumb]");
    if (!thumbs.length) {
      return;
    }

    thumbs.forEach((thumb, index) => {
      if (!(thumb instanceof HTMLButtonElement)) {
        return;
      }

      if (index === 0) {
        thumb.classList.add("is-active");
      }

      thumb.addEventListener("click", () => {
        const src = thumb.dataset.productThumb;
        if (!src || src === mainImage.getAttribute("src")) {
          return;
        }

        mainImage.classList.add("is-switching");
        thumbs.forEach((other) => other.classList.remove("is-active"));
        thumb.classList.add("is-active");

        window.setTimeout(() => {
          mainImage.src = src;
          mainImage.classList.remove("is-switching");
        }, reduceMotion() ? 0 : 190);
      });
    });
  };

  const handleReducedMotionChange = () => {
    if (!reduceMotion()) {
      return;
    }

    document.querySelectorAll(".reveal, .reveal-stagger, .image-reveal").forEach((el) => el.classList.add("is-visible"));

    const heroMedia = document.querySelector("[data-hero-parallax]");
    if (heroMedia instanceof HTMLElement) {
      const image = heroMedia.querySelector("img");
      if (image instanceof HTMLImageElement) {
        image.style.transform = "none";
      }
    }

    if (heroParallaxHandler) {
      window.removeEventListener("scroll", heroParallaxHandler);
      window.removeEventListener("resize", heroParallaxHandler);
      heroParallaxHandler = null;
    }
  };

  const initialize = () => {
    initPageLifecycleState();
    bindQuantitySelectors();
    initHeaderScrollState();
    initScrollReveal();
    initHeroParallax();
    initPageTransitions();
    initOffcanvasState();
    initSearchMicroInteraction();
    initProductGallery();
  };

  document.addEventListener("DOMContentLoaded", initialize);
  document.addEventListener("mangalfoods:cart-updated", bindQuantitySelectors);
  mediaReduce.addEventListener("change", handleReducedMotionChange);
})();
