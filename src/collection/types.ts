import { Ref } from "vue";
import {
  FlatResourceParameters,
  ResourceDefinition,
} from "../resource/types.js";
import { ResourceState } from "../resource/useResource.js";
import { Result } from "../utils/result.js";

export interface ResourceCollectionComposable<Data, Error> {
  state: Ref<ResourceState<Data[], Error>>;
  refetch: () => Promise<void>;
}

export interface ResourceCollectionDefinition<
  Name extends string,
  Dependencies extends ResourceDefinition[],
  Data,
  Error,
> {
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
}
