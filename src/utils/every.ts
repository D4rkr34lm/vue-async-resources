export function every<T>(
  collection: T[],
  predicate: (element: T) => boolean,
): boolean {
  return collection
    .map(predicate)
    .reduce((acc, res) => (acc && res ? true : false), true);
}
