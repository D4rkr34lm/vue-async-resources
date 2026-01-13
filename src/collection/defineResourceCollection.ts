import {
  FlatResourceParameters,
  ResourceDefinition,
} from "../resource/types.js";
import { Result } from "../utils/result.js";
import { ResourceCollectionDefinition } from "./types.js";
import { useResourceCollection } from "./useResourceCollection.js";

export function defineResourceCollection<
  const Name extends string,
  const Dependencies extends ResourceDefinition[],
  Data,
  Error,
>({
  resourceDefinition,
  normalize,
  query,
}: {
  resourceDefinition: ResourceDefinition<
    Dependencies,
    Name,
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
