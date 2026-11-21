import { PhoneOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAnnounce } from '../../a11y/announce'
import {
  LOB_LABEL,
  MENU,
  PROMPTS,
  addCoach,
  addInterpreter,
  audibleTo,
  completeTransfer,
  routeCall,
  setStatus,
  startConference,
  startTransfer,
  transferTargets,
  type Agent,
  type AgentStatus,
  type Conference,
  type IncomingCall,
  type Language,
  type Lob,
} from '../logic/callCenter'
import { StatusLine, type StatusLevel } from './StatusLine'

const SEED: Agent[] = [
  { id: 'maria', name: 'Maria L.', languages: ['english', 'spanish'], lobs: ['MA', 'MCAID'], inboundEligible: true, status: 'available' },
  { id: 'james', name: 'James C.', languages: ['english'], lobs: ['MA', 'COM'], inboundEligible: true, status: 'available' },
  { id: 'luis', name: 'Luis R.', languages: ['spanish'], lobs: ['MA'], inboundEligible: true, status: 'available' },
  { id: 'ana', name: 'Ana T.', languages: ['spanish', 'english'], lobs: ['MCAID'], inboundEligible: true, status: 'away' },
  { id: 'priya', name: 'Priya S.', languages: ['english'], lobs: ['COM'], inboundEligible: false, status: 'available' },
]

const LANGS: { value: Language | null; label: string }[] = [
  { value: 'english', label: '1 · English' },
  { value: 'spanish', label: '2 · Español' },
  { value: null, label: 'No choice' },
]
const LOBS: { value: Lob | null; label: string }[] = [
  { value: 'MA', label: 'MA' },
  { value: 'COM', label: 'COM' },
  { value: 'MCAID', label: 'MCAID' },
  { value: null, label: 'Not on file' },
]
const STATUS_LABEL: Record<AgentStatus, string> = { available: 'Available', oncall: 'On call', postcall: 'Wrap-up', away: 'Away' }
const STATUS_TONE: Partial<Record<AgentStatus, StatusLevel>> = { available: 'ok', postcall: 'warn' }
const ROLE_LABEL = { member: 'Member', agent: 'Care manager', supervisor: 'Supervisor', interpreter: 'Interpreter' }
const langCode = (l: Language) => (l === 'spanish' ? 'es' : 'en')

interface Outcome {
  level: StatusLevel
  text: string
  prompt?: { text: string; language: Language }
}

