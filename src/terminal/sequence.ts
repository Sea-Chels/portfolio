export const SECRET_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']

/**
 * How much of `sequence` has been typed after `key`, given `progress` keys already matched.
 * Falls back to the longest typed suffix that is still a prefix, so ↑↑↑↓↓… still counts.
 */
export function advance(sequence: string[], progress: number, key: string): number {
  const typed = [...sequence.slice(0, progress), key]
  for (let start = 0; start < typed.length; start++) {
    const tail = typed.slice(start)
    if (tail.every((k, i) => sequence[i] === k)) return tail.length
  }
  return 0
}
