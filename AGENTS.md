# Project Rules and Conventions

## Package Management
- **Primary Package Manager:** npm
- **Avoid Bun:** Do not generate or use `bun.lock`.
- **Command:** Use `npm run dev` for development.

## Architecture
- Follow the feature-based Next.js & Redux SaaS architecture as defined in the master system instructions.
- Ensure every directory has an `ARCH_SPEC.md`.

## Graph & Visualization Conventions
- **Single Switchable Graph Cards**: When creating graph/chart cards, prefer consolidating multiple data views into a single switchable graph card with view toggles.
- **Data Integrity**: Never introduce mock data; preserve real data calculations, breakdown logic, formatting, and responsive containers.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
