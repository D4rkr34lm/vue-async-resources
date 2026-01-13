export function values<T>(object: { [key: string]: T }): T[] {
  return Object.values(object);
}
