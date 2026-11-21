export const MM_PER_INCH = 25.4

/** Parses CAD-style inch input: `3`, `3.25`, `3/8`, `3 3/8` or `3-3/8`, with an optional `"` or `in`. */
export function parseInches(text: string): number | null {
  const s = text.trim().replace(/\s*(?:"|in(?:ches)?)$/i, '')
  const m = /^(?:(\d+(?:\.\d+)?)(?:[\s-]+(\d+)\/(\d+))?|(\d+)\/(\d+))$/.exec(s)
  if (!m) return null
  const [, whole, mixNum, mixDen, num, den] = m
  if (num !== undefined) return Number(den) === 0 ? null : Number(num) / Number(den)
  if (mixNum !== undefined) {
    if (Number(mixDen) === 0 || whole.includes('.')) return null
    return Number(whole) + Number(mixNum) / Number(mixDen)
  }
  return Number(whole)
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH
}

/** Rounds half up at 2 decimals; shifting by exponent avoids 85.725 landing on 85.72 via binary float. */
export function formatMm(mm: number): string {
  if (!Number.isFinite(mm) || String(mm).includes('e')) return `${mm.toFixed(2)} mm`
  const rounded = Number(`${Math.round(Number(`${mm}e2`))}e-2`)
  return `${rounded} mm`
}
