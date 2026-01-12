import { computed, ref, type Ref } from "vue";
import { injectAsyncResourceCache } from "../cache/injection.js";
import type { FlatResourceParameters, ResourceDefinition } from "./types.js";
import { err, ok, Result } from "../utils/result.js";
import { hasValue } from "../utils/hasValue.js";
import { hasNoValue } from "../utils/hasNoValue.js";

export type ResourceStatus = "pending" | "error" | "success";

interface PendingState {
  status: "pending";
  isFetching: true;
  isPending: true;
  isError: false;
  isSuccess: false;
}

interface ErrorState<Error> {
  status: "error";
  isFetching: boolean;
  isPending: false;
  isError: true;
  isSuccess: false;
  error: Error;
}

interface SuccessState<Data> {
  status: "success";
  isFetching: boolean;
  isPending: false;
  isError: false;
  isSuccess: true;
  data: Data;
}

export type ResourceState<Data, Error> =
  | PendingState
  | ErrorState<Error>
  | SuccessState<Data>;

export interface ResourceComposable<Data, Error> {
  state: Ref<ResourceState<Data, Error>>;
  refetch: () => Promise<void>;
}

export function useResource<
  Name extends string,
  Dependencies extends ResourceDefinition[],
  IsSingleton extends boolean,
  Data,
  Error,
>(
  resourceDefinition: ResourceDefinition<
    Dependencies,
    Name,
    IsSingleton,
    Data,
    Error
  >,
  params: () => FlatResourceParameters<
    [ResourceDefinition<Dependencies, Name, IsSingleton, Data, Error>]
  >,
): ResourceComposable<Data, Error> {
  const _params = computed(params);

  const resourceKey = computed(() =>
    resourceDefinition.keyFactory(_params.value),
  );

  const resourceCache = injectAsyncResourceCache();
  const resourceCacheEntry = computed(
    () => resourceCache.value[resourceKey.value],
  );

  const data = computed<Data | null>(
    () => resourceCacheEntry.value?.data as Data | null,
  );
  const error = ref<Error | null>(null);
  const status = computed<ResourceStatus>(() =>
    hasValue(error.value)
      ? "error"
      : hasValue(data.value)
        ? "success"
        : "pending",
  );

  const activePromise = ref<Promise<Result<Data, Error>> | null>(null);

  const refetch = async () => {
    if (hasValue(activePromise.value)) {
      await activePromise.value;
    } else {
      const localParams = _params.value;

      activePromise.value = resourceDefinition.query(localParams, ok, err);
      const queryResult = await activePromise.value;

      if (queryResult.type === "err") {
        error.value = queryResult.error;
      } else {
        resourceCache.value[resourceKey.value] = {
          resourceDefinition,
          data: queryResult.value,
          params: localParams,
        };
      }
    }

    activePromise.value = null;
  };

  if (hasNoValue(data.value)) {
    refetch();
  }

  const state = computed(
    () =>
      ({
        status: status.value,
        isFetching: hasValue(activePromise.value),
        isPending: status.value === "pending",
        isError: hasValue(error.value),
        isSuccess: hasValue(data.value),
        data: data.value,
        error: error.value,
      }) as ResourceState<Data, Error>,
  );

  return {
    state,
    refetch,
  };
}
