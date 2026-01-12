import {
  FlatResourceParameters,
  ResourceDefinition,
} from "../resource/types.js";
import { isEmpty } from "../utils/isEmpty.js";

function flattenDependencies(
  resourceDefinitions: Pick<
    ResourceDefinition,
    "name" | "dependsOn" | "isSingleton"
  >[],
): Pick<ResourceDefinition, "name" | "dependsOn" | "isSingleton">[] {
  return resourceDefinitions
    .map((def) => [
      ...(isEmpty(def.dependsOn) ? [] : flattenDependencies(def.dependsOn)),
      def,
    ])
    .flat();
}

export function getResourceCacheKeyFactory<
  Name extends string,
  Dependencies extends ResourceDefinition[],
>(
  resourceDefinition: Pick<
    ResourceDefinition<Dependencies, Name>,
    "name" | "dependsOn" | "isSingleton"
  >,
) {
  type Params = FlatResourceParameters<
    [ResourceDefinition<Dependencies, Name>]
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
