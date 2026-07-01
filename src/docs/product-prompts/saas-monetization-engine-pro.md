# SaaS Monetization Engine Pro — Prompt Series

A sequential, copy-paste-ready prompt series for installing a complete revenue layer in any Base44 app: products, subscriptions, paywalls, checkout, webhook reconciliation, billing portal, promos, recovery, and revenue analytics.

**How to use:** Run the prompts in order. Do not skip ahead — each prompt builds on the last. Complete the MVP path (Prompts 1–8) before the advanced expansion (Prompts 9–14).

---

## Prompt 1 — Foundation Scan & Monetization Plan

```
Scan my entire app before making any changes. Document: existing entities, existing routes, user roles, any existing payment or plan logic, and the design system (colors, fonts, components).

Then produce a monetization plan for this app that includes:
- What I could sell (one-time products, subscription tiers, or both)
- Recommended plan/tier structure with suggested pricing
- Which existing features should be gated behind which tier
- The entities we will need (do NOT create them yet)
- The payment provider integration approach

Do not build anything yet. Output the plan for my approval first.
```

**Acceptance criteria:** A written plan referencing your real app structure. Nothing is built yet.

---

## Prompt 2 — Product & Plan Entities

```
Create the data layer for monetization. Based on the approved plan, create:

1. A Product entity: name, slug, tagline, description, priceCents, currency, billingType (one_time / subscription), category, imageUrl, features (array), badge, active, order.
2. A Plan entity (if subscriptions): planId, planName, amountCents, cadence, features (array), limits (object), active.
3. A Payment entity: userId, userEmail, productId, planId, itemName, amountCents, currency, providerPaymentId, receiptUrl, status (completed/pending/failed), errorMessage.

Security requirements:
- Products and Plans: public read, admin-only write.
- Payments: users can read only their own records, only admins can write.

Do not build any UI yet. Create the entities with proper access rules only.
```

**Acceptance criteria:** Entities exist with correct row-level security. Regular users cannot write Payment records.

---

## Prompt 3 — Public Pricing & Products Pages

```
Build the public storefront using my existing design system and layout components:

1. A /pricing page showing subscription tiers side by side with feature comparisons, a highlighted "most popular" tier, and clear CTAs.
2. A /products page showing one-time products in a card grid: image, name, tagline, price, features preview, and a Buy button.
3. A /products/:slug detail page: hero with image and price, full feature list, description section, and a bottom CTA.

Requirements:
- Load real data from the Product/Plan entities.
- Reuse my existing navbar, footer, buttons, and typography.
- Fully responsive on mobile and desktop.
- Loading and empty states on every list.
Do not build checkout yet — buttons can link to /checkout?product=ID as a placeholder.
```

**Acceptance criteria:** Pricing and product pages render real entity data, match the existing design, and work on mobile.

---

## Prompt 4 — Secure Checkout Backend Function

```
Create a backend function called createCheckoutLink that generates a hosted checkout link with my payment provider.

Critical security rules:
- Authenticate the user first; reject unauthenticated requests.
- NEVER trust a price sent from the frontend. Resolve all prices server-side from the Product/Plan entity by ID.
- Attach metadata to the checkout: userId, userEmail, productId or planId, and itemName so the webhook can attribute the payment.
- Return only the checkout URL to the frontend.

Then build the /checkout page:
- Reads ?product=ID or ?plan=ID from the URL.
- Shows an order summary (name, price, what's included) before redirecting.
- A "Proceed to payment" button that calls createCheckoutLink and redirects to the returned URL.
- Loading state while the link is being created, and a clear error state if it fails.
```

**Acceptance criteria:** Prices are resolved server-side only. Checkout redirects to the provider's hosted page.

---

## Prompt 5 — Webhook Payment Reconciliation

```
Create a backend function to receive payment webhooks from my provider. This is the ONLY place where access is granted.

Requirements:
- Verify the webhook signature before processing anything. Reject invalid signatures.
- On payment completed: create a Payment record with status "completed", linking userId, productId/planId, amount, and the provider's payment ID and receipt URL.
- Use metadata from the checkout to attribute the payment to the right user. Add a fallback match by customer email if metadata is missing.
- On subscription payments: also update the user's plan on their profile.
- Idempotency: if the same payment event arrives twice, do not create duplicate records.
- Log errors clearly so failed attributions can be found and fixed.

Register the webhook automation, then test the function with a simulated payload and show me the result.
```

**Acceptance criteria:** Signature validation works, duplicate events are ignored, and a test payload produces a correct Payment record.

---

## Prompt 6 — Post-Purchase Flow & Access Granting

```
Build the post-purchase experience:

1. After checkout, the provider redirects back to my app. On that return page, poll for the matching completed Payment record (the webhook may take a few seconds). Show "Confirming your payment..." while polling, with a graceful "still processing" state after 30 seconds.
2. On confirmation, redirect to the dashboard with a thank-you dialog naming what was purchased.
3. Create a getMyPurchases backend function (service role, after authenticating the user) returning everything the current user owns.
4. Add a "My Purchases" section to the dashboard listing owned products/plan with purchase dates.

Access rule: everything the user owns must come from completed Payment records — never from URL params or frontend state.
```

