import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma 7 generates the client outside node_modules. It is machine-written,
    // ships with @ts-nocheck, and is gitignored — linting it is noise at best.
    "generated/**",
    // Tool caches. ESLint flat config does not read .gitignore, so these must be
    // listed explicitly. `.gstack` in particular is not readable by this user and
    // made `eslint` abort with EPERM before reaching a single source file, which
    // silently turned the lint half of `npm run verify` into a no-op.
    ".gstack/**",
    ".impeccable/**",
    ".firecrawl/**",
    ".context/**",
  ]),
]);

export default eslintConfig;
