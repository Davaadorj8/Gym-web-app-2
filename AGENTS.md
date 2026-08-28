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
