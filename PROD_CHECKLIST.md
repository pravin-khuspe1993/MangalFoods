# Production Launch Checklist (Mangal Foods)

Use this before switching from test mode to live customer orders.

## 1) Checkout / WhatsApp mode
- [ ] Set `SiteSettings:WhatsAppDryRun` to `false` in production config.
- [ ] Verify checkout opens WhatsApp chat correctly on desktop and mobile.
- [ ] Confirm order message includes name, phone, address, items, totals.

## 2) Business contact details
- [ ] Confirm phone/WhatsApp number is correct: `9594928299`.
- [ ] Confirm support email is correct in UI and configuration.
- [ ] Verify footer and contact page show consistent details.

## 3) Catalog and pricing
- [ ] Validate all product images load (no broken image links).
- [ ] Verify product names, variants, prices, and original prices.
- [ ] Confirm category/tag filters show expected products.

## 4) Cart and totals
- [ ] Add/remove/update quantities from Shop, Product, Cart pages.
- [ ] Verify delivery threshold and delivery fee calculations.
- [ ] Verify totals match expected INR values for edge cases.

## 5) SEO and sharing
- [ ] Verify page title and meta description on Home, Shop, Product pages.
- [ ] Validate canonical tags are present.
- [ ] Test social share preview (Open Graph image/title/description).

## 6) Performance and UX
- [ ] Confirm mobile menu opens and links are visible.
- [ ] Check animation behavior on mobile and reduced-motion mode.
- [ ] Verify first meaningful paint and interaction feel acceptable on mobile data.

## 7) Browser/device sanity checks
- [ ] Chrome (desktop + Android)
- [ ] Edge (desktop)
- [ ] Safari (iOS)
- [ ] Validate cart persistence and checkout flow on each.

## 8) Deployment safety
- [ ] Confirm latest commit is deployed on Render.
- [ ] Review Render logs for startup or runtime warnings.
- [ ] Keep a rollback commit/tag ready before launch.

## 9) Post-launch monitoring (first 24 hours)
- [ ] Place 2-3 real test orders end-to-end.
- [ ] Check order message formatting in WhatsApp.
- [ ] Monitor for broken images, JS errors, or missing product cards.

---

## Quick go-live toggle reminder
In `appsettings.Production.json` (or Render environment-specific configuration), ensure:

`"SiteSettings": { "WhatsAppDryRun": false }`
