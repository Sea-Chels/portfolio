/** Fake "hacker" commands. Everything is theater: no network calls, no real scanning. */

export interface Frame {
  /** Milliseconds after the previous frame. */
  delay: number
  line: string
  /** Overwrite the last line instead of adding one, for progress bars. */
  replace?: boolean
}

export const SITE_HOST = 'chelby-sallady.com'
const BAR_WIDTH = 20
const BAR_STEPS = 10

export function progressBar(label: string, pct: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  const filled = Math.round((clamped / 100) * BAR_WIDTH)
  return `${label} [${'#'.repeat(filled)}${'.'.repeat(BAR_WIDTH - filled)}] ${String(clamped).padStart(3)}%`
}

/** A small seeded generator, so output looks random but tests stay deterministic. */
export function seeded(seed: string | number): () => number {
  let state = [...String(seed)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261)
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

/** A progress bar that fills in BAR_STEPS frames: one new line, then overwrites. */
function bar(label: string, stepMs: number): Frame[] {
  return Array.from({ length: BAR_STEPS + 1 }, (_, i) => ({
    delay: stepMs,
    line: progressBar(label, (i / BAR_STEPS) * 100),
    replace: i > 0,
  }))
}

const lines = (delay: number, ...text: string[]): Frame[] => text.map((line) => ({ delay, line }))

export function scan(host = SITE_HOST): Frame[] {
  return [
    ...bar('scanning ports', 90),
    ...lines(
      140,
      'PORT       STATE     SERVICE',
      '80/tcp     open      http      → this portfolio',
      '443/tcp    open      https     → 7 case studies',
      '1337/tcp   open      elite     → try: hack',
      '8080/tcp   filtered  comic     → ↑ ↑ ↓ ↓ ← → ← →',
      `scan of ${host} complete. 0 vulnerabilities found. nice try.`,
    ),
  ]
}

export function ping(host = SITE_HOST): Frame[] {
  const rand = seeded(host)
  const times = Array.from({ length: 4 }, () => 8 + rand() * 20)
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return [
    ...times.map((t, i) => ({ delay: 420, line: `64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${t.toFixed(1)} ms` })),
    ...lines(250, `--- ${host} ping statistics ---`, `4 packets transmitted, 4 received, 0% packet loss, avg ${avg.toFixed(1)} ms`),
  ]
}

export const NETSTAT = [
  'Proto  Local address          Foreign address          State',
  `tcp    visitor:you            ${SITE_HOST}:443     ESTABLISHED`,
  'tcp    case-studies:7         *:*                      LISTEN',
  'tcp    terminal:/             *:*                      LISTEN',
  'tcp    comic-mode:↑↑↓↓←→←→    *:*                      LISTEN',
]

export function hack(target: string): Frame[] {
  const planet = /\bplanet\b/.test(target)
  return [
    ...lines(200, `initializing exploit kit against ${target || 'mainframe'}…`),
    ...bar('bypassing firewall   ', 70),
    ...bar('cracking password    ', 70),
    ...lines(250, 'password found: ********'),
    ...bar('downloading mainframe', 60),
    ...lines(300, 'ACCESS GRANTED', 'welcome, visitor. turns out the mainframe is just case studies.'),
    ...(planet ? lines(300, 'HACK THE PLANET!') : []),
  ]
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテト'

export function matrix(seed: number): Frame[] {
  const rand = seeded(seed)
  const row = () => Array.from({ length: 44 }, () => (rand() < 0.3 ? ' ' : MATRIX_CHARS[Math.floor(rand() * MATRIX_CHARS.length)])).join('')
  return [...Array.from({ length: 10 }, () => ({ delay: 80, line: row() })), ...lines(400, 'wake up, visitor…', 'follow the white rabbit: try scan')]
}

export function decrypt(file: string): Frame[] {
  return [...bar(`decrypting ${file}`, 80), ...lines(250, 'decrypt: private key not found. it never leaves my browser.')]
}

export function npmInstall(pkg: string): Frame[] {
  return [...bar(`installing ${pkg}`, 70), ...lines(150, `added 1 package: ${pkg}@latest in 0.8s`, 'found 0 vulnerabilities')]
}

/** What the screen shows once every frame has played. */
export function applyFrames(start: string[], frames: Frame[]): string[] {
  return frames.reduce((acc, f) => (f.replace && acc.length ? [...acc.slice(0, -1), f.line] : [...acc, f.line]), start)
}
