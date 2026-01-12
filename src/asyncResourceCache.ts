import { isEmpty } from "lodash";
import type { InjectionKey, Ref } from "vue";
import { inject } from "vue";
import type {
  FlatResourceParameters,
  ResourceDefinition,
} from "./defineRecource";

export interface AsyncResourceCacheEntry {
  resourceDefinition: ResourceDefinition<any, any, any, any, any>;
  params: Record<string, string | number>;
  data: unknown;
}

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

function flattenDependencies(
  resourceDefinitions: Pick<
    ResourceDefinition<any, any, any, any, any>,
    "name" | "dependsOn" | "isSingleton"
  >[],
): Pick<
  ResourceDefinition<any, any, any, any, any>,
  "name" | "dependsOn" | "isSingleton"
>[] {
  return resourceDefinitions
    .map((def) => [
      ...(isEmpty(def.dependsOn) ? [] : flattenDependencies(def.dependsOn)),
      def,
    ])
    .flat();
}

export function getResourceCacheKeyFactory<
  Name extends string,
  Dependencies extends ResourceDefinition<any, any, any, any, any>[],
>(
  resourceDefinition: Pick<
    ResourceDefinition<Name, Dependencies, boolean, any, any>,
    "name" | "dependsOn" | "isSingleton"
  >,
) {
  type Params = FlatResourceParameters<
    [ResourceDefinition<Name, Dependencies, any, any, any>]
  >;
  const flatResources = flattenDependencies([resourceDefinition]);

  return (params: Params) => {
    const partialKeys = flatResources.map((resource) =>
      resource.isSingleton
        ? `${resource.name}`
        : `${resource.name}:{${params[resource.name as keyof Params]}}`,
    );

    return partialKeys.join("-");
  };
}