**Acceptance criteria:** Buying grants access only via the webhook-created Payment record; dashboard lists real purchases.

---

## Prompt 7 — Feature Gating & Paywalls

```
Implement plan-based feature gating:

1. Create a single reusable access hook or helper (e.g. useEntitlements) that resolves the current user's plan and owned products in one place. Every gate in the app must use this helper — no scattered plan checks.
2. Gate the premium features from our approved plan. Free users see an attractive locked state with a clear upgrade CTA — never a broken or empty screen.
3. Enforce usage limits (e.g. X items per month on the free tier) with a counter that resets monthly.
4. CRITICAL: every gated action must ALSO be enforced in backend functions, not just hidden in the UI. Verify the user's plan server-side before performing premium operations.

Show me the list of gated features and where each is enforced (frontend + backend).
```

**Acceptance criteria:** One central entitlement helper; every premium action is enforced server-side.

---

## Prompt 8 — MVP Audit (End of Core Build)

```
Run a full audit of the monetization MVP before we expand:

- Can any user get access without paying? Test: manipulating URLs, calling backend functions directly, editing frontend state.
- Are all prices resolved server-side only?
- Does the webhook reject invalid signatures?
- Are duplicate webhook events handled?
- Can users read other users' Payment records?
- Do all checkout flows work on mobile?
- Are loading/error states present on every payment screen?

Fix everything found and give me a report of what was checked and fixed.
```

**Acceptance criteria:** Written audit report; all critical issues fixed.

---

## Prompt 9 — Customer Billing Portal (Advanced)

```
Build a /billing page for authenticated users:

- Current plan with renewal info and plan features.
- Full purchase history: item, date, amount, status, receipt link.
- Upgrade/downgrade buttons that route through the same secure checkout flow.
- For subscriptions: a cancel flow with a confirmation step and a retention message before finalizing.
- Clear empty state for users who haven't bought anything.

Reuse the existing design system. Add the page to the app navigation for logged-in users.
```

---

## Prompt 10 — Promo Codes & Sales System (Advanced)

```
Add a promotion system:

1. A PromoCode entity: code, discountType (percent/fixed), discountValue, appliesTo (all/specific products), maxUses, usedCount, expiresAt, active. Admin-only write.
2. Promo code input on the checkout summary that validates server-side and shows the discounted total.
3. A storewide sale mode: an admin setting with saleName, discountPercent, startsAt, endsAt. When active, show strikethrough original prices and sale badges across pricing/product pages automatically.
4. All discount math happens in the backend checkout function — the frontend only displays it.

Include an admin UI for managing promo codes and the sale settings.
```

---

## Prompt 11 — Failed Payment Recovery (Advanced)

```
Build a dunning/recovery system for failed payments:

1. When a webhook reports a failed subscription payment, record it and mark the user's plan "past_due" — do NOT revoke access immediately.
2. Send a friendly recovery email with a link to update payment/retry.
3. Scheduled automation: after 3 days past_due send a second reminder; after 7 days downgrade to the free tier and email a final notice.
4. Admin view of all past_due users with manual "extend grace" and "downgrade now" actions.
```

---

## Prompt 12 — Admin Revenue Dashboard (Advanced)

```
Build an admin-only /admin/revenue dashboard:

- Stat cards: revenue this month, last month, all time; active subscribers; new customers this month.
- Monthly revenue chart for the last 12 months.
- Revenue breakdown by product/plan.
- Recent payments table with status, customer, item, and amount.
- Failed payment list with error messages.
- All data must come from a backend function that verifies the user is an admin (403 otherwise) — never expose raw payment queries to the client.
```

---

## Prompt 13 — Digital Product Delivery (Advanced)

```
Add secure digital delivery for one-time products:

1. Extend Product with deliverable files (array of { fileUri, fileName }) stored in PRIVATE storage — never public URLs.
2. A getProductDownload backend function: authenticate, verify a completed Payment for that product, then generate short-lived signed URLs.
3. A /download/:productId page listing the buyer's files with download buttons, and a clean "you don't own this yet" state linking to the product page.
4. Admin UI to upload/manage deliverable files per product.
```

---

## Prompt 14 — Final Launch Audit

```
Run the final monetization launch audit:

Security: re-run every check from Prompt 8, plus: signed URLs expire correctly, promo codes can't be reused past maxUses, admin dashboard rejects non-admins, refund/failed states can't grant access.
UX: full purchase journey on mobile and desktop for one product and one subscription — from landing page to thank-you dialog to accessing what was bought.
Data: Payment records are complete and readable in admin; revenue dashboard numbers match the Payment table.

Deliver a final report: everything tested, everything fixed, and any remaining manual setup steps (webhook registration in the provider dashboard, live API keys, etc.).
```

---

*© KodeBase — SaaS Monetization Engine Pro. For the buyer's use in their own projects.*