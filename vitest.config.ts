import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "./src",
  test: {
    env: loadEnv("", ".", ""),
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["*"],
      reportsDirectory: "../coverage",
      enabled: true,
      cleanOnRerun: true,
    },
  },
  define: {},
});
