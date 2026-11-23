import { HOME, ROUTES, routeForPage, type NavRoute, type NavigablePage } from '../routing/routes'
import { NETSTAT, SITE_HOST, decrypt, hack, matrix, npmInstall, ping, scan, type Frame } from './hacker'

export type Theme = 'dark' | 'light'

export interface StudyRef {
  id: string
  title: string
}

export type Effect =
  | { kind: 'scroll' }
  | { kind: 'open'; id: string }
  | { kind: 'go'; page: NavigablePage }
  | { kind: 'theme'; theme: Theme }
  | { kind: 'clear' }
  | { kind: 'exit' }

export interface Output {
  lines: string[]
  /** Played after `lines`, over time. */
  frames?: Frame[]
  effect?: Effect
}

export interface Context {
  studies: StudyRef[]
  skills: string[]
  theme: Theme
  /** Varies the noise in commands like matrix; fixed in tests. */
  seed?: number
}

/** What Execute runs when the prompt is empty, so the button keeps its original job. */
export const DEFAULT_COMMAND = 'view --projects'
export const SECRET_KEYS = ['↑', '↑', '↓', '↓', '←', '→', '←', '→']

const HELP_ENTRIES: [string, string][] = [
  ['view --projects', 'jump to the case studies'],
  ['ls', 'list the case studies'],
  ['open <name>', 'open a case study'],
  ['cd <page>', `go to a page: ${ROUTES.filter((r) => r !== HOME).map((r) => r.path.slice(1)).join(' · ')}`],
  ['whoami', 'who runs this terminal'],
  ['cat skills', 'print the toolkit'],
  ['theme [light|dark]', 'switch themes'],
  ['scan · ping · netstat', 'poke at the network'],
  ['hack [target]', 'you know you want to'],
  ['clear', 'clear the screen'],
  ['exit', 'end the session'],
]
const HELP_COLUMN = Math.max(...HELP_ENTRIES.map(([cmd]) => cmd.length)) + 2
const HELP = [...HELP_ENTRIES.map(([cmd, what]) => cmd.padEnd(HELP_COLUMN) + what), '…plus a few things that aren’t on this list.']

/** Deterministic noise that reads like base64 ciphertext; nothing is actually encrypted. */
export function fakeCiphertext(seed: string, length = 44): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let state = [...seed].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261)
  let out = ''
  for (let i = 0; i < length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    out += alphabet[state >>> 26]
  }
  return `${out}==`
}

/** Hidden extra names for pages, on top of their paths and nav labels. */
const CD_ALIASES: Record<string, NavigablePage> = { park: 'hangout' }

/**
 * The page `cd` lands on, by path or nav label, in any case and with shell spellings like `~/art`,
 * `/art/` or `./art`. Bare `cd`, `~`, `/`, `.` and `..` are home, where the terminal lives.
 */
export function cdTarget(raw: string): NavRoute | null {
  const name = raw.trim().replace(/^~/, '').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '').toLowerCase()
  if (name === '' || name === '.' || name === '..') return HOME
  const alias = CD_ALIASES[name]
  if (alias) return routeForPage(alias)
  return ROUTES.find((route) => route.path === `/${name}` || route.label.toLowerCase() === name) ?? null
}

export function findStudy(studies: StudyRef[], query: string): StudyRef | undefined {
  const q = query.toLowerCase()
  return (
    studies.find((s) => s.id === q) ??
    studies.find((s) => s.id.startsWith(q)) ??
    studies.find((s) => s.title.toLowerCase().includes(q))
  )
}

type Handler = (args: string, ctx: Context) => Output
/**
 * Ordered: the first pattern that matches wins, so specific sudo jokes come before the generic one.
 * Group 1, when present, is the command's argument; every other group must be non-capturing.
 */
