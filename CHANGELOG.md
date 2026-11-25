# Changelog

All notable changes to Flip Watch are recorded here.

## [Unreleased]

### Added
- **31 upgrades across the twelve technical tools**: live match counts, replace-one and undo for Find & Replace with regex presets; numbered/wrapped repeats; password reveal, three attack-speed estimates, character-class chips and a "suggest a strong one" button; drag & drop for every image tool; resize presets (Instagram, Story, Twitter, HD); crop aspect ratios with numeric selection boxes; average-colour and copy-as-CSS; QR colour pickers, Wi-Fi/email/phone presets, SVG export and recent history; sample vs population deviation with a histogram; previous/next prime and range listing; Monday week start, month navigation and a full year view for the calendar.
- **Twelve technical tools** (30 in total): Find & Replace Text, Repeat & Pad Text, Password Strength Checker, Compress Image, Resize Image, Convert Image Format, Crop Image, Pick Colour from Image, Generate QR Code, Statistics Calculator, Prime Checker & Factoriser and Generate Calendar. Image tools use canvas only, so files never leave the device; QR codes use the vendored MIT-licensed `qrcode-generator`.
- **38 upgrades across the seven new tools**: GST presets/custom rates/copy, EMI presets, interest meter and yearly amortisation, fuel round-trip and L/100 km, JSON indent/sort/download/sample with size deltas, auto-converting Base64 with SHA-256/384/512, colour click-to-copy/random/complement/preview, and a random picker with unique counts, multi-dice, shuffle, no-repeat and history.
- **Seven more tools**: GST Calculator, EMI Calculator, Fuel Cost, JSON Formatter, Base64/URL/Hash, Colour Toolkit and Random Picker (18 tools in total).
- **Five more tools**: Unit Converter, Password Generator, Word Counter, To-Do List and Date Calculator — all offline, with 40 refinements across them (swap/copy, all-unit table, passphrases with a 1,745-word list, entropy meter, character targets, keywords, inline task editing, due dates, business days, and more).
- **App polish**: skip link, offline banner, install-app button, About/shortcuts dialog (`?`), and a system-aware theme option.
- `robots.txt` and `sitemap.xml`.
- Print styles for the tool panels.
- **PDF reader**: realistic book mode powered by a purpose-built CSS-3D flip engine (`book-flip.js`), with cached page canvases so no page is ever blank mid-turn.
- **PDF reader**: night mode, single-page and horizontal layouts, rotation, and a loading overlay while a document opens.
- **Stopwatch**: laps/splits with best and worst lap highlighting.
- **Persistence**: calculator history and memory, timer presets, and a paused stopwatch/timer session survive a reload.
- **Keyboard shortcuts**: `Space` start/pause, `R` reset, `L` lap, arrow keys inside segmented controls.
- **PWA**: web app manifest, service worker with offline support, and an in-app "new version" prompt.
- **Themes**: light/dark toggle with a slow, continuous colour cycle across every screen.
- **SEO/social**: descriptive title, meta description, canonical URL, Open Graph and Twitter cards with a generated share image, and `WebApplication` structured data.
- **404 page**, small favicons (32/48/96) and an install-ready icon set.
- **Docs**: rewritten README with screenshots, CONTRIBUTING guide and this changelog.

### Fixed
- **PDF reader**: blank pages on WebKit/Safari — pdf.js v6 uses newer JavaScript APIs (`Map.getOrInsertComputed`, `Promise.withResolvers`, `Set.prototype.intersection`); polyfills are now loaded on the page and embedded in the worker.
- **PDF reader**: book mode overflowed the viewer after a resize or on narrow screens; the spread is now scaled to fit.
- **PDF reader**: leaving book mode left pages stacked on top of each other; stale inline styles are cleared on teardown.
- **PDF reader**: far page jumps took several seconds and page turns waited on rendering; navigation now renders only the target spread and prefetches neighbours.
- **PDF reader**: mixed page-size documents were squashed into page 1's shape; the book size now follows the dominant page shape.
- **Calculator**: `-2^2` now evaluates to `-4` (correct operator precedence) and `tan(90)` reports "undefined" instead of a huge number.
- **Accessibility**: opening a tool moves focus into the panel and returns it on close; incomplete `role="tablist"` markup replaced with valid toggle groups.
- **Security**: PDF outline titles and file names are rendered as text instead of HTML.
- **Performance**: the clock ticks once per second instead of on every animation frame; the colour cycle pauses while the tab is hidden.

### Changed
- **UI**: redesigned with a premium gradient look, glass panels, layered shadows and motion.

## [1.0.0] — Initial release

- Flip-clock stopwatch, timer and clock.
- Scientific calculator and equation calculator.
- Book-style PDF reader.
