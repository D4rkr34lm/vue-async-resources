import { ResourceComposable } from "../resource/useResource.js";

export type CombinedResourceError<
  Resources extends {
    [queryName: string]: ResourceComposable<unknown, unknown>;
  },
> = {
  [Name in keyof Resources]: Resources[Name] extends ResourceComposable<
    unknown,
    infer Error
  >
    ? Error
    : never;
};

export type CombinedResourceData<
  Resources extends {
    [queryName: string]: ResourceComposable<unknown, unknown>;
  },
> = {
  [Name in keyof Resources]: Resources[Name] extends ResourceComposable<
    infer Data,
    unknown
  >
    ? Data
    : never;
};