const COMMANDS: [RegExp, Handler][] = [
  [/^help$/, () => ({ lines: HELP })],
  [/^(?:view --projects|cd projects)$/, () => ({ lines: ['scrolling to the case studies…'], effect: { kind: 'scroll' } })],
  [
    /^cd(?:\s+(.+))?$/,
    (name) => {
      const route = cdTarget(name)
      if (!route) return { lines: [`cd: no such file or directory: ${name}`] }
      // Like a real cd, success prints nothing; the page announces itself on arrival.
      return route === HOME ? { lines: [] } : { lines: [], effect: { kind: 'go', page: route.page } }
    },
  ],
  [/^touch grass$/, () => ({ lines: ['good call. heading outside…'], effect: { kind: 'go', page: 'hangout' } })],
  [/^ls$/, (_, ctx) => ({ lines: ctx.studies.map((s) => `${s.id.padEnd(18)}${s.title}`) })],
  [
    /^open(?:\s+(.+))?$/,
    (name, ctx) => {
      if (!name) return { lines: ['usage: open <name>   (try ls)'] }
      const study = findStudy(ctx.studies, name)
      return study ? { lines: [`opening ${study.title}…`], effect: { kind: 'open', id: study.id } } : { lines: [`open: no case study named "${name}". Try ls.`] }
    },
  ],
  [/^whoami$/, () => ({ lines: ['Chelby Sallady: full-stack engineer who came to code through design.'] })],
  [/^pwd$/, () => ({ lines: ['~/chelby-sallady'] })],
  [/^cat skills(?:\.txt)?$/, (_, ctx) => ({ lines: [ctx.skills.join('  ')] })],
  [/^cat secrets?(?:\.txt)?$/, () => ({ lines: [fakeCiphertext('secrets.txt'), 'decrypt: you’d need my private key for that.'] })],
  [/^cat(?:\s+(.+))?$/, (file) => ({ lines: [file ? `cat: ${file}: No such file or directory` : 'usage: cat <file>'] })],
  [
    /^theme(?:\s+(.+))?$/,
    (arg, ctx) => {
      if (!arg) return { lines: [`theme: ${ctx.theme}`] }
      if (arg !== 'light' && arg !== 'dark') return { lines: ['usage: theme [light|dark]'] }
      return { lines: [`theme: ${arg}`], effect: { kind: 'theme', theme: arg } }
    },
  ],
  [/^sudo approve-loan$/, () => ({ lines: ['permission denied: role "visitor" lacks loans:approve'] })],
  [/^(?:sudo\s+)?rm\b.*$/, () => ({ lines: ['nice try'] })],
  [/^sudo\b.*$/, () => ({ lines: ['visitor is not in the sudoers file. This incident will be reported.'] })],
  [/^(?:scan|nmap)(?:\s+(.+))?$/, (host) => ({ lines: [`starting scan of ${host || SITE_HOST}…`], frames: scan(host || undefined) })],
  [/^ping(?:\s+(.+))?$/, (host) => ({ lines: [`PING ${host || SITE_HOST}: 56 data bytes`], frames: ping(host || undefined) })],
  [/^netstat$/, () => ({ lines: NETSTAT })],
  [/^hack(?:\s+(.+))?$/, (target) => ({ lines: [], frames: hack(target) })],
  [/^matrix$/, (_, ctx) => ({ lines: [], frames: matrix(ctx.seed ?? 0) })],
  [/^decrypt(?:\s+(.+))?$/, (file) => ({ lines: [], frames: decrypt(file || 'secrets.txt') })],
  [/^npm (?:install|i)(?:\s+(.+))?$/, (pkg) => (pkg ? { lines: [], frames: npmInstall(pkg) } : { lines: ['usage: npm install <package>'] })],
  [/^ssh(?:\s+(.+))?$/, (host) => ({ lines: [`ssh: connect to host ${host || SITE_HOST} port 22: Connection refused`] })],
  [/^hola$/, () => ({ lines: ['¡Hola! Bienvenido.', 'For English, press 1. Para español, oprima 2.'] })],
  [/^(?:hello|hi|hey)$/, () => ({ lines: ['hello, world'] })],
  [/^echo(?:\s+(.*))?$/, (text) => ({ lines: [text ?? ''] })],
  [/^(?:konami|cheats?|secrets?|easter ?egg)$/, () => ({ lines: [`not here. Try the arrow keys: ${SECRET_KEYS.join(' ')}`] })],
  [/^clear$/, () => ({ lines: [], effect: { kind: 'clear' } })],
  [/^(?:exit|logout|quit)$/, () => ({ lines: ['logout'], effect: { kind: 'exit' } })],
]

export function runCommand(raw: string, ctx: Context): Output {
  const input = raw.trim().replace(/\s+/g, ' ')
  if (!input) return { lines: [] }
  const lower = input.toLowerCase()
  for (const [re, run] of COMMANDS) {
    const m = lower.match(re)
    // Arguments keep their original case, e.g. for echo.
    if (m) return run(m[1] === undefined ? '' : input.slice(input.length - m[1].length), ctx)
  }
  return { lines: [`command not found: ${input.split(' ')[0]}. Try help.`] }
}
