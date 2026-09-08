(() => {
  const business = {
    whatsappNumber: document.body?.dataset?.whatsappNumber || "",
    businessName: document.body?.dataset?.businessName || "Business",
    dryRun: (document.body?.dataset?.whatsappDryRun || "false") === "true"
  };

  const isIndianMobile = (value) => /^[6-9]\d{9}$/.test((value || "").trim());
  const isPinCode = (value) => /^\d{6}$/.test((value || "").trim());

  const getField = (id) => document.getElementById(id);

  const customerFields = {
    fullName: "Input_FullName",
    mobileNumber: "Input_MobileNumber",
    whatsappNumber: "Input_WhatsAppNumber",
    email: "Input_Email",
    address: "Input_Address",
    landmark: "Input_Landmark",
    city: "Input_City",
    state: "Input_State",
    pinCode: "Input_PinCode",
    giftMessage: "Input_GiftMessage",
    specialInstructions: "Input_SpecialInstructions"
  };

  const readFormData = () => {
    const result = {};
    Object.entries(customerFields).forEach(([key, id]) => {
      const element = getField(id);
      result[key] = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
        ? element.value.trim()
        : "";
    });

    if (!result.whatsappNumber) {
      result.whatsappNumber = result.mobileNumber;
    }

    return result;
  };

  const validateForm = (data, cartItemsLength) => {
    const errors = [];

    if (cartItemsLength <= 0) {
      errors.push("Your cart is empty. Add products before placing an order.");
    }

    if (!data.fullName) {
      errors.push("Full name is required.");
    }

    if (!data.mobileNumber) {
      errors.push("Mobile number is required.");
    } else if (!isIndianMobile(data.mobileNumber)) {
      errors.push("Please enter a valid Indian mobile number.");
    }

    if (data.whatsappNumber && !isIndianMobile(data.whatsappNumber)) {
      errors.push("Please enter a valid WhatsApp number.");
    }

    if (!data.address) {
      errors.push("Address is required.");
    }

    if (!data.city) {
      errors.push("City is required.");
    }

    if (!data.state) {
      errors.push("State is required.");
    }

    if (!data.pinCode) {
      errors.push("PIN code is required.");
    } else if (!isPinCode(data.pinCode)) {
      errors.push("PIN code must be exactly 6 digits.");
    }

    return errors;
  };

  const generateOrderReference = () => {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const rand = Math.floor(Math.random() * 900 + 100);
    return `MF-${stamp}-${rand}`;
  };

  const buildMessage = (orderRef, lines, totals, data) => {
    const lineBlocks = lines.map((line) => [
      `Product: ${line.productName}`,
      `Variant: ${line.variant || "Standard"}`,
      `Quantity: ${line.quantity}`,
      `Unit Price: ${window.mangalFoods.formatInrPaise(line.unitPricePaise)}`,
      `Subtotal: ${window.mangalFoods.formatInrPaise(line.lineSubtotalPaise)}`,
      ""
    ].join("\n")).join("\n");

    const deliveryText = totals.deliveryPaise === 0 && totals.subtotalPaise > 0
      ? "FREE"
      : window.mangalFoods.formatInrPaise(totals.deliveryPaise);

    return [
      "Hello, I would like to place an order.",
      "",
      `Order Ref: ${orderRef}`,
      "",
      "ORDER DETAILS",
      "------------------------",
      lineBlocks,
      "------------------------",
      `Subtotal: ${window.mangalFoods.formatInrPaise(totals.subtotalPaise)}`,
      `Delivery: ${deliveryText}`,
      `TOTAL: ${window.mangalFoods.formatInrPaise(totals.totalPaise)}`,
      "",
      "CUSTOMER DETAILS",
      "------------------------",
      `Name: ${data.fullName}`,
      `Mobile: ${data.mobileNumber}`,
      `WhatsApp: ${data.whatsappNumber}`,
      `Email: ${data.email || "N/A"}`,
      "",
      "DELIVERY ADDRESS",
      "------------------------",
      `Address: ${data.address}`,
      `Landmark: ${data.landmark || "N/A"}`,
      `City: ${data.city}`,
      `State: ${data.state}`,
      `PIN: ${data.pinCode}`,
      "",
      "GIFT MESSAGE",
      "------------------------",
      data.giftMessage || "N/A",
      "",
      "SPECIAL INSTRUCTIONS",
      "------------------------",
      data.specialInstructions || "N/A",
      "",
      `Please confirm my order with ${business.businessName}.`
    ].join("\n");
  };

  const renderCheckoutItems = () => {
    const container = document.getElementById("checkoutItems");
    if (!container || !window.mangalFoods) {
      return;
    }

    const cart = window.mangalFoods.getCart();
    const catalog = window.mangalFoods.getCatalog();
    const totals = window.mangalFoods.computeTotals(cart, catalog);

    if (!totals.lines.length) {
      container.innerHTML = "<div class='empty-state p-3 text-center'><p class='mb-0 text-muted'>Cart is empty.</p></div>";
      return;
    }

    container.innerHTML = totals.lines.map((line) => `
      <article class="p-3 bg-white rounded-4 shadow-sm">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <h3 class="h6 mb-1">${line.productName}</h3>
            <p class="mb-1 small text-muted">${line.variant || "Standard"} x ${line.quantity}</p>
            <p class="small mb-0">${window.mangalFoods.formatInrPaise(line.unitPricePaise)} each</p>
          </div>
          <p class="fw-semibold mb-0">${window.mangalFoods.formatInrPaise(line.lineSubtotalPaise)}</p>
        </div>
      </article>`).join("");
  };

  const showErrors = (errors) => {
    const errorBox = document.getElementById("checkoutError");
    if (!errorBox) {
      return;
    }

    if (!errors.length) {
      errorBox.classList.add("d-none");
      errorBox.innerHTML = "";
      return;
    }

    errorBox.classList.remove("d-none");
    errorBox.innerHTML = `<ul class="mb-0 ps-3">${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`;
  };

  const onPlaceOrder = () => {
    if (!window.mangalFoods || !business.whatsappNumber) {
      showErrors(["WhatsApp ordering is currently unavailable. Please try again later."]);
      return;
    }

    const cart = window.mangalFoods.getCart();
    const catalog = window.mangalFoods.getCatalog();
    const totals = window.mangalFoods.computeTotals(cart, catalog);
    const data = readFormData();

    const errors = validateForm(data, totals.lines.length);
    showErrors(errors);

    if (errors.length) {
      return;
    }

    const orderRef = generateOrderReference();
    const message = buildMessage(orderRef, totals.lines, totals, data);
    const waUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;

    if (business.dryRun) {
      const panel = document.getElementById("whatsappDryRunPanel");
      const urlField = document.getElementById("dryRunWaUrl");
      const msgField = document.getElementById("dryRunMessage");
      if (panel) {
        panel.classList.remove("d-none");
      }
      if (urlField instanceof HTMLTextAreaElement) {
        urlField.value = waUrl;
      }
      if (msgField instanceof HTMLTextAreaElement) {
        msgField.value = message;
      }
      return;
    }

    window.open(waUrl, "_blank", "noopener");
  };

  const bindCheckout = () => {
    const panel = document.getElementById("whatsappDryRunPanel");
    if (business.dryRun && panel) {
      panel.classList.remove("d-none");
    }

    const button = document.getElementById("placeOrderWhatsApp");
    if (button instanceof HTMLButtonElement) {
      button.addEventListener("click", onPlaceOrder);
      if (business.dryRun) {
        button.textContent = "Generate WhatsApp Preview";
      }
    }

    renderCheckoutItems();
    document.addEventListener("mangalfoods:cart-updated", renderCheckoutItems);
    window.addEventListener("storage", renderCheckoutItems);
  };

  document.addEventListener("DOMContentLoaded", bindCheckout);
})();
