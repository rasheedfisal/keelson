---
name: product-ui
description: Designs and reviews product UI so it has its own visual identity and does not look generated. Use when building or changing pages, dashboards, forms, cards, navigation, typography, color, spacing, empty states, or any screen that could fall back to a generic shadcn layout.
---

# Product UI

shadcn/ui supplies primitives. This skill decides how the product looks. Read it before choosing components.

The failure list below is Keelson's, drawn from the practical checks in Impeccable's craft floor and UI/UX Pro Max's priority rules. Do not copy those projects' commands, palettes, or search scripts into the app.

## Before building a screen

1. Read `docs/design.md` when it exists. It overrides this skill.
2. When it does not exist, draft it and stop. Record the audience, whether the screen is for operating, persuading, or reading, the type, the color tokens, spacing, radius, elevation, and what this product refuses to look like. Wait for approval.
3. Name the primary user goal, the primary action, and the information hierarchy. Then choose components.

An app screen (dashboard, course page, settings, table) is for operating: scanning and finishing a task come before decoration. Brand shows up in type, color, and a few precise details.

## Build

- One type scale with obvious steps in size or weight. Body text at least 16px, line-height about 1.5. Reading text stays near 65–75 characters wide.
- Color comes from semantic tokens. Body text contrasts at least 4.5:1. Secondary text is tinted from the surface color, not gray placed on gray.
- Space is tight inside a group and generous between groups. A heading has more space above it than below it.
- Icons come from one library, one stroke and weight. Do not use emoji as icons.
- Buttons name the action. One primary action per view. Forms have visible labels, and the error sits on the field.
- Motion explains a change. Honor reduced motion. Do not use bounce as the default.
- Targets are at least 44px. Focus rings stay visible. Do not rely on hover alone.
- Include loading, empty, and error states. Check a narrow width and a wide width.
- Theme the details the browser would otherwise default: focus, selection, tabular numbers.

## Looks generated

Reaching for any of these without `docs/design.md` choosing it is a failed design. Rewrite the element.

- A thick colored border on one side of a card, list row, or callout.
- Gradient text, purple-to-cyan washes, cyan on a dark field, or a glowing radial halo behind a panel.
- Glass blur used as decoration.
- Every region wrapped in a card, cards nested inside cards, or a grid of identical icon-plus-heading-plus-text cards.
- The metric hero: one giant number, a tiny label, and a row of supporting stats with an accent.
- A small eyebrow label above every heading.
- Every button styled as primary.
- A sparkline, ring, or chart that does not answer a question the user has.
- Monospace type used to look technical, rather than for code or figures.
- Dark mode chosen because dashboards are usually dark, rather than because this product decided it.

## Stop and ask

Do not invent a palette, a typeface, or a new app shell. Stop and ask, then write the answer into `docs/design.md`.
