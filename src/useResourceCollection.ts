import { hasValue } from "@veridale/shared/dist/typeguards";
import { every, toPairs, values } from "lodash";
import { computed, ref, watch, type Ref } from "vue";
import { injectAsyncResourceCache } from "./asyncResourceCache";
import type {
  FlatResourceParameters,
  ResourceDefinition,
} from "./defineRecource";
import type { ResourceCollectionDefinition } from "./defineRecourceCollection";
import type { ResourceState, ResourceStatus } from "./useResource";

export interface ResourceCollectionComposable<Data, Error> {
  state: Ref<ResourceState<Data[], Error>>;
  refetch: () => Promise<void>;
}

export function useResourceCollection<
  Name extends string,
  Dependencies extends ResourceDefinition<any, any, any, any, any>[],
  Data,
  Error,
>(
  {
    resourceDefinition,
    normalize,
    query,
  }: ResourceCollectionDefinition<Name, Dependencies, Data, Error>,
  {
    select,
  }: {
    select: () => FlatResourceParameters<Dependencies>;
  },
): ResourceCollectionComposable<Data, Error> {
  const resourceCache = injectAsyncResourceCache();

  const selectedParams = computed(select);

  const cacheEntries = computed(() =>
    values(resourceCache.value).filter(
      (entry) => entry.resourceDefinition.name === resourceDefinition.name,
    ),
  );

  const relevantEntries = computed(() => {
    const selectedEntries = cacheEntries.value.filter((entry) =>
      every(
        toPairs(selectedParams.value),
        ([name, value]) => entry.params[name] === value,
      ),
    );

    return selectedEntries;
  });

  const status = ref<ResourceStatus>("pending");
  const error = ref<Error | null>(null);

  const activePromise = ref<ReturnType<typeof query> | null>(null);

  async function refetch() {
    if (hasValue(activePromise.value)) {
      await activePromise.value;
    } else {
      activePromise.value = query({ select: selectedParams.value });

      const queryResult = await activePromise.value;

      if (queryResult.isErr()) {
        error.value = queryResult.error;
        status.value = "error";
      } else {
        queryResult.value.forEach((data) => {
          const identifier = normalize(data);
          const params = {
            [resourceDefinition.name]: identifier,
            ...selectedParams.value,
          };

          const cacheKey = resourceDefinition.keyFactory(params as any);

          resourceCache.value[cacheKey] = {
            resourceDefinition,
            params,
            data,
          };
        });
        status.value = "success";
      }
      activePromise.value = null;
    }
  }

  watch(
    () => [selectedParams.value],
    () => refetch(),
    { immediate: true, deep: true },
  );

  const state = computed(
    () =>
      ({
        status: status.value,
        isFetching: hasValue(activePromise.value),
        isPending: status.value === "pending",
        isError: status.value === "error",
        isSuccess: status.value === "success",
        data: relevantEntries.value.map((entry) => entry.data),
        error: error.value,
      }) as ResourceState<Data[], Error>,
  );

  return {
    state,
    refetch,
  };
}
