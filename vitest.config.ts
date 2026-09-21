import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors tsconfig "paths": { "@/*": ["./src/*"] }.
      "@": path.resolve(root, "src"),
      // Next's "server-only" guard throws outside the React server runtime;
      // the modules under test import it for its side effect only.
      "server-only": path.resolve(root, "tests/helpers/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/helpers/setup.ts"],
  },
});
