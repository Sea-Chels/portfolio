import { SECRET_SEQUENCE } from '../terminal/sequence'

export interface SearchLine {
  text: string
  kind: 'command' | 'output' | 'result' | 'secret'
}

const MAX_PATH = 40

/** The missing path as people typed it: decoded, and trimmed so a long one can't break the layout. */
export function displayPath(pathname: string): string {
  let path = pathname
  try {
    path = decodeURIComponent(pathname)
  } catch {
    // A malformed escape like `%E0%A4%A` stays as typed.
  }
  return path.length > MAX_PATH ? `${path.slice(0, MAX_PATH - 1)}…` : path
}

/** Where each round of searching looks, and what it finds instead. */
const SPOTS: [place: string, finding: string][][] = [
  [
    ['/about', 'just me, talking about myself'],
    ['/art', 'lots of drawings, no page'],
    ['under the couch', 'two crumbs and a guitar pick'],
    ['git log', 'it was never committed'],
  ],
  [
    ['the junk drawer', 'dead batteries, one key to nothing'],
    ['node_modules', 'still searching… it’s been 40 minutes'],
    ['the backlog', 'filed under “someday”'],
    ['Stack Overflow', 'closed as a duplicate'],
  ],
]

const ARROWS: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }
export const SECRET_HINT = SECRET_SEQUENCE.map((key) => ARROWS[key]).join(' ')

/** Each round of searching visits one set of SPOTS, then a round digs up the easter egg instead. */
const ROUNDS = SPOTS.length + 1
export const SECRET_ATTEMPT = SPOTS.length

/** The terminal transcript for one search. Every last round turns up the comic-mode code instead. */
export function searchLines(pathname: string, attempt: number): SearchLine[] {
  const path = displayPath(pathname)
  const name = path.split('/').filter(Boolean).pop() ?? path
  const intro: SearchLine[] =
    attempt === 0
      ? [
          { kind: 'command', text: `cd ${path}` },
          { kind: 'output', text: `cd: no such file or directory: ${path}` },
        ]
      : []
  const find: SearchLine = { kind: 'command', text: `find / -name "${name}"` }

  if (attempt % ROUNDS === SECRET_ATTEMPT) {
    return [
      ...intro,
      find,
      { kind: 'output', text: 'searching /dev/null … oh. oh no.' },
      { kind: 'result', text: 'Still no page. But you dug up something else:' },
      { kind: 'secret', text: `${SECRET_HINT}   (try it on any page)` },
    ]
  }

  const spots = SPOTS[attempt % ROUNDS]
  return [
    ...intro,
    find,
    ...spots.map(([place, finding]): SearchLine => ({ kind: 'output', text: `searching ${place} … ${finding}` })),
    { kind: 'result', text: '0 results. It’s not you, it’s the URL.' },
  ]
}
