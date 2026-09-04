import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import boundariesPlugin from "eslint-plugin-boundaries";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  ...next,
  {
    plugins: {
      boundaries: boundariesPlugin,
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      // Without this, a file matching more than one element pattern (e.g. a component
      // directly under components/ui/ matching both "ui-primitive" and the broader
      // "shared-ui") is classified with ALL matching types simultaneously, and the
      // Dependencies rule then requires every one of those types to have an allow
      // policy — so the more permissive, more specific type doesn't actually help.
      // This makes classification first-match-wins by declaration order instead,
      // which is why more specific patterns (ui-primitive, orchestration, server)
      // are declared above their broader supersets (shared-ui, lib) below.
      "boundaries/elements-single-match": true,
      // NOTE: patterns use a trailing "**" (not "**/*") — eslint-plugin-boundaries'
      // matcher requires "**" to match a file that sits directly inside the pattern's
      // root (e.g. src/server/db.ts), which "**/*" fails to match (it needs 2+ segments
      // after the literal prefix). Verified empirically against this plugin version;
      // keep this suffix convention for any new element pattern added here.
      "boundaries/elements": [
        // Route Handlers run server-side only (never rendered), so — like Server Actions
        // in "feature" — they're allowed to reach "server" directly. Declared before the
        // broader "app" pattern so it wins under elements-single-match.
        { type: "api-route", pattern: "src/app/api/**" },
        { type: "app", pattern: "src/app/**" },
        { type: "feature", pattern: "src/features/**" },
        { type: "ui-primitive", pattern: "src/components/ui/**" },
        { type: "shared-ui", pattern: "src/components/**" },
        { type: "server", pattern: "src/server/**" },
        // NOTE: orchestration (DashboardContext) is a tracked, pre-existing exception —
        // it reaches server/repositories and server/services directly instead of going
        // through feature actions. Remove this type (folding it back into plain "lib",
        // which cannot reach "server") once the Phase B domain extractions have moved
        // each slice of DashboardContext's state into its own feature.
        { type: "orchestration", pattern: "src/lib/orchestration/**" },
        { type: "lib", pattern: "src/lib/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "shared-ui" } } },
                { to: { element: { type: "ui-primitive" } } },
                { to: { element: { type: "orchestration" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "api-route" } },
              allow: [
                { to: { element: { type: "api-route" } } },
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "server" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "feature" } },
              allow: [
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "shared-ui" } } },
                { to: { element: { type: "ui-primitive" } } },
                { to: { element: { type: "server" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "shared-ui" } },
              allow: [
                { to: { element: { type: "shared-ui" } } },
                { to: { element: { type: "ui-primitive" } } },
                { to: { element: { type: "orchestration" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "ui-primitive" } },
              allow: [
                { to: { element: { type: "ui-primitive" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "server" } },
              allow: [
                { to: { element: { type: "server" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              // Tracked exception — see the "orchestration" element note above.
              from: { element: { type: "orchestration" } },
              allow: [
                { to: { element: { type: "orchestration" } } },
                { to: { element: { type: "server" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "lib" } },
              allow: [
                { to: { element: { type: "lib" } } },
              ],
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*/components/*",
                "@/features/*/actions/*",
                "@/features/*/queries/*",
                "@/features/*/schemas/*",
                "@/features/*/types/*",
              ],
              message:
                "Deep imports into a feature's internals are forbidden. Import from the feature's public barrel (@/features/<module>) instead.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/app/**", "src/features/*/components/**", "src/components/**"],
    ignores: ["src/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@prisma/client",
              message: "Direct database access from UI is forbidden.",
            },
            {
              name: "@/server/prisma",
              message: "Direct database access from UI is forbidden.",
            },
            {
              name: "@/server/db",
              message: "Direct database access from UI is forbidden.",
            },
          ],
          patterns: [
            {
              group: [
                "@/features/*/components/*",
                "@/features/*/actions/*",
                "@/features/*/queries/*",
                "@/features/*/schemas/*",
                "@/features/*/types/*",
                "@/server/*",
              ],
              message:
                "Deep imports into a feature's internals are forbidden. Import from the feature's public barrel (@/features/<module>) instead. Server infrastructure must be reached through a feature's actions, not imported directly from app/components.",
            },
          ],
        },
      ],
    },
  },
  {
    // Tracked pre-existing violation, not a sanctioned pattern: these two components hash
    // staff passwords client-side because the staff domain has no server action yet (all
    // staff CRUD currently lives in DashboardContext local state with no repository). Remove
    // this override when the Phase B "staff" feature extraction replaces the direct call with
    // a real server action that hashes server-side. Do not add further files to this list.
    files: [
      "src/components/dashboard/staff-approvals/PasswordResetModal.tsx",
      "src/components/dashboard/staff-approvals/StaffRegistrationForm.tsx",
    ],
    rules: {
      "boundaries/dependencies": "off",
      "no-restricted-imports": "off",
    },
  },
]);

