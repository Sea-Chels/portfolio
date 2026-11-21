/** Fails loudly, naming what was missing, instead of trusting that a value can't be null. */
export function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Missing ${what}`)
  return value
}
