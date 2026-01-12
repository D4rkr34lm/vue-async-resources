import { inject, InjectionKey, Ref } from "vue";
import { AsyncResourceCacheEntry } from "./types.js";

export const asyncResourceCacheInjectionKey = Symbol(
  "async-resource-cache",
) as InjectionKey<Ref<Record<string, AsyncResourceCacheEntry>>>;

export function injectAsyncResourceCache() {
  const cache = inject(asyncResourceCacheInjectionKey);
  if (!cache) {
    throw new Error("Async resource cache not found");
  }
  return cache;
}
