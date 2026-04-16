## 2026-02-13 - [UX/A11y Enhancements]
**Learning:** Adding keyboard support (Esc key) to custom floating menus significantly improves the "native" feel of a web app on desktop. Visual feedback for silent actions (like double-click to copy) reduces user uncertainty.
**Action:** Always consider Escape key for closing overlays and provide micro-animations for clipboard actions.

## 2026-02-18 - [Z-Index issues with Backdrop Blur]
**Learning:** Foreground elements in modals/palettes using `backdrop-blur` siblings can sometimes be intercepted by the backdrop in headless browser environments or specific CSS stacking contexts if not explicitly raised.
**Action:** Use `relative z-10` (or higher) on the modal/content container to ensure it stays above the backdrop and remains interactive.

## 2026-02-18 - [Brand Icon Consistency & Smart Detection]
**Learning:** Custom SVG icons for major services (Google, Microsoft) provide better brand recognition than generic Lucide icons. Implementing a simple fuzzy matching algorithm (Levenshtein) in service detection improves UX by tolerating minor typos during data entry.
**Action:** Use custom SVGs for high-traffic brands and always implement typo-tolerance for lookup/selection features.

## 2026-02-18 - [Brand Icon Fidelity & Specific Casing]
**Learning:** Approximate brand icons can frustrate users who expect precision. High-fidelity SVGs that match official guidelines are worth the effort for brand recognition. Additionally, brand-specific casing (e.g., lowercase 'n8n') must be handled across the entire UI lifecycle (input, suggestion, display) to avoid regressions.
**Action:** Use official brand resource SVG paths whenever possible. Implement a brand-aware formatting utility for service names to maintain consistency.

## 2026-02-18 - High-Fidelity Icon Trust
**Learning:** In a security-focused application like Abelion, brand icon fidelity (especially for high-trust services like Google and Claude) directly impacts perceived data sovereignty and app quality. Users find even slightly inaccurate geometry or colors "off-putting" in a premium UI.
**Action:** Prioritize exact brand SVG paths and multi-color segments over simplified monochromatic icons for core ecosystem services.
