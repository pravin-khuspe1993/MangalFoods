# Deploy Mangal Foods to Render (Free Plan)

This project is already prepared for Render using these files at repo root:
- `Dockerfile`
- `.dockerignore`
- `render.yaml`

## Prerequisites
- Push this repository to GitHub.
- Confirm your default branch is up to date.

## Option A (Recommended): Deploy with Blueprint
1. Sign in to Render.
2. Click **New +** -> **Blueprint**.
3. Connect/select your GitHub repo.
4. Render auto-detects `render.yaml`.
5. Click **Apply**.
6. Wait for build and deploy to complete.

After success, open the generated `onrender.com` URL.

## Option B: Manual Web Service (Docker)
1. In Render, click **New +** -> **Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Branch**: your deploy branch (for example `main`)
   - **Plan**: `Free`
4. Create Web Service.

## Verify after deployment
- Home page loads.
- Shop page renders products.
- Add-to-cart works.
- Checkout dry-run behavior matches current config.

## Important notes
- Free plan instances may sleep after inactivity; first request can be slow.
- Do not set a custom start command when using Docker deployment.
- App port is handled by `PORT` in Docker entrypoint.

## Common fixes
- **Build fails on Render**: Ensure repo root contains `Dockerfile` and `MangalFoods/` project folder.
- **404 for images/static files**: Confirm image files are committed to Git and paths match `wwwroot/data/products.json`.
- **Wrong app updated**: Check Render service branch matches the branch you pushed.

## Update process
1. Commit and push changes to the tracked branch.
2. Render auto-deploys (`autoDeploy: true`).
3. Check deploy logs if any failure occurs.
