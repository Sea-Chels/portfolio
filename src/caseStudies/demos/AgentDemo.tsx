import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import { useEffect, useState, type ReactNode } from 'react'
import { useAnnounce } from '../../a11y/announce'
import { useReducedMotion } from '../../a11y/useReducedMotion'
import {
  AGENT_LABEL,
  CHARACTER_LIMIT,
  EXTRACTION_TOOL,
  runTurn,
  type AgentName,
  type Entity,
  type EntityKind,
  type Turn,
} from '../logic/agentTurn'
import { StatusLine } from './StatusLine'

const PRESETS = [
  { label: 'Food, weight, mood', text: 'Had oatmeal and coffee this morning, weighed in at 182 lbs. Feeling stressed about work.' },
  { label: 'Symptoms', text: 'I’ve had a headache and felt dizzy since lunch.' },
  { label: 'High blood pressure', text: 'My blood pressure was 185/125 this morning.' },
  { label: 'Make a plan', text: 'Can you make me a plan to sleep better?' },
  { label: 'Set a goal', text: 'I want to set a goal to walk 10,000 steps a day.' },
  { label: 'Hypothetical', text: 'I might get pizza later. Had eggs for breakfast.' },
  { label: 'Crisis language', text: 'Some days I don’t want to live anymore.' },
  { label: 'Over the limit', text: 'I tracked everything today. '.repeat(75).trim() },
]

const CONTENT_POLICY =
  'This message may not meet our content guidelines. If you’re thinking about suicide or would like emotional support, call or text 988 to reach the Suicide & Crisis Lifeline. In an emergency, call 911.'

const KIND_LABEL: Record<EntityKind, string> = { measurement: 'Measurement', food: 'Food', mood: 'Mood', symptom: 'Symptom' }

/** Ticks per stage of the reveal; the reply then streams one word per tick. */
const TICK_MS = 110
const STAGE = { guard: 1, fanOut: 4, extraction: 8, gate: 10, acuity: 13, moderation: 16, reply: 17 }

interface Sent {
  id: number
  text: string
  turn: Turn
  removed: string[]
}

type LaneState = 'waiting' | 'running' | 'done' | 'skipped'
const LANE_TONE: Record<LaneState, string> = {
  waiting: 'text-[var(--text-muted)]',
  running: 'text-accent',
  done: 'text-[rgb(var(--ok-rgb))]',
  skipped: 'text-[var(--text-muted)]',
}

function Lane({ title, agent, state, children }: { title: string; agent: string; state: LaneState; children?: ReactNode }) {
  return (
    <li className="rounded border border-[var(--border)] px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <span className={`font-mono text-xs ${LANE_TONE[state]}`}>{state}</span>
      </div>
      <p className="font-mono text-[0.7rem] text-[var(--text-muted)]">{agent}</p>
      {state !== 'waiting' && children && <div className="mt-1 text-sm text-[var(--text-secondary)]">{children}</div>}
    </li>
  )
}

const stateAt = (tick: number, start: number, end: number): LaneState => (tick < start ? 'waiting' : tick < end ? 'running' : 'done')

