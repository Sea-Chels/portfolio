/**
 * index.css is the one palette source; code that paints outside CSS (canvas, WebGL, the console)
 * reads the same `--*-rgb` channel tokens through here instead of re-typing them.
 */
export type Channels = [r: number, g: number, b: number]

/** Parses a channel token's value, e.g. ` 255 122 100`. */
export function parseChannels(value: string, what: string): Channels {
  const parts = value.trim().split(/\s+/).map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error(`Malformed color token ${what}: "${value}"`)
  }
  return [parts[0], parts[1], parts[2]]
}

export const toHex = ([r, g, b]: Channels) => (r << 16) | (g << 8) | b

export const toRgb = ([r, g, b]: Channels) => `rgb(${r} ${g} ${b})`

/** A channel token's current value on the page, e.g. `cssChannels('--accent-rgb')`. */
export function cssChannels(token: `--${string}-rgb`): Channels {
  return parseChannels(getComputedStyle(document.documentElement).getPropertyValue(token), token)
}
