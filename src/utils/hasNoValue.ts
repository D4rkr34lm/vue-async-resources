export function hasNoValue<T>(
  value: T | undefined | null,
): value is undefined | null {
  return value === undefined || value === null;
}
