## 2024-04-16 - [UX/A11y Insight: Focus Indicator]
**Learning:** Ink TUI applications inherently lack default accessible browser focus indicators for inputs. Users relying on keyboards or screen readers might lose track of active fields.
**Action:** When using `<TextInput>` in Ink apps, wrap them in a `<Box>` and dynamically update `borderColor` or use an active brand color (like `UI_TOKENS.brand`) when focused. This acts as a clear visual cue for the active input, enhancing TUI accessibility.
