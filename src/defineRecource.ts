/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Result } from "neverthrow";
import { getResourceCacheKeyFactory } from "./asyncResourceCache";
import { useResource } from "./useResource";

export interface ResourceDefinition<
  Name extends string,
  Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  IsSingleton extends boolean,
  Data,
  Error,
> {
  name: Name;
  dependsOn: Dependencies;
  isSingleton: IsSingleton;
  keyFactory: (params: FlatResourceParameters<[this]>) => string;
  query: (
    params: FlatResourceParameters<[this]>,
  ) => Promise<Result<Data, Error>>;
}

export type FlatResourceParameters<
  Resource extends ResourceDefinition<any, any, any, any, any>[],
> = Resource extends []
  ? {}
  : Resource extends [
        ResourceDefinition<
          infer Name,
          infer Dependencies,
          infer IsSingleton,
          any,
          any
        >,
        ...infer Rest extends ResourceDefinition<any, any, any, any, any>[],
      ]
    ? (IsSingleton extends true ? {} : { [K in Name]: string }) &
        (Dependencies extends never[]
          ? {}
          : FlatResourceParameters<Dependencies>) &
        FlatResourceParameters<Rest>
    : never;

export function defineResource<
  const Name extends string,
  const Dependencies extends ResourceDefinition<any, any, any, any, any>[],
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
    params: FlatResourceParameters<
      [ResourceDefinition<Name, Dependencies, IsSingleton, unknown, unknown>]
    >,
  ) => Promise<Result<Data, Error>>;
}) {
  const resourceDefinition: ResourceDefinition<
    Name,
    Dependencies,
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
