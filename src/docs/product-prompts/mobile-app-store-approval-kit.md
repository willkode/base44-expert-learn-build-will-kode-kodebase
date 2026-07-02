# Mobile App Store Approval Kit

8 ordered prompts that fix the most common reasons Base44 mobile exports get rejected by the Apple App Store and Google Play.

**How to use this kit:** Run Base44's built-in mobile scan first and copy the scan results. Then run Prompt 1 (Master Readiness). If your app sells anything digital, run Prompt 2 (Stripe Compliance) before submitting. Run the remaining prompts as needed based on what the audits find.

**The hard limit you should know:** Base44 mobile export runs your published app inside a secure webview wrapper. Native-only features like full offline mode and push notifications are limited. Stripe is allowed for physical goods and real-world services, but digital goods, subscriptions, and in-app feature unlocks cannot use Stripe inside the mobile app — those require StoreKit (Apple) or Google Play Billing (Google), which prompts cannot add.

---

## Prompt 1 — Master Mobile App Store Readiness (run this first)

```
Audit this Base44 app for Apple App Store and Google Play mobile submission readiness.

Treat the app as a webview-based mobile app. Review every page, route, button, form, auth flow, payment flow, onboarding flow, navigation item, and public/legal page.

Find and fix issues related to:

1. Mobile responsiveness
2. Touch-friendly spacing
3. Broken buttons or dead links
4. Desktop-only layouts
5. Modals that overflow on mobile
6. Forms that are hard to use on mobile
7. Login/signup issues
8. Missing loading, empty, and error states
9. Missing privacy policy and terms links before signup
10. Any gated route that prevents app reviewers from seeing the app
11. Any checkout, subscription, credit, upgrade, or digital purchase flow that may violate Apple or Google payment rules
12. Any page that feels like a thin website wrapper instead of an app-like experience
13. Any permission-related feature that needs explanation in the privacy policy
14. Any external links that open awkwardly inside the mobile app
15. Any iframe, popup, new-tab, or embedded checkout behavior that may fail in a mobile webview

Do not remove core business functionality unless it creates a compliance risk. Instead, create safe mobile-specific alternatives where needed.

After fixing, provide:
- A list of issues found
- A list of changes made
- A list of anything that still requires native code, StoreKit, Google Play Billing, or a custom wrapper
- A final app-store readiness checklist
```

---

## Prompt 2 — Stripe / Digital Purchase Compliance (the big one)

```
Audit this app for payment compliance on iOS and Android.

Find every place where the app sells or promotes:
- subscriptions
- premium access
- credits
- tokens
- AI usage packs
- digital downloads
- digital courses
- memberships
- unlockable features
- account upgrades
- paid app functionality
- paid content consumed inside the app

For each payment flow, classify it as one of these:

A. Physical goods or real-world services consumed outside the app
B. Digital goods, subscriptions, credits, or app functionality consumed inside the app
C. Ambiguous / needs business decision

For category A, Stripe may remain.

For category B, remove or disable Stripe checkout inside the mobile app experience. Replace it with a mobile-safe locked state that says the feature requires an active plan, without linking to Stripe or pushing users to an external payment method unless the current platform rules allow that specific flow.

Create a clean entitlement system that checks whether the user already has access. Existing paid users should be able to log in and use what they already purchased.

Add admin-controlled feature flags for:
- enable_web_checkout
- enable_mobile_checkout
- enable_ios_iap_required_notice
- enable_android_billing_required_notice
- mobile_payments_disabled

Add clear comments or admin notes explaining that native StoreKit / Google Play Billing is required before selling digital goods directly inside the mobile app.

Do not implement fake StoreKit or fake Google Play Billing. Do not pretend Stripe is compliant for digital goods inside the mobile app.
```

---

## Prompt 3 — App-Like Experience (beats Apple's 4.2 rejection)

Apple's guideline 4.2 says apps should have features, content, and UI that elevate them beyond a simple website wrapper.

```
Improve this Base44 app so it feels more like a real mobile app and less like a repackaged website.

Focus on:
- mobile-first navigation
- bottom navigation where appropriate
- thumb-friendly buttons
- app-style dashboard/home screen
- clear logged-in experience
- reduced marketing-page feel after login
- native-feeling cards, lists, tabs, and action buttons
- no desktop-only hover interactions
- no tiny text or cramped layouts
- no huge hero sections that waste mobile screen space
- fast access to the app's primary action
- proper loading, empty, success, and error states
- clear account/settings area
- clear support/contact area
- visible privacy policy and terms links before login/signup

Keep the brand and core functionality, but restructure the mobile experience so a reviewer can immediately understand why this belongs in the app store.
```

