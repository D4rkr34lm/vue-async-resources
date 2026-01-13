import { Result, ResultFunctions } from "../utils/result.js";

export type FlatResourceParameters<Resource extends ResourceDefinition[]> =
  Resource extends []
    ? {}
    : Resource extends [
          ResourceDefinition<infer Dependencies, infer Name, infer IsSingleton>,
          ...infer Rest extends ResourceDefinition[],
        ]
      ? (IsSingleton extends true ? {} : { [K in Name]: string }) &
          (Dependencies extends never[]
            ? {}
            : FlatResourceParameters<Dependencies>) &
          FlatResourceParameters<Rest>
      : never;

export interface ResourceDefinition<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dependencies extends ResourceDefinition[] = ResourceDefinition<any>[],
  Name extends string = string,
  IsSingleton extends boolean = boolean,
  Data = unknown,
  Error = unknown,
> {
  name: Name;
  dependsOn: Dependencies;
  isSingleton: IsSingleton;
  keyFactory: (params: { [key: string]: string }) => string;
  query: (
    returnFunctions: ResultFunctions,
    params: FlatResourceParameters<[this]>,
  ) => Promise<Result<Data, Error>>;
}
