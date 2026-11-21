import type { TurnDirection } from './curlGeometry'

/** Most turns that can wait behind the one playing, so holding a key doesn't queue a long chain. */
export const MAX_QUEUED_TURNS = 3

/** Turns pressed mid-curl, kept as a net count: forward is positive, and opposite presses cancel. */
export function queueTurn(pending: number, direction: TurnDirection, max = MAX_QUEUED_TURNS): number {
  return Math.max(-max, Math.min(max, pending + direction))
}

/** The next queued turn to play and what remains, or null when nothing is waiting. */
export function takeTurn(pending: number): { direction: TurnDirection; rest: number } | null {
  if (pending === 0) return null
  const direction: TurnDirection = pending > 0 ? 1 : -1
  return { direction, rest: pending - direction }
}
