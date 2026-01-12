import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude],
    root: fileURLToPath(new URL("./", import.meta.url)),
    coverage: {
      provider: "v8",
      reporter: ["html-spa", "text"],
      include: ["*"],
      reportsDirectory: "./coverage",
      enabled: true,
      cleanOnRerun: true,
    },
  },
});
