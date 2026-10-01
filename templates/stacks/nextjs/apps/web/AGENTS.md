# Frontend

- Next.js App Router. A route that can wait, fail, or miss has `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Server Components by default. Client Components only when the browser must participate. Props that cross that boundary are serializable.
- Fetch in the Server Component that renders the data. A slow region sits in its own `Suspense` boundary. Match the cache of the closest feature.
- A mutation in this app is a Server Action that calls the HTTP API or the published contract. A route handler here is for a web concern such as a cookie or a browser callback.
- shadcn/ui provides primitives. Visual rules live in the `product-ui` skill. The product's type, color, and spacing live in `docs/design.md`.
- Do not create a generic shared component until a second feature needs the same behavior.
- Call the backend through its HTTP API or the contract package it publishes. Do not import backend projects or the database client.

Detailed frontend notes stay in `docs/architecture/overview.md`.
