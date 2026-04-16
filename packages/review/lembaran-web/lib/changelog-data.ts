export const RELEASES = [
  {
    version: "1.0.1",
    date: "April 14, 2026",
    tag: "latest" as const,
    summary:
      "GUI vault manager, improved docs layout, AI Assistant preview, and export features.",
    media: "screenshot",
    stats: { added: 15, changed: 3, fixed: 8 },
    changes: [
      {
        type: "added",
        items: [
          "GUI vault manager in packages/web (localhost:1401)",
          "Dual-sidebar docs layout (Gitbook + Apple HIG style)",
          "AI Assistant page with planned features",
          "Language switcher (EN, ID, ZH)",
          "Copy as Markdown, Open in Claude/Qwen/DeepSeek buttons",
          "Export as .md or .pdf functionality",
          "Prev/Next navigation buttons in docs",
        ],
      },
      {
        type: "changed",
        items: [
          "Fixed font consistency across docs pages (text-2xl/16/14)",
          "Narrowed left sidebar to 260px (Gitbook-style)",
          "Improved scrollbar to match background theme",
          "Header now detects active docs routes",
        ],
      },
      {
        type: "fixed",
        items: [
          "useInput logic in TUI App.tsx (message screen exit)",
          "WelcomeScreen C-style cast error",
          "ESLint circular JSON error",
          "All TypeScript errors (0 remaining)",
          "Install script URL (raw GitHub)",
          "MobileMenu missing lang props",
        ],
      },
    ],
  },
  {
    version: "1.0.0",
    date: "March 30, 2026",
    tag: "legacy" as const,
    summary: "Foundation release under @lembaranz scoped package.",
    stats: { added: 8, changed: 0, fixed: 0 },
    changes: [
      {
        type: "added",
        items: [
          "Monorepo structure with core, cli, and web packages",
          "Zero-knowledge encryption engine (AES-GCM + Argon2id)",
          "Terminal UI with menu system",
          "Landing page with documentation",
        ],
      },
    ],
  },
];
