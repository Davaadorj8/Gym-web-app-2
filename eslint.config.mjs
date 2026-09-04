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
      "boundaries/elements": [
        { type: "app", pattern: "app/**/*" },
        { type: "feature", pattern: "features/**/*" },
        { type: "ui-primitive", pattern: "components/ui/**/*" },
        { type: "shared-ui", pattern: "components/**/*" },
        { type: "server", pattern: "lib/server/**/*" },
        { type: "lib", pattern: "lib/**/*" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { type: "app" },
              allow: [
                { to: { type: "app" } },
                { to: { type: "feature" } },
                { to: { type: "shared-ui" } },
                { to: { type: "ui-primitive" } },
                { to: { type: "lib" } },
              ],
            },
            {
              from: { type: "feature" },
              allow: [
                { to: { type: "feature" } },
                { to: { type: "shared-ui" } },
                { to: { type: "ui-primitive" } },
                { to: { type: "server" } },
                { to: { type: "lib" } },
              ],
            },
            {
              from: { type: "shared-ui" },
              allow: [
                { to: { type: "shared-ui" } },
                { to: { type: "ui-primitive" } },
                { to: { type: "lib" } },
              ],
            },
            {
              from: { type: "ui-primitive" },
              allow: [
                { to: { type: "ui-primitive" } },
                { to: { type: "lib" } },
              ],
            },
            {
              from: { type: "server" },
              allow: [
                { to: { type: "server" } },
                { to: { type: "lib" } },
              ],
            },
            {
              from: { type: "lib" },
              allow: [
                { to: { type: "lib" } },
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
    files: ["app/**", "features/*/components/**", "components/**"],
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
              name: "@/lib/prisma",
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
              ],
              message:
                "Deep imports into a feature's internals are forbidden. Import from the feature's public barrel (@/features/<module>) instead.",
            },
          ],
        },
      ],
    },
  },
]);

