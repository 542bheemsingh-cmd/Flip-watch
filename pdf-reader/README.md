# Flip Watch PDF Reader

A standalone Google Play Books-style PDF reader for the Flip Watch website.

## Run

From the project root:

```bash
python3 -m http.server 5173
```

Open:

```text
http://127.0.0.1:5173/pdf-reader/
```

## Features

- Open local PDFs
- Drag and drop PDFs
- PDF.js rendering with lazy page loading
- Continuous, single-page, and horizontal modes
- Fit width, fit page, free zoom
- Mouse wheel zoom with Ctrl/Cmd
- Double-click and touch double-tap zoom
- Swipe navigation and pinch zoom via Hammer.js
- Page slider, page input, previous/next controls
- Thumbnails, table of contents, bookmarks, recent documents
- Full-text search with result navigation
- Dark, light, sepia themes
- Brightness, direction, UI size, animation speed settings
- Fullscreen, print, download, rotate
- IndexedDB persistence for settings, progress, bookmarks, and recent documents

## Notes

The reader is fully static and does not upload PDFs anywhere. Files stay local in the browser session; metadata such as progress and bookmarks is saved in IndexedDB.
