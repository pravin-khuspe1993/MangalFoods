# Deploy Mangal Foods as Pure Static Site on GitHub Pages

This repository now includes a static deployment folder: `docs/`.

## What to deploy
- Publish source: `master` branch
- Folder: `/docs`

## GitHub Pages setup
1. Push all changes to GitHub.
2. Open repository settings.
3. Go to **Pages**.
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **master**
   - Folder: **/docs**
5. Save and wait for deployment.

## URL
Site will be available at:
`https://pravin-khuspe1993.github.io/MangalFoods/`

## Notes
- This version is pure static HTML/CSS/JS.
- No ASP.NET runtime, C#, server, DB, or API is required for deployment.
- Product details route uses: `product.html?slug=<product-slug>`.
- `404.html` is included for fallback redirect behavior.

## Optional config
If your repo name changes, update `siteBasePath` in:
- `docs/js/static-config.js`

For current repo deployment, leave it as empty string.
