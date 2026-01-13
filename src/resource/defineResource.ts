import { getResourceCacheKeyFactory } from "../cache/keyFactory.js";
import { useResource } from "./useResource.js";
import { Result, ResultFunctions } from "../utils/result.js";
import { FlatResourceParameters, ResourceDefinition } from "./types.js";

export function defineResource<
  const Name extends string,
  const Dependencies extends ResourceDefinition[],
  const IsSingleton extends boolean,
  Data,
  Error,
>({
  name,
  dependsOn,
  isSingleton,
  query,
}: {
  name: Name;
  dependsOn: Dependencies;
  isSingleton: IsSingleton;
  query: (
    returnFunction: ResultFunctions,
    params: FlatResourceParameters<
      [ResourceDefinition<Dependencies, Name, IsSingleton, unknown, unknown>]
    >,
  ) => Promise<Result<Data, Error>>;
}) {
  const resourceDefinition: ResourceDefinition<
    Dependencies,
    Name,
    IsSingleton,
    Data,
    Error
  > = {
    name,
    dependsOn: dependsOn,
    isSingleton,
    keyFactory: getResourceCacheKeyFactory({
      name,
      dependsOn: dependsOn,
      isSingleton,
    }),
    query,
  };

  const composable = (
    params: () => FlatResourceParameters<[typeof resourceDefinition]>,
  ) => useResource(resourceDefinition, params);

  return {
    resourceDefinition,
    useResource: composable,
  };
}
