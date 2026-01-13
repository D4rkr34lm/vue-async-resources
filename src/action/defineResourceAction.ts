import {
  FlatResourceParameters,
  ResourceDefinition,
} from "../resource/types.js";
import { useResourceAction } from "./useResourceAction.js";
import { Result, ResultFunctions } from "../utils/result.js";
import {
  ResourceActionDefinition,
  ResourceActionReturn,
  ResourceActionType,
} from "./types.js";

export function defineResourceAction<
  const Type extends ResourceActionType,
  const Name extends string,
  const Dependencies extends ResourceDefinition[],
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
  resourceDefinition: ResourceDefinition<Dependencies, Name, IsSingleton, Data>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => useResourceAction(actionDefinition as any, options);

  return {
    resourceActionDefinition: actionDefinition,
    useResourceAction: actionComposable,
  };
}
