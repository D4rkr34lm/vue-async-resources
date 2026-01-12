import { ref, type App } from "vue";
import { asyncResourceCacheInjectionKey } from "./asyncResourceCache";

export const AsyncResources = (app: App<any>) => {
  app.provide(asyncResourceCacheInjectionKey, ref({}));
};
