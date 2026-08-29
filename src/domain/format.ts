/** `String(format: "%.1f")` and friends, with the "-0.0" quirk removed. */
export function oz(value: number, fractionDigits = 1): string {
  const rounded = Number(value.toFixed(fractionDigits))
  return (Object.is(rounded, -0) ? 0 : rounded).toFixed(fractionDigits)
}

export function ozWhole(value: number): string {
  return oz(value, 0)
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
