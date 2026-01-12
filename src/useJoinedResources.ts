import { every, some, toPairs } from "lodash";
import { computed } from "vue";
import type {
  ResourceComposable,
  ResourceState,
  ResourceStatus,
} from "./useResource";

type CombinedResourceError<
  Resources extends {
    [queryName: string]: ResourceComposable<any, any>;
  },
> = {
  [Name in keyof Resources]: Resources[Name] extends ResourceComposable<
    any,
    infer Error
  >
    ? Error
    : never;
};

type CombinedResourceData<
  Resources extends {
    [queryName: string]: ResourceComposable<any, any>;
  },
> = {
  [Name in keyof Resources]: Resources[Name] extends ResourceComposable<
    infer Data,
    any
  >
    ? Data
    : never;
};

export function useCombinedResources<
  Resources extends {
    [queryName: string]: ResourceComposable<any, any>;
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
