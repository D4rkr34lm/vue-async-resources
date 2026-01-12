import { ResourceDefinition } from "../resource/types.js";

export interface AsyncResourceCacheEntry {
  resourceDefinition: ResourceDefinition;
  params: Record<string, string>;
  data: unknown;
}
