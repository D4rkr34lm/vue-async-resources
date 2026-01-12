import type { Result } from "neverthrow";
import type { ResourceDefinition } from "./defineRecource";
import { type FlatResourceParameters } from "./defineRecource";
import { useResourceAction } from "./useResourceAction";

export type ResourceActionType = "create" | "mutate" | "delete";

type ResourceActionReturn<Type extends ResourceActionType, Params, Data> = {
  params: Params;
} & (Type extends "delete"
  ? { data?: null }
  : {
      data: Data;
    });

export type ResourceActionDefinition<
  Type extends ResourceActionType,
  Name extends string,
  Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  IsSingleton extends boolean,
  Data,
  Error,
  Args extends unknown[],
> = {
  type: Type;
  resourceDefinition: ResourceDefinition<
    Name,
    Dependencies,
    IsSingleton,
    Data,
    unknown
  >;
  asyncAction: (
    ...args: Args
  ) => Promise<
    Result<
      ResourceActionReturn<
        Type,
        FlatResourceParameters<
          [ResourceDefinition<Name, Dependencies, IsSingleton, Data, Error>]
        >,
        Data
      >,
      Error
    >
  >;
  optimisticAction?: (
    ...args: Args
  ) => ResourceActionReturn<
    Type,
    FlatResourceParameters<
      [ResourceDefinition<Name, Dependencies, IsSingleton, Data, Error>]
    >,
    Data
  >;
};

export function defineResourceAction<
  const Type extends ResourceActionType,
  const Name extends string,
  const Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  const IsSingleton extends boolean,
  Data,
  Error,
  Args extends unknown[],
>({
  type,
  resourceDefinition,
  asyncAction,
  optimisticAction,
}: {
  type: Type;
  resourceDefinition: ResourceDefinition<
    Name,
    Dependencies,
    IsSingleton,
    Data,
    unknown
  >;
  asyncAction: (
    ...args: Args
  ) => Promise<
    Result<
      ResourceActionReturn<
        Type,
        FlatResourceParameters<
          [ResourceDefinition<Name, Dependencies, IsSingleton, Data, Error>]
        >,
        Data
      >,
      Error
    >
  >;
  optimisticAction?: (
    ...args: Args
  ) => ResourceActionReturn<
    Type,
    FlatResourceParameters<
      [ResourceDefinition<Name, Dependencies, IsSingleton, Data, Error>]
    >,
    Data
  >;
}) {
  const actionDefinition: ResourceActionDefinition<
    Type,
    Name,
    Dependencies,
    IsSingleton,
    Data,
    Error,
    Args
  > = {
    type,
    resourceDefinition,
    asyncAction,
    optimisticAction,
  };

  const actionComposable = (
    options: {
      onResolve?: (data: Data) => void;
      onFail?: (error: Error) => void;
    } = {},
  ) => useResourceAction(actionDefinition, options);

  return {
    resourceActionDefinition: actionDefinition,
    useResourceAction: actionComposable,
  };
}