---

## Prompt 4 — Privacy Policy / Terms Access

Privacy policy and terms pages should be reachable before registration or sign-in — from the entry page, footer, login, or signup screen.

```
Audit and fix the app's legal page access for app-store review.

Make sure the app has:
- a Privacy Policy page
- a Terms of Use page
- visible links to both before login/signup
- visible links to both in the footer or menu
- visible links to both from the login and signup screens
- a support/contact link
- clear explanation of what data the app collects
- clear explanation of why the app collects that data
- clear explanation of any camera, location, microphone, file upload, notification, or device-related permissions used by the app

If legal pages are missing, create clean placeholder pages using plain, professional language. Do not make legal claims that are too specific unless the app already provides that information. Add obvious placeholders where the app owner must fill in company name, contact email, data retention policy, and third-party services.
```

---

## Prompt 5 — Reviewer Access / Demo Account

```
Prepare this app for Apple and Google reviewer access.

Audit all gated routes, login requirements, onboarding screens, paid areas, admin areas, and role-based pages.

Create a reviewer-friendly flow that allows app reviewers to understand the app without getting blocked.

Add one of the following, whichever fits the app best:
- demo mode
- reviewer demo account instructions
- public preview flow
- sample data mode
- guided onboarding path

Make sure the reviewer can test:
- signup or login
- main dashboard
- core app feature
- user profile/settings
- support/contact
- privacy policy
- terms of use
- any purchase-gated feature in locked/demo state

Do not expose real user data. Use safe sample data only.
```

---

## Prompt 6 — Mobile Webview Bug Fix

```
Fix this app for mobile webview behavior.

Search for and fix anything that may break inside an iOS or Android webview, including:
- external links
- popups
- new-tab behavior
- embedded checkout
- iframe content
- file uploads
- camera access
- viewport overflow
- sticky headers that cover content
- fixed-position buttons that overlap mobile browser UI
- modals that cannot be closed
- forms hidden behind the keyboard
- authentication redirects
- OAuth callback issues
- local storage/session issues
- back button behavior
- pages that require refresh to update

For every risky pattern, replace it with a mobile-safe pattern.

After changes, give me a checklist of flows to test on:
- iPhone Safari
- Android Chrome
- Base44 mobile preview
- installed app/webview build
```

---

## Prompt 7 — Google Login / SHA-256 Issue

Google login may require adding the Google Play App Signing SHA-256 fingerprint inside Base44 after configuring the Play Console build.

```
Audit this app for Google login issues in the mobile app version.

Check whether the app uses Google authentication or OAuth.

If yes, create a clear setup checklist for the app owner that explains:
- where Google login is used
- what redirect/callback behavior must work
- what must be tested in the web app
- what must be tested in the Android build
- that the Google Play App Signing SHA-256 fingerprint must be added in Base44 if Google login is used in the Google Play version
- what symptoms indicate a SHA or OAuth configuration issue

Do not invent credentials or fingerprints. Only create the checklist and update app-facing error messages so login failures are understandable.
```

---

## Prompt 8 — Native Wrapper Handoff (when you need the real fix)

```
Create a technical handoff document for converting this Base44 app into a custom Capacitor/native wrapper.

Include:
- app name
- Base44 production URL
- required native features
- required iOS features
- required Android features
- authentication flows
- payment flows
- subscription/entitlement logic
- Stripe usage
- StoreKit requirements
- Google Play Billing requirements
- push notification requirements
- deep link requirements
- file upload/camera/location requirements
- privacy policy requirements
- app-store review risks
- recommended test plan
- exact places where the Base44 app must communicate with native code

Also identify which features can remain inside Base44 and which features must be implemented in native code.
```

---

## The honest breakdown

**Prompts can usually fix:**
- Bad mobile layouts
- Broken buttons
- Missing legal pages
- Bad reviewer access
- Thin website feel
- Stripe checkout visibility issues
- Gated pages
- Unclear subscription states
- Mobile webview bugs
- Privacy/terms problems
- App-store scan failures

**Prompts usually cannot fix:**
- Native StoreKit
- Native Google Play Billing
- Native push notifications
- Full offline mode
- Native background tasks
- HealthKit
- Advanced device permissions
- True native performance issues
- Apple/Google rejection caused by the wrapper itself

**Recommended flow:** Run the Base44 mobile scan first, copy the scan results, then run Prompt 1 (Master Readiness). After that, run Prompt 2 (Stripe/Digital Purchase Compliance) before submitting any paid digital app.