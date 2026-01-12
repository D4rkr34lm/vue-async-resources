import type { Result } from "neverthrow";
import type {
  FlatResourceParameters,
  ResourceDefinition,
} from "./defineRecource";
import { useResourceCollection } from "./useResourceCollection";

export interface ResourceCollectionDefinition<
  Name extends string,
  Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  Data,
  Error,
> {
  resourceDefinition: ResourceDefinition<
    Name,
    Dependencies,
    false,
    Data,
    unknown
  >;
  normalize: (data: Data) => number | string;
  query: (args: {
    select: FlatResourceParameters<Dependencies>;
  }) => Promise<Result<Array<Data>, Error>>;
}

export function defineResourceCollection<
  const Name extends string,
  const Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  Data,
  Error,
>({
  resourceDefinition,
  normalize,
  query,
}: {
  resourceDefinition: ResourceDefinition<
    Name,
    Dependencies,
    false,
    Data,
    unknown
  >;
  normalize: (data: Data) => number | string;
  query: (args: {
    select: FlatResourceParameters<Dependencies>;
  }) => Promise<Result<Array<Data>, Error>>;
}) {
  const collectionDefinition: ResourceCollectionDefinition<
    Name,
    Dependencies,
    Data,
    Error
  > = {
    resourceDefinition,
    normalize,
    query,
  };

  const resourceCollectionComposable = (options: {
    select: () => FlatResourceParameters<Dependencies>;
  }) => useResourceCollection(collectionDefinition, options);

  return {
    resourceCollectionDefinition: collectionDefinition,
    useResourceCollection: resourceCollectionComposable,
  };
}
