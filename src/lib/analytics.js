// Google Analytics 4 tracking helpers.
// All helpers fail silently when gtag isn't loaded — they never break the app.
// Never pass names, emails, phone numbers, message content, or payment details.

export const trackEvent = (name, params = {}) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
};

export const trackPageView = ({ path, title }) =>
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title || document.title,
  });

// --- CTA tracking ---
export const trackCTA = ({ text, location, destination }) =>
  trackEvent("cta_click", {
    cta_text: text,
    cta_location: location,
    cta_destination: destination,
    page_path: window.location.pathname,
  });

// --- Form tracking (no field values, ever) ---
export const trackFormStart = (formName) =>
  trackEvent("form_start", { form_name: formName, page_path: window.location.pathname });

export const trackFormSubmit = (formName) =>
  trackEvent("form_submit", { form_name: formName, page_path: window.location.pathname });

export const trackFormError = (formName, reason) =>
  trackEvent("form_error", {
    form_name: formName,
    error_reason: String(reason || "unknown").slice(0, 100),
    page_path: window.location.pathname,
  });

// --- Lead generation ---
export const trackLead = ({ leadType, formName }) =>
  trackEvent("generate_lead", {
    lead_type: leadType,
    form_name: formName,
    page_path: window.location.pathname,
  });

export const trackNewsletterSignup = (source) =>
  trackEvent("newsletter_signup", { signup_source: source, page_path: window.location.pathname });

// --- Auth ---
export const trackSignup = (method) => trackEvent("sign_up", { method });
export const trackLogin = (method) => trackEvent("login", { method });

// --- Product usage / activation ---
export const trackProjectCreated = ({ appType, fromPrd } = {}) =>
  trackEvent("project_created", {
    app_type: appType || "unknown",
    from_prd: !!fromPrd,
    page_path: window.location.pathname,
  });

// --- Ecommerce (GA4 recommended events) ---
const itemPayload = ({ id, name, category, price }) => ({
  currency: "USD",
  value: price,
  items: [{ item_id: id, item_name: name, item_category: category, price }],
});

export const trackPricingPlanClick = ({ planId, planName, price }) =>
  trackEvent("pricing_plan_click", {
    plan_id: planId,
    plan_name: planName,
    price,
    page_path: window.location.pathname,
  });

const multiItemPayload = (products) => ({
  currency: "USD",
  value: products.reduce((s, p) => s + (p.price || 0), 0),
  items: products.map((p) => ({ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price })),
});

export const trackViewCart = (products) => trackEvent("view_cart", multiItemPayload(products));
export const trackAddPaymentInfo = (item) =>
  trackEvent("add_payment_info", { payment_type: "square_hosted_checkout", ...itemPayload(item) });

export const trackSelectItem = (item) => trackEvent("select_item", itemPayload(item));
export const trackAddToCart = (item) => trackEvent("add_to_cart", itemPayload(item));
export const trackRemoveFromCart = (item) => trackEvent("remove_from_cart", itemPayload(item));
export const trackViewItem = (item) => trackEvent("view_item", itemPayload(item));
export const trackBeginCheckout = (item) => trackEvent("begin_checkout", itemPayload(item));

export const trackPurchase = ({ transactionId, ...item }) =>
  trackEvent("purchase", { transaction_id: transactionId, ...itemPayload(item) });