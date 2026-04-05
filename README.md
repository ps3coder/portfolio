# Portfolio

Personal portfolio site built with [Astro](https://astro.build). Production build is deployed to **GitHub Pages** at [https://ps3coder.github.io/portfolio/](https://ps3coder.github.io/portfolio/).

## Requirements

- Node.js 18+ (local dev; CI uses Node 22)
- npm

## Local development

```sh
npm install
npm run dev
```

Dev server: [http://localhost:4321](http://localhost:4321) (default Astro port).

## Build and preview

```sh
npm run build    # output → dist/
npm run preview  # serve dist/ locally
```

For GitHub Pages, `astro.config.mjs` sets `site` and `base` so asset URLs work under `/portfolio/`. See [deployment.md](./deployment.md) for the full deploy checklist and troubleshooting.

## Project layout

```text
/
├── public/              # Static files (favicons, etc.) → copied to site root
├── src/
│   ├── data/
│   │   └── site.json    # Site copy, projects, experience, skills diagrams, etc.
│   ├── assets/          # Images, SVGs referenced from components
│   ├── components/      # Page sections (Welcome, Projects, About, …)
│   ├── layouts/         # Layout.astro (global shell, theme UI)
│   ├── pages/           # Routes (index.astro → /, test.astro → /test/)
│   └── styles/          # global.css, theme.css
├── .github/workflows/   # deploy-github-pages.yml
├── astro.config.mjs
└── package.json
```

## Documentation

- [deployment.md](./deployment.md) — GitHub Pages setup, first-time enablement, and common failures
- [Astro docs](https://docs.astro.build)
