/** Below these, a word has visibly stopped moving. */
export const REST_SPEED = 0.01
export const REST_SPIN = 0.0005

export interface Motion {
  speed: number
  angularSpeed: number
}

/** Whether every body has come to rest, so the simulation can stop until the next drag. */
export function isSettled(bodies: readonly Motion[], dragging: boolean): boolean {
  return !dragging && bodies.every((b) => b.speed < REST_SPEED && b.angularSpeed < REST_SPIN)
}
