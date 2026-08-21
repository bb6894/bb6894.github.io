# Repository Guidelines

## Project Structure & Module Organization

This is a dependency-free static site deployed through GitHub Pages. `index.html` is the only canonical page. Browser behavior lives in `assets/app.js`; reusable date and sharing logic lives in `assets/time-core.js` and `assets/share-core.js`. Styling is in `assets/styles.css`, and `assets/site-qr.svg` encodes the production URL. Root-level `.jpg` files and `music.mp3` are runtime media. `tests/` contains Node test-runner regression tests. Alternate HTML files and `给18岁的自己-*.md` are local drafts, not production sources.

## Build, Test, and Development Commands

No build or runtime dependency installation is required. Node is used only for tests.

- `npm test` — run all structure, date-boundary, sharing, and repository-safety tests.
- `python -m http.server 8000` — serve the repository locally.
- Open `http://localhost:8000/` — exercise ES modules and media through HTTP.
- `node --check assets/app.js` — verify application script syntax.
- `git diff --check` — detect whitespace errors before committing.

## Coding Style & Naming Conventions

Use four-space indentation in HTML, CSS, and JavaScript. Use kebab-case for CSS classes (`photo-grid`), camelCase for JavaScript functions and DOM identifiers (`openLightbox`, `musicButton`), and uppercase names for immutable exported configuration. Keep modules small and side-effect-free where possible; DOM wiring belongs in `app.js`. Do not add inline handlers or duplicate page variants. Keep Chinese content UTF-8 and use existing CSS custom properties under `:root`.

## Testing Guidelines

Write a failing regression test before changing behavior. Test files use `*.test.mjs`. Run `npm test`, then verify the site in a real browser at desktop and 390 px mobile widths. Exercise both birthday boundaries, music, lightbox navigation, poster generation, link copying, and QR scanning. The console must be clean and all local media requests must succeed.

## Commit & Pull Request Guidelines

Recent history uses short Chinese, action-led subjects such as `修复重复script标签导致功能失效的问题`. Keep each commit focused, and include `Constraint`, `Confidence`, `Scope-risk`, and `Tested` trailers when they preserve useful decision context. Pull requests should summarize the user-visible result, list manual checks, link any issue, and include before/after screenshots for visual changes. Call out changes to dates or media explicitly.

## Security & Configuration Tips

The birthday gate uses the visitor's browser clock; it is presentation logic, not access control. Content embedded in `index.html` can be inspected before its display date, so do not place secrets there. Strip private metadata from new photos and never put credentials or private tokens in files or share URLs.
