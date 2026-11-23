import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { NavigablePage } from '../routing/routes'
import { useAnnounce } from '../a11y/announce'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { skills } from '../content/skills'
import { useTheme } from '../context/ThemeContext'
import { DEFAULT_COMMAND, runCommand, type StudyRef } from './commands'
import { applyFrames, type Frame } from './hacker'
import { isEditableTarget } from './dom'
import { useCaretPosition } from './useCaretPosition'
import { useTypingEffect } from './useTypingEffect'
import { CONTENT_DELAY_MS, GREETING, NAME, NAME_LINE, TITLE } from './intro'
import { useReveal } from '../Components/useReveal'

const REBOOT_MS = 900
const MAX_ENTRIES = 30

interface Props {
  studies: StudyRef[]
  onViewProjects: () => void
  onOpenStudy: (id: string) => void
  /** Leaves the terminal's page for another one. */
  onNavigate: (page: NavigablePage) => void
}

interface Entry {
  id: number
  command: string
  lines: string[]
}

interface Playback {
  entryId: number
  frames: Frame[]
  final: string[]
  timer?: number
}

type WindowState = 'open' | 'closed' | 'minimized'

function Caret() {
  return <span className="animate-pulse text-accent motion-reduce:animate-none">_</span>
}

/** `headingHidden`: while minimized the window header carries the page's only h1. */
function Session({ studies, onViewProjects, onOpenStudy, onNavigate, reduced, headingHidden }: Props & { reduced: boolean; headingHidden: boolean }) {
  const greeting = useTypingEffect(GREETING, reduced)
  const name = useTypingEffect(NAME_LINE, reduced)
  const title = useTypingEffect(TITLE, reduced)
  const showContent = useReveal(CONTENT_DELAY_MS, reduced)
  const [entries, setEntries] = useState<Entry[]>([])
  const [input, setInput] = useState('')
  const recall = useRef({ past: [] as string[], cursor: -1 })
  const nextId = useRef(0)
  const playback = useRef<Playback | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const caret = useCaretPosition(inputRef)
  const outputRef = useRef<HTMLOListElement>(null)
  const { theme, setTheme } = useTheme()
  const announce = useAnnounce()


  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== '/' || !showContent || isEditableTarget(e.target) || e.metaKey || e.ctrlKey) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showContent])

  useEffect(() => () => window.clearTimeout(playback.current?.timer), [])

  const setEntryLines = (entryId: number, update: (lines: string[]) => string[]) =>
    setEntries((list) => list.map((e) => (e.id === entryId ? { ...e, lines: update(e.lines) } : e)))

  /** Latest command wins: a running animation jumps to its final screen before the next command runs. */
  const finishPlayback = () => {
    const p = playback.current
    if (!p) return
    window.clearTimeout(p.timer)
    playback.current = null
    setEntryLines(p.entryId, () => p.final)
  }

  const playFrom = (p: Playback, index: number) => {
    if (index >= p.frames.length) {
      playback.current = null
      announce(p.final[p.final.length - 1] ?? '')
      return
    }
    const frame = p.frames[index]
    p.timer = window.setTimeout(() => {
      setEntryLines(p.entryId, (lines) => applyFrames(lines, [frame]))
      playFrom(p, index + 1)
    }, frame.delay)
  }

  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const command = input.trim() || DEFAULT_COMMAND
    finishPlayback()
    const out = runCommand(command, { studies, skills, theme, seed: Date.now() })
    recall.current = { past: [...recall.current.past, command], cursor: -1 }
    setInput('')

    const effect = out.effect
    if (effect?.kind === 'clear' || effect?.kind === 'exit') {
      setEntries([])
      if (effect.kind === 'exit') inputRef.current?.blur()
      announce(effect.kind === 'exit' ? 'Session ended.' : 'Screen cleared.')
      return
    }
    const entryId = nextId.current++
    const frames = out.frames ?? []
    const final = applyFrames(out.lines, frames)
    const animate = frames.length > 0 && !reduced
    setEntries((list) => [...list, { id: entryId, command, lines: animate ? out.lines : final }].slice(-MAX_ENTRIES))
    if (animate) {
      if (out.lines.length) announce(out.lines.join(' '))
      playback.current = { entryId, frames, final }
      playFrom(playback.current, 0)
    } else {
      announce(frames.length ? final[final.length - 1] : out.lines.join(' '))
    }
    if (effect?.kind === 'scroll') onViewProjects()
    else if (effect?.kind === 'open') onOpenStudy(effect.id)
    else if (effect?.kind === 'theme') setTheme(effect.theme)
    else if (effect?.kind === 'go') onNavigate(effect.page)
  }

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    const { past, cursor } = recall.current
    if (!past.length) return
    e.preventDefault()
    const next = e.key === 'ArrowUp' ? (cursor === -1 ? past.length - 1 : Math.max(0, cursor - 1)) : cursor === -1 ? -1 : cursor + 1
    const inRange = next >= 0 && next < past.length
    recall.current.cursor = inRange ? next : -1
    setInput(inRange ? past[next] : '')
  }

  const Heading = headingHidden ? 'p' : 'h1'
  const reveal = `transition-all duration-700 motion-reduce:transition-none ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`

  return (
    <div className="p-8 font-mono md:p-12">
      <div className="terminal-greeting mb-6 text-lg text-accent md:text-xl">
        {greeting.displayedText}
        {!greeting.isComplete && <Caret />}
      </div>
      <Heading className="terminal-name mb-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-6xl" aria-label={NAME}>
        {name.displayedText}
        {greeting.isComplete && !name.isComplete && <Caret />}
      </Heading>
      <div className="terminal-title mb-8 text-xl text-[var(--text-secondary)] md:text-2xl">
        {title.displayedText}
        {name.isComplete && !title.isComplete && <Caret />}
      </div>
      <p className={`mb-10 max-w-xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg ${reveal}`}>
        Crafting elegant digital experiences with clean code and creative vision. From pixel-perfect UIs to robust backend
        systems.
      </p>

      <div className={`${reveal} delay-200`} inert={!showContent}>
        {entries.length > 0 && (
          <ol ref={outputRef} aria-label="Terminal output" className="mb-4 max-h-64 space-y-2 overflow-y-auto text-sm">
            {entries.map((entry) => (
              <li key={entry.id}>
                <p className="text-[var(--text-muted)]">
                  <span className="text-accent">$</span> {entry.command}
                </p>
                {entry.lines.map((line, i) => (
                  <p key={i} className="whitespace-pre-wrap break-words text-[var(--text-secondary)]">
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        )}
        <form onSubmit={submit}>
          <label className="mb-6 flex items-center gap-3 text-[var(--text-muted)]">
            <span aria-hidden className="text-accent">
              $
            </span>
            <span className="sr-only">Terminal command. Type help to see what it can do.</span>
            <span className="relative flex min-w-0 flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                placeholder={DEFAULT_COMMAND}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="terminal-input min-w-0 flex-1 bg-transparent text-[var(--text-primary)] caret-[rgb(var(--accent-rgb))] placeholder:text-[var(--text-muted)]"
              />
              {caret !== null && (
                <span key={`${caret}-${input}`} aria-hidden className="terminal-caret" style={{ left: caret }} />
              )}
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn-hacker">
              Execute
            </button>
            <span className="text-xs text-[var(--text-muted)]">
              press <kbd className="rounded border border-[var(--border)] px-1">/</kbd> to type · try <code>help</code>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Terminal(props: Props) {
  const [win, setWin] = useState<WindowState>('open')
  const [expanded, setExpanded] = useState(false)
  const [boot, setBoot] = useState(0)
  const reduced = useReducedMotion()
  const announce = useAnnounce()

  useEffect(() => {
    if (win !== 'closed') return
    const timer = window.setTimeout(() => {
      setBoot((b) => b + 1)
      setWin('open')
    }, reduced ? 0 : REBOOT_MS)
    return () => window.clearTimeout(timer)
  }, [win, reduced])

  const close = () => {
    setWin('closed')
    announce('Terminal closed. Rebooting.')
  }
  const toggleMinimized = () => {
    const next = win === 'minimized' ? 'open' : 'minimized'
    setWin(next)
    announce(next === 'minimized' ? 'Terminal minimized.' : 'Terminal restored.')
  }
  const toggleExpanded = () => {
    setExpanded(!expanded)
    if (win === 'minimized') setWin('open')
    announce(expanded ? 'Terminal shrunk.' : 'Terminal expanded.')
  }

  const lights = [
    { label: 'Close and reboot terminal', tone: 'bg-[var(--window-close)]', onClick: close, pressed: undefined },
    { label: win === 'minimized' ? 'Restore terminal' : 'Minimize terminal', tone: 'bg-[var(--window-minimize)]', onClick: toggleMinimized, pressed: win === 'minimized' },
    { label: expanded ? 'Shrink terminal' : 'Expand terminal', tone: 'bg-[var(--window-expand)]', onClick: toggleExpanded, pressed: expanded },
  ]

  return (
    <div data-comic-sfx className={`relative z-10 mx-auto w-full transition-[max-width] duration-500 motion-reduce:transition-none ${expanded ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <div data-comic-panel className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="terminal-bar flex items-center gap-1 border-b border-[var(--border)] bg-[var(--elevated)] px-3 py-2">
          {lights.map((l) => (
            <button
              key={l.tone}
              type="button"
              onClick={l.onClick}
              aria-label={l.label}
              aria-pressed={l.pressed}
              title={l.label}
              className="group grid h-6 w-6 place-items-center rounded-full"
            >
              <span aria-hidden className={`h-3 w-3 rounded-full ${l.tone} transition-transform group-hover:scale-125 motion-reduce:transition-none`} />
            </button>
          ))}
          <span className="ml-3 font-mono text-sm text-[var(--text-muted)]">~/chelby-sallady</span>
        </div>

        {win !== 'open' && <h1 className="sr-only">{NAME}</h1>}
        {win === 'closed' && (
          <div className="p-8 font-mono text-[var(--text-muted)] md:p-12">
            <p>[Process completed]</p>
            <p>rebooting…</p>
          </div>
        )}
        {win !== 'closed' && (
          <div hidden={win === 'minimized'}>
            <Session key={boot} {...props} reduced={reduced} headingHidden={win === 'minimized'} />
          </div>
        )}
      </div>

      <div aria-hidden className="absolute -bottom-4 -right-4 h-24 w-24 rounded-br-lg border-b-2 border-r-2 border-accent/30" />
      <div aria-hidden className="absolute -left-4 -top-4 h-24 w-24 rounded-tl-lg border-l-2 border-t-2 border-accent/30" />
    </div>
  )
}
