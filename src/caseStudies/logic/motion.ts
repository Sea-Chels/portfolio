export type Ease = (t: number) => number

export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
/** Overshoots by about 10% then settles: lids and doors that land with a little bounce. */
export const easeOutBack: Ease = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2

/** Height of a camera arc at progress `k`: zero at both ends, so close-ups swing in rather than slide. */
export function arcLift(k: number, distance: number, maxLift: number): number {
  return Math.sin(k * Math.PI) * Math.min(maxLift, distance * 0.12)
}

interface TweenOpts {
  duration: number
  ease?: Ease
  update: (k: number) => void
  done?: () => void
  /** A new tween with the same tag replaces the running one, starting from wherever it got to. */
  tag?: string
}

interface Tween extends Required<Omit<TweenOpts, 'done' | 'tag'>> {
  start: number
  tag?: string
  done?: () => void
}

/** Frame-driven tweens with the clock passed in, so they're testable and pause with the render loop. */
export function createTweens(instant: () => boolean = () => false) {
  const active: Tween[] = []
  return {
    add(opts: TweenOpts, now: number): void {
      if (opts.tag) {
        for (let i = active.length - 1; i >= 0; i--) if (active[i].tag === opts.tag) active.splice(i, 1)
      }
      const duration = instant() ? 0 : Math.max(opts.duration, 0)
      active.push({ ease: easeInOutCubic, ...opts, duration, start: now })
    },
    /** Advances every tween to `now`; returns whether any are still running. */
    step(now: number): boolean {
      for (const t of active.slice()) {
        const k = t.duration === 0 ? 1 : Math.min(1, Math.max(0, (now - t.start) / t.duration))
        t.update(t.ease(k))
        if (k >= 1) {
          active.splice(active.indexOf(t), 1)
          t.done?.()
        }
      }
      return active.length > 0
    },
    clear(): void {
      active.length = 0
    },
  }
}
