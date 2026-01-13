import { computed, ref } from "vue";
import { ResourceActionDefinition, ResourceActionType } from "./types.js";
import { injectAsyncResourceCache } from "../cache/injection.js";
import { hasNoValue } from "../utils/hasNoValue.js";
import { hasValue } from "../utils/hasValue.js";
import { err, ok } from "../utils/result.js";
import { ResourceDefinition } from "../resource/types.js";

export type ResourceActionStatus = "idle" | "running" | "failed";

interface IdleState {
  status: "idle";
  isRunning: false;
  isFailed: false;
}

interface RunningState {
  status: "running";
  isRunning: true;
  isFailed: false;
}

interface FailedState<Error> {
  status: "failed";
  isRunning: false;
  isFailed: true;
  error: Error;
}

export type ResourceActionState<Error> =
  | IdleState
  | RunningState
  | FailedState<Error>;

export function useResourceAction<
  Data,
  Error,
  ActionDef extends ResourceActionDefinition<
    ResourceActionType,
    string,
    ResourceDefinition[],
    boolean,
    Data,
    Error,
    unknown[]
  >,
>(
  resourceActionDefinition: ActionDef,
  options: {
    onResolve?: (data: Data) => void;
    onFail?: (error: Error) => void;
  },
) {
  const activePromise = ref<ReturnType<ActionDef["asyncAction"]> | null>(null);
  const error = ref<Error | null>(null);
  const status = computed<ResourceActionStatus>(() =>
    hasValue(activePromise.value)
      ? "running"
      : hasValue(error.value)
        ? "failed"
        : "idle",
  );
  const resourceCache = injectAsyncResourceCache();

  const tryExecuteOptimisticUpdate = (
    args: Parameters<ActionDef["asyncAction"]>,
  ) => {
    const { type, optimisticAction, resourceDefinition } =
      resourceActionDefinition;

    if (hasNoValue(optimisticAction)) {
      return null;
    }

    const optimisticResult = optimisticAction({ ok, err }, ...args);
    const cacheKey = resourceDefinition.keyFactory(optimisticResult.params);
    const lastCacheEntry = resourceCache.value[cacheKey];

    if (type === "delete") {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete resourceCache.value[cacheKey];
    } else if (type === "create") {
      resourceCache.value[cacheKey] = {
        resourceDefinition,
        params: optimisticResult.params,
        data: optimisticResult.data,
      };
    } else if (type === "mutate") {
      resourceCache.value[cacheKey].data = optimisticResult.data;
    }

    const rollback = () => {
      resourceCache.value[cacheKey] = lastCacheEntry;
    };

    return { rollback };
  };

  const execute = async (...args: Parameters<ActionDef["asyncAction"]>) => {
    if (hasValue(activePromise.value)) {
      await activePromise.value;
    }

    const { type, asyncAction, resourceDefinition } = resourceActionDefinition;

    error.value = null;
    activePromise.value = asyncAction({ ok, err }, ...args);

    const optimisticResult = tryExecuteOptimisticUpdate(args);
    const asyncResult = await activePromise.value;

    if (asyncResult.isOk()) {
      const cacheKey = resourceDefinition.keyFactory(asyncResult.value.params);

      if (type === "delete") {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete resourceCache.value[cacheKey];
      } else if (type === "create") {
        resourceCache.value[cacheKey] = {
          resourceDefinition,
          params: asyncResult.value.params,
          data: asyncResult.value.data,
        };
      } else if (type === "mutate") {
        resourceCache.value[cacheKey].data = asyncResult.value.data;
      }
      options.onResolve?.(asyncResult.value.data);
    } else {
      error.value = asyncResult.error;

      if (hasValue(optimisticResult)) {
        const { rollback } = optimisticResult;
        rollback();
      }
      options.onFail?.(asyncResult.error);
    }

    activePromise.value = null;
  };

  const actionState = computed(
    () =>
      ({
        status: status.value,
        isRunning: status.value === "running",
        isFailed: status.value === "failed",
        error: error.value,
      }) as ResourceActionState<Error>,
  );

  return {
    state: actionState,
    execute,
  };
}
