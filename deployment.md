# Deploying to GitHub Pages

This project publishes a **static** Astro build to GitHub Pages using **GitHub Actions**. The live site URL is:

**https://ps3coder.github.io/portfolio/**

## Why `site` and `base` matter

GitHub serves project sites at `https://<user>.github.io/<repo>/`. This repository is named `portfolio`, so the path prefix is `/portfolio`.

In `astro.config.mjs`:

- `site: 'https://ps3coder.github.io'` — canonical origin for sitemap, RSS, and absolute URLs.
- `base: '/portfolio'` — prefixes client asset paths (`/_astro/...`, public files) so the site works under that subpath.

If you **rename the repository**, update `base` (and optionally `site`) to match the new repo name, then redeploy.

Public assets and links that must work on Pages should use `import.meta.env.BASE_URL` (with a trailing slash normalized in layout/components) instead of hardcoded `/file.ext` paths.

## One-time GitHub setup

1. **Repository** — Use a **public** repo named `portfolio` under `ps3coder` (or change `base` / `site` to match your user and repo name).
2. **Pages** — **Settings → Pages → Build and deployment → Source:** **GitHub Actions** (not “Deploy from a branch” only). Until this is set, the deploy job can fail with **404** / “Ensure GitHub Pages has been enabled”.
3. **Actions permissions** — **Settings → Actions → General → Workflow permissions:** allow **Read and write** if deploy still fails due to token permissions.

## What runs on each push

Workflow: `.github/workflows/deploy-github-pages.yml`

| Trigger | Behavior |
|--------|----------|
| Push to `main` | `npm ci` → `npm run build` → upload `dist/` → deploy to Pages |
| Manual | **Actions → Deploy to GitHub Pages → Run workflow** (`workflow_dispatch`) |

The **build** job must succeed (Astro outputs to `dist/`). The **deploy** job publishes that artifact to the `github-pages` environment.

## Verify a deployment

1. **Actions** — Latest run shows green **build** and **deploy**.
2. **Deployments** — `github-pages` environment shows a successful deployment.
3. **Browser** — Open https://ps3coder.github.io/portfolio/ (hard refresh if you see an old cache).

## Common issues

| Symptom | Likely cause |
|--------|----------------|
| Deploy fails with **404** / “Ensure GitHub Pages has been enabled” | Pages **Source** is not set to **GitHub Actions**, or Pages was never saved after switching. |
| Build OK, blank or broken styles | Missing or wrong `base` for the repo name; or only `index.html` was published without `_astro/` (do not deploy by manually copying a single file). |
| Wrong path / 404 on user site | Project Pages URL always includes the repo name: `/portfolio/`, not the repo root of `github.io`. |
| Private repo, no site on free plan | GitHub Pages for **private** repos requires a paid plan; use a **public** repo for free hosting. |

## Optional: deprecation warnings in Actions

GitHub may annotate runs with Node/action deprecation notices. They do not necessarily break deploys. Periodically update `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact`, and `actions/deploy-pages` to the versions recommended in their READMEs.

## References

- [Astro: Deploy to GitHub](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages documentation](https://docs.github.com/pages)