export default function AgentDemo() {
  const [draft, setDraft] = useState(PRESETS[0].text)
  const [locked, setLocked] = useState<AgentName>('coach')
  const [thread, setThread] = useState<Sent[]>([])
  const [tick, setTick] = useState(0)
  const reduced = useReducedMotion()
  const announce = useAnnounce()

  const current = thread[thread.length - 1]
  const words = current?.turn.kind === 'processed' && current.turn.reply ? current.turn.reply.split(' ') : []
  const total = current ? (current.turn.kind === 'rejected' ? STAGE.guard : STAGE.reply + words.length) : 0
  const effectiveTick = reduced ? Infinity : tick

  useEffect(() => {
    if (!current || reduced) return
    const id = window.setInterval(() => {
      setTick((t) => {
        if (t + 1 >= total) window.clearInterval(id)
        return t + 1
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [current, reduced, total])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const turn = runTurn(text, locked)
    if (turn.kind === 'processed') setLocked(turn.routing.agent)
    setThread((t) => [...t.slice(-2), { id: Date.now(), text, turn, removed: [] }])
    setTick(0)
    if (turn.kind === 'rejected') announce(turn.reason)
    else if (turn.flagged) announce('Message flagged by moderation. Reply cancelled and support resources shown.')
    else announce(`${AGENT_LABEL[turn.routing.agent]} replied. ${turn.entities.length} entities extracted.`)
  }

  const removeEntity = (sentId: number, e: Entity) => {
    setThread((t) => t.map((s) => (s.id === sentId ? { ...s, removed: [...s.removed, e.id] } : s)))
    announce(`Removed ${e.label}`)
  }

  const turn = current?.turn

  return (
    <div className="space-y-4">
      <div className="cs-panel space-y-3">
        <div role="group" aria-label="Sample messages" className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="cs-chip" aria-pressed={draft === p.text} onClick={() => setDraft(p.text)}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="cs-label">Message to the health coach</span>
          <textarea
            className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] p-2 text-sm text-[var(--text-primary)]"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`font-mono text-xs ${draft.length > CHARACTER_LIMIT ? 'text-[rgb(var(--error-rgb))]' : 'text-[var(--text-muted)]'}`}>
            {draft.length.toLocaleString('en-US')} / {CHARACTER_LIMIT.toLocaleString('en-US')} · talking to {AGENT_LABEL[locked]}
          </span>
          <button type="button" className="btn-hacker btn-sm inline-flex items-center gap-2" onClick={send}>
            <SendOutlined aria-hidden /> Send
          </button>
        </div>
      </div>

      {current && (
        <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
          <div className="cs-panel space-y-3">
            <p className="cs-label">Chat</p>
            {thread.map((s) => {
              const live = s === current
              const t = s.turn
              const shown = live ? effectiveTick : Infinity
              const replyWords = t.kind === 'processed' && t.reply ? t.reply.split(' ') : []
              const visibleWords = Math.max(0, Math.min(replyWords.length, shown - STAGE.reply + 1))
              const entities = t.kind === 'processed' ? t.entities.filter((e) => !s.removed.includes(e.id)) : []
              const done = shown >= (t.kind === 'rejected' ? STAGE.guard : STAGE.reply + replyWords.length)
              return (
                <div key={s.id} className="space-y-2">
                  <p className="ml-auto w-fit max-w-[90%] rounded-lg bg-[rgb(var(--accent-rgb)/0.15)] px-3 py-2 text-sm text-[var(--text-primary)]">
                    <UserOutlined aria-hidden className="mr-1" />
                    {s.text.length > 140 ? `${s.text.slice(0, 140)}…` : s.text}
                  </p>
                  {t.kind === 'rejected' ? (
                    <ul>
                      <StatusLine level="error">{t.reason}</StatusLine>
                    </ul>
                  ) : t.flagged ? (
                    shown >= STAGE.moderation && (
                      <ul>
                        <StatusLine level="warn">{CONTENT_POLICY}</StatusLine>
                      </ul>
                    )
                  ) : (
                    visibleWords > 0 && (
                      <div className="max-w-[90%] rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                        <p className="mb-1 font-mono text-[0.7rem] text-[var(--text-muted)]">
                          <RobotOutlined aria-hidden /> {AGENT_LABEL[t.routing.agent]}
                        </p>
                        {replyWords.slice(0, visibleWords).join(' ')}
                      </div>
                    )
                  )}
                  {done && entities.length > 0 && (
                    <ul className="flex flex-wrap gap-2" aria-label="Logged from this message">
                      {entities.map((e) => (
                        <li key={e.id} className="flex items-center gap-2 rounded border border-[var(--border)] py-1 pl-2 pr-1 text-xs">
                          <span className="font-mono text-[var(--text-muted)]">{KIND_LABEL[e.kind]}</span>
                          <span className="text-[var(--text-primary)]">{e.label}</span>
                          <button type="button" className="cs-chip !min-h-6 !px-2 !text-xs" onClick={() => removeEntity(s.id, e)} aria-label={`Remove ${e.label}`}>
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          <div className="cs-panel space-y-3">
            <p className="cs-label">Behind the scenes · this turn</p>
            {turn?.kind === 'rejected' ? (
              <ol className="space-y-2">
                <Lane title="Input check" agent="length check" state="done">
                  Rejected. No model is called.
                </Lane>
              </ol>
            ) : (
              turn && (
                <>
                  <ol className="space-y-2">
                    <Lane title="Input check" agent="length check" state={stateAt(effectiveTick, 0, STAGE.guard)}>
                      Under {CHARACTER_LIMIT.toLocaleString('en-US')} characters.
                    </Lane>
                  </ol>
                  <p className="font-mono text-[0.7rem] text-[var(--text-muted)]">All three run at once</p>
                  <ol className="space-y-2 border-l-2 border-[var(--border)] pl-3">
                    <Lane title="Conversation" agent={AGENT_LABEL[turn.routing.agent]} state={stateAt(effectiveTick, STAGE.fanOut, STAGE.reply + words.length)}>
                      {turn.routing.transferred ? `Handed off to ${AGENT_LABEL[turn.routing.agent]}; it stays there next turn.` : `Stayed with ${AGENT_LABEL[turn.routing.agent]}.`}
                      {turn.routing.tool && (
                        <>
                          {' '}
                          Used the <span className="text-[var(--text-primary)]">{turn.routing.tool}</span> tool.
                        </>
                      )}
                    </Lane>
                    <Lane title="Health data logging" agent="runs silently" state={stateAt(effectiveTick, STAGE.fanOut, STAGE.extraction)}>
                      {effectiveTick < STAGE.extraction
                        ? 'Looking for things to log…'
                        : turn.entities.length
                          ? [...new Set(turn.entities.map((e) => EXTRACTION_TOOL[e.kind]))].map((tool) => (
                              <span key={tool} className="mr-2 rounded border border-[var(--border)] px-1.5 font-mono text-xs">
                                {tool}
                              </span>
                            ))
                          : 'Nothing to log.'}
                    </Lane>
                    <Lane
                      title="Risk detection"
                      agent="quick screen → deeper check"
                      state={turn.gate.signal ? stateAt(effectiveTick, STAGE.fanOut, STAGE.acuity) : effectiveTick < STAGE.gate ? stateAt(effectiveTick, STAGE.fanOut, STAGE.gate) : 'done'}
                    >
                      {effectiveTick < STAGE.gate
                        ? 'Screening for a health concern…'
                        : !turn.gate.signal
                          ? 'Nothing concerning, so the deeper check never runs.'
                          : effectiveTick < STAGE.acuity
                            ? `Possible ${turn.gate.type} concern. Running deeper check…`
                            : `Possible ${turn.gate.type} concern. Urgency ${turn.acuity}/10${turn.acuity === 10 ? ': escalate immediately' : (turn.acuity ?? 0) >= 8 ? ': care team alerted' : ''}.`}
                    </Lane>
                  </ol>
                  <ol className="space-y-2">
                    <Lane title="Safety check" agent="runs alongside the reply" state={stateAt(effectiveTick, STAGE.fanOut, STAGE.moderation)}>
                      {effectiveTick < STAGE.moderation ? 'Checking…' : turn.flagged ? 'Flagged: reply stopped, support resources sent.' : 'Passed: reply released.'}
                    </Lane>
                  </ol>
                  <div>
                    <p className="font-mono text-[0.7rem] text-[var(--text-muted)]">Updates sent to the app</p>
                    <ol className="mt-1 flex flex-wrap gap-1">
                      {turn.events.map((ev, i) => (
                        <li
                          key={ev + i}
                          className={`rounded border border-[var(--border)] px-1.5 font-mono text-[0.7rem] ${effectiveTick >= STAGE.moderation + i ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-40'}`}
                        >
                          {ev}
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
