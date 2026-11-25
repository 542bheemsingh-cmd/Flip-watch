# Contributing to Flip Watch

Thanks for taking the time to help! This project is deliberately simple: plain HTML, CSS and JavaScript with **no build step and no framework**. Please keep it that way.

## Getting started

```bash
git clone https://github.com/542bheemsingh-cmd/Flip-watch.git
cd Flip-watch
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local HTTP server rather than opening the files directly — the PDF reader uses ES modules and the app registers a service worker, both of which need `http(s)://`.

## Where things live

| Area | Files |
| --- | --- |
| Dashboard, stopwatch, timer, clock, calculator, equations | `index.html`, `styles.css`, `script.js` |
| PDF reader | `pdf-reader/index.html`, `pdf-reader/css/`, `pdf-reader/js/` |
| Realistic page flip | `pdf-reader/js/book-flip.js` |
| Offline support | `service-worker.js`, `manifest.json` |

## Guidelines

- **Match the existing style** — vanilla JS, no new runtime dependencies, no bundler.
- **Keep it accessible** — every interactive control needs a label, visible focus, and correct ARIA state.
- **Respect reduced motion** — new animations must be disabled under `prefers-reduced-motion: reduce`.
- **Test on a phone width** (≈ 390 px) as well as desktop.
- **Bump the cache-busting version** when you change `styles.css`, `script.js` or `pdf-reader/css/*.css` (the `?v=` query in the HTML), and bump `CACHE` in `service-worker.js` when you change the PDF worker.
- **Do not commit secrets** — this project needs none.

## Commit messages

Use a short conventional prefix, for example:

```text
feat(stopwatch): add lap splits
fix(pdf-reader): keep the spread inside the viewer
docs(readme): add screenshots
```

## Before you open a pull request

- [ ] The page loads with **no console errors**.
- [ ] Stopwatch, timer, clock, calculator and equations still work.
- [ ] A PDF opens and pages turn in realistic, continuous and single-page modes.
- [ ] Light and dark themes both look right.
- [ ] Keyboard navigation works (`Tab`, `Space`, `R`, `L`, arrow keys).
- [ ] The app still works offline after a reload (service worker).

## Reporting bugs

Please include your browser and OS, the steps to reproduce, what you expected, and (for PDF issues) whether the file is large, scanned, or has unusual page sizes. Screenshots help a lot.
