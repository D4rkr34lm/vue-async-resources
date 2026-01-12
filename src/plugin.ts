import { ref, type App } from "vue";
import { asyncResourceCacheInjectionKey } from "./cache/injection.js";

export const AsyncResources = (app: App<unknown>) => {
  app.provide(asyncResourceCacheInjectionKey, ref({}));
};
