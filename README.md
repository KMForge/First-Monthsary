# Our First Bloom

A responsive first-monthsary keepsake with custom animated SVG lilies, a photo scrapbook, an interactive memory garden, personal notes, a love letter, and optional sound.

## Preview
Open index.html in a modern browser. No install or build is required. Internet access loads the sample photos and optional Google Fonts; system font fallbacks and photo placeholders remain available offline.

## Make it yours
Edit content.js:
- names: your names.
- startDate: your real relationship start date in YYYY-MM-DD format. The days counter uses Asia/Manila calendar dates, excluding the starting day. Leave blank to display "01 beautiful month".
- memories: replace image paths, accessible alt descriptions, titles, dates, and stories.
- reasons: your personal messages.
- letter: your greeting, paragraphs, and signature.
- musicUrl: an optional audio path. Leave blank for the original synthesized melody.
- sampleMode: set false after replacing sample content.

Put personal photos in assets/images and audio in assets/audio. Relative paths work locally and when hosted. Sample photographs load from Unsplash and are illustrative, not your personal memories. Sample prose is identified in the experience.

## Files
- index.html: page and accessible dialogs.
- styles.css: desktop/mobile layouts, lily effects, reduced-motion rules.
- content.js: all personal content.
- app.js: SVG flowers, memory navigation, letter, notes, date counter, sound and particles.
- docs/implementation-plan.md: design and implementation summary.
- dist/: deployment copy. Refresh this copy after changes.

## Accessibility and performance
Keyboard navigation, native modal focus containment, Escape to close, arrow-key and swipe photo navigation, image descriptions, reduced-motion preference, visible focus, lazy-loaded photos, capped canvas resolution, and background suspension are included. Music starts only from a tap. The effects button cannot override a device preference for reduced motion.

## Sharing
The site is static and has no database or upload interface. Use access-controlled hosting for private memories. Personal content shipped in a static site is accessible to people with access to its files; a decorative password screen is not security.
