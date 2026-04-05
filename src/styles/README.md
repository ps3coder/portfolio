# Styles — Central UI

- **`theme.css`** — Design tokens (colors, shadows, radius). Use `var(--color-bg)`, `var(--color-ink)`, etc. in components. Light/dark is handled here (`:root` and `prefers-color-scheme: dark` or `[data-theme="dark"]`).
- **`global.css`** — Base reset and layout; imports `theme.css`. Loaded once in `Layout.astro`.

To add new tokens (e.g. spacing, fonts), add them to `theme.css` and reference in components. Do not hardcode hex colors in components; use theme variables for maintainability.
