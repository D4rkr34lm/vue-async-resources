import { computed } from "vue";
import {
  ResourceComposable,
  ResourceStatus,
  ResourceState,
} from "../resource/useResource.js";
import { CombinedResourceData, CombinedResourceError } from "./types.js";
import { toPairs } from "../utils/toPairs.js";
import { some } from "../utils/some.js";
import { every } from "../utils/every.js";

export function useCombinedResources<
  Resources extends {
    [queryName: string]: ResourceComposable<unknown, unknown>;
  },
>(
  queries: Resources,
): ResourceComposable<
  CombinedResourceData<Resources>,
  CombinedResourceError<Resources>
> {
  const resourceAndNamePairs = toPairs(queries);

  const refetch = async () => {
    await Promise.all(
      resourceAndNamePairs.map(([_, query]) => query.refetch()),
    );
  };

  const resourceStatuses = computed<ResourceStatus>(() =>
    some(resourceAndNamePairs, ([_, query]) => query.state.value.isPending)
      ? "pending"
      : every(resourceAndNamePairs, ([_, query]) => query.state.value.isSuccess)
        ? "success"
        : "error",
  );
  const isFetching = computed(() =>
    some(resourceAndNamePairs, ([_, query]) => query.state.value.isFetching),
  );
  const data = computed(() =>
    resourceStatuses.value !== "success"
      ? null
      : resourceAndNamePairs.reduce(
          (acc, [name, query]) => ({
            ...acc,
            [name]: query.state.value.isSuccess
              ? query.state.value.data
              : undefined,
          }),
          {},
        ),
  );
  const error = computed(() =>
    resourceStatuses.value !== "error"
      ? null
      : resourceAndNamePairs.reduce(
          (acc, [name, query]) => ({
            ...acc,
            [name]: query.state.value.isError
              ? query.state.value.error
              : undefined,
          }),
          {},
        ),
  );

  return {
    state: computed(
      () =>
        ({
          status: resourceStatuses.value,
          isFetching: isFetching.value,
          isPending: resourceStatuses.value === "pending",
          isSuccess: resourceStatuses.value === "success",
          isError: resourceStatuses.value === "error",
          data: data.value,
          error: error.value,
        }) as ResourceState<
          CombinedResourceData<Resources>,
          CombinedResourceError<Resources>
        >,
    ),
    refetch,
  };
}
