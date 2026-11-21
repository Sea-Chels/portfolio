export interface History {
  entries: string[]
  index: number
}

export type HistoryAction = { type: 'push'; path: string } | { type: 'back' } | { type: 'forward' }

export const startHistory = (path: string): History => ({ entries: [path], index: 0 })

export function current(h: History): string {
  return h.entries[h.index]
}

/** Browser-style history: pushing after going back drops the forward entries. */
export function historyReducer(h: History, action: HistoryAction): History {
  switch (action.type) {
    case 'push':
      if (action.path === current(h)) return h
      return { entries: [...h.entries.slice(0, h.index + 1), action.path], index: h.index + 1 }
    case 'back':
      return h.index > 0 ? { ...h, index: h.index - 1 } : h
    case 'forward':
      return h.index < h.entries.length - 1 ? { ...h, index: h.index + 1 } : h
  }
}

/** `/` shows everything, `/<category>` filters, anything else is a 404. */
export function matchRoute<C extends string>(path: string, categories: readonly C[]): C | 'all' | null {
  if (path === '/') return 'all'
  const slug = path.replace(/^\/|\/$/g, '')
  return (categories as readonly string[]).includes(slug) ? (slug as C) : null
}
