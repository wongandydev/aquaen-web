/** Port of `Comparable+Clamped.swift`. */
export function clamped(value: number, lower: number, upper: number): number {
  if (Number.isNaN(value)) return lower
  return Math.min(Math.max(value, lower), upper)
}
