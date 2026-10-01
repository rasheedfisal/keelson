---
name: nextjs
description: Implements Next.js App Router UI with Server Components and shadcn/ui as primitives, keeping a product-specific visual identity. Use when building or changing pages, layouts, forms, dashboards, or frontend data fetching. API modules, workers, and database schema belong to the backend skill.
---

# Next.js

Inspect the installed Next.js version and follow that API. `find-me` locates the page, layout, and fetch the project already uses.

## Conventions

- Use the App Router. A route is `page.tsx` inside `layout.tsx`. A route that can wait, fail, or miss has `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Server Components are the default. A Client Component exists for interactivity, state, effects, or browser APIs. Props that cross that boundary are serializable.
- Fetch in the Server Component that renders the data. A slow region fetches inside its own `Suspense` boundary so the rest of the page can stream.
- Match the cache of the closest existing feature. A mutation revalidates the tag or path that feature already uses.
- A mutation in this app is a Server Action. It calls the backend through its HTTP API or the contract package it publishes. It does not import backend projects or the database client.
- A route handler in this app serves a web concern such as a cookie or a browser callback. Product resources belong to the backend skill.
- Keep domain logic out of UI components. Use shadcn/ui as primitives. Follow the `product-ui` skill so the screen is not a default shadcn dashboard or a generated layout.

Parallel routes and intercepting routes wait until a screen needs independent slots, or a modal that is also a URL.

## Workflow

1. Read `apps/web/AGENTS.md`, `docs/design.md`, and the `product-ui` skill.
2. Match data-fetching and caching to the closest existing feature.
3. Include loading, empty, and error states. A missing record uses `notFound()`.
4. A public page that has its own title sets it with `generateMetadata`.
5. Check the layout at a narrow width and a wide width.

## Stop and ask

Stop before inventing a palette, a new app shell, a new data-fetching or cache pattern, a parallel or intercepting route, or a route handler that owns product data.

## Done

The page renders as a Server Component. The client boundary is the interactive part. A mutation calls the backend and refreshes the cache that page reads.
