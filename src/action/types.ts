import {
  FlatResourceParameters,
  ResourceDefinition,
} from "../resource/types.js";
import { Result, ResultFunctions } from "../utils/result.js";

export type ResourceActionType = "create" | "mutate" | "delete";

export type ResourceActionReturn<
  Type extends ResourceActionType,
  Params,
  Data,
> = {
  params: Params;
} & (Type extends "delete"
  ? { data?: null }
  : {
      data: Data;
    });

export type ResourceActionDefinition<
  Type extends ResourceActionType,
  Name extends string,
  Dependencies extends ResourceDefinition[],
  IsSingleton extends boolean,
  Data,
  Error,
  Args extends unknown[],
> = {
  type: Type;
  resourceDefinition: ResourceDefinition<
    Dependencies,
    Name,
    IsSingleton,
    Data,
    unknown
  >;
  asyncAction: (
    resultFunctions: ResultFunctions,
    ...args: Args
  ) => Promise<
    Result<
      ResourceActionReturn<
        Type,
        FlatResourceParameters<
          [ResourceDefinition<Dependencies, Name, IsSingleton, Data, Error>]
        >,
        Data
      >,
      Error
    >
  >;
  optimisticAction?: (
    resultFunctions: ResultFunctions,
    ...args: Args
  ) => ResourceActionReturn<
    Type,
    FlatResourceParameters<
      [ResourceDefinition<Dependencies, Name, IsSingleton, Data, Error>]
    >,
    Data
  >;
};