export default function CallCenterDemo() {
  const [agents, setAgents] = useState(SEED)
  const [language, setLanguage] = useState<Language | null>('spanish')
  const [lob, setLob] = useState<Lob | null>('MA')
  const [ringing, setRinging] = useState<{ call: IncomingCall; agents: Agent[] } | null>(null)
  const [conf, setConf] = useState<Conference | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [voicemails, setVoicemails] = useState<{ id: number; language: Language | null; lob: Lob | null }[]>([])
  const announce = useAnnounce()
  const promptLang: Language = language ?? 'english'

  const placeCall = () => {
    const call = { language, lob }
    const route = routeCall(agents, call)
    if (route.kind === 'ring') {
      setRinging({ call, agents: route.agents })
      const names = route.agents.map((a) => a.name).join(', ')
      const text = `Ringing ${route.agents.length} matching care manager${route.agents.length > 1 ? 's' : ''}: ${names}${names.endsWith('.') ? '' : '.'}`
      setOutcome({ level: 'ok', text, prompt: { text: PROMPTS[promptLang].connecting, language: promptLang } })
      announce(text)
    } else {
      setVoicemails((v) => [{ id: Date.now(), language, lob }, ...v].slice(0, 4))
      setOutcome({ level: 'warn', text: `${route.reason} Saved as a missed call for callback.`, prompt: { text: PROMPTS[promptLang].voicemail, language: promptLang } })
      announce(route.reason)
    }
  }

  const answer = (a: Agent) => {
    if (!ringing) return
    setAgents(setStatus(agents, a.id, 'oncall'))
    setConf(startConference(ringing.call, a))
    setRinging(null)
    setOutcome({ level: 'ok', text: `${a.name} picked up. The call is now a live conference.` })
    announce(`${a.name} answered`)
  }

  const release = (ids: string[]) => ids.reduce((acc, id) => setStatus(acc, id, 'postcall'), agents)

  const hangUp = () => {
    if (!conf) return
    setAgents(release(conf.participants.filter((p) => p.role === 'agent').map((p) => p.id)))
    setConf(null)
    announce('Call ended. Care manager moved to wrap-up.')
  }

  const transfer = (to: Agent) => {
    if (!conf) return
    setConf(startTransfer(conf, to))
    setAgents(setStatus(agents, to.id, 'oncall'))
    announce(`${to.name} joined. Both care managers are on the line for the handoff.`)
  }

  const finishTransfer = () => {
    if (!conf) return
    const { conf: next, released } = completeTransfer(conf)
    setConf(next)
    if (released) setAgents(release([released]))
    announce('Transfer complete. The first care manager dropped off.')
  }

  const toggleStatus = (a: Agent) => {
    const next: AgentStatus = a.status === 'available' ? 'away' : 'available'
    setAgents(setStatus(agents, a.id, next))
    announce(`${a.name} is now ${STATUS_LABEL[next].toLowerCase()}`)
  }

  const busy = ringing !== null || conf !== null
  const ringingIds = new Set(ringing?.agents.map((a) => a.id))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1.4fr]">
        <div className="cs-panel flex flex-col gap-3">
          <p className="font-semibold text-[var(--text-primary)]">Incoming call</p>
          <p className="cs-code !py-2 text-xs">{MENU}</p>
          <div role="group" aria-label="Caller’s language" className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button key={l.label} type="button" className="cs-chip" aria-pressed={language === l.value} onClick={() => setLanguage(l.value)}>
                {l.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Caller’s plan" className="flex flex-wrap gap-2">
            {LOBS.map((l) => (
              <button key={l.label} type="button" className="cs-chip" aria-pressed={lob === l.value} onClick={() => setLob(l.value)} title={l.value ? LOB_LABEL[l.value] : undefined}>
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn-hacker btn-sm inline-flex items-center justify-center gap-2" onClick={placeCall} disabled={busy}>
            <PhoneOutlined aria-hidden /> {busy ? 'Line busy' : 'Place call'}
          </button>
          {outcome && (
            <>
              {outcome.prompt && (
                <p className="text-sm italic text-[var(--text-secondary)]" lang={langCode(outcome.prompt.language)}>
                  “{outcome.prompt.text}”
                </p>
              )}
              <ul>
                <StatusLine level={outcome.level}>{outcome.text}</StatusLine>
              </ul>
            </>
          )}
        </div>

        <div className="cs-panel">
          <p className="mb-2 font-semibold text-[var(--text-primary)]">Care managers</p>
          <table className="w-full text-sm">
            <caption className="sr-only">Care managers, their languages, plans and status</caption>
            <thead>
              <tr className="cs-label text-left">
                <th className="py-1 font-normal">Name</th>
                <th className="py-1 font-normal">Lang</th>
                <th className="py-1 font-normal">Plans</th>
                <th className="py-1 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => {
                const tone = STATUS_TONE[a.status]
                return (
                  <tr key={a.id} className={`border-t border-[var(--border)] ${ringingIds.has(a.id) ? 'bg-[rgb(var(--accent-rgb)/0.08)]' : ''}`}>
                    <td className="py-1.5 text-[var(--text-primary)]">
                      {a.name}
                      {!a.inboundEligible && <span className="block text-[0.7rem] text-[var(--text-muted)]">outbound only</span>}
                    </td>
                    <td className="py-1.5 font-mono text-xs text-[var(--text-secondary)]">{a.languages.map((l) => langCode(l).toUpperCase()).join(' ')}</td>
                    <td className="py-1.5 font-mono text-xs text-[var(--text-secondary)]">{a.lobs.join(' ')}</td>
                    <td className="py-1.5">
                      {ringingIds.has(a.id) ? (
                        <button type="button" className="cs-chip !min-h-6 !px-2 !text-xs" aria-pressed onClick={() => answer(a)}>
                          Ringing · answer
                        </button>
                      ) : a.status === 'oncall' ? (
                        <span className="font-mono text-xs text-[rgb(var(--error-rgb))]">{STATUS_LABEL.oncall}</span>
                      ) : (
                        <button
                          type="button"
                          className="cs-chip !min-h-6 !px-2 !text-xs"
                          style={tone ? { color: `rgb(var(--${tone}-rgb))` } : undefined}
                          onClick={() => toggleStatus(a)}
                          disabled={ringing !== null}
                          aria-label={`${a.name}: ${STATUS_LABEL[a.status]}. ${a.status === 'available' ? 'Set away' : 'Set available'}`}
                        >
                          {a.status === 'postcall' ? 'Wrap-up · finish' : STATUS_LABEL[a.status]}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {conf && (
        <div className="cs-panel space-y-3">
          <p className="font-semibold text-[var(--text-primary)]">Live conference</p>
          <ul className="flex flex-wrap gap-2">
            {conf.participants.map((p) => (
              <li key={p.id} className="rounded border border-[var(--border)] px-2 py-1 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--text-primary)]">{p.name}</span>
                {p.name !== ROLE_LABEL[p.role] && ` · ${ROLE_LABEL[p.role]}`}
                {p.coaching && <span className="text-accent"> · coaching</span>}
                {p.id === conf.transferringFrom && <span className="text-[rgb(var(--warn-rgb))]"> · handing off</span>}
              </li>
            ))}
          </ul>
          <p className="text-sm text-[var(--text-muted)]">Member hears: {audibleTo(conf, 'member').map((p) => p.name).join(', ')}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="cs-chip" onClick={() => setConf(addCoach(conf, 'Supervisor'))} disabled={conf.participants.some((p) => p.role === 'supervisor')}>
              Supervisor: coach
            </button>
            <button type="button" className="cs-chip" onClick={() => setConf(addInterpreter(conf))} disabled={conf.participants.some((p) => p.role === 'interpreter')}>
              Add interpreter line
            </button>
            {conf.transferringFrom ? (
              <button type="button" className="cs-chip" onClick={finishTransfer}>
                Complete transfer
              </button>
            ) : (
              transferTargets(agents, conf).map((t) => (
                <button key={t.id} type="button" className="cs-chip" onClick={() => transfer(t)}>
                  Warm transfer → {t.name}
                </button>
              ))
            )}
            <button type="button" className="cs-chip" onClick={hangUp}>
              Hang up
            </button>
          </div>
        </div>
      )}

      {voicemails.length > 0 && (
        <div className="cs-panel">
          <p className="cs-label mb-2">Voicemails &amp; missed calls</p>
          <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
            {voicemails.map((v) => (
              <li key={v.id}>
                {v.lob ?? 'Unknown plan'} member ·{' '}
                <span className="text-[var(--text-primary)]">{v.language === 'spanish' ? 'Spanish' : v.language === 'english' ? 'English' : 'No language chosen'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
