export type Language = 'english' | 'spanish'
export type Lob = 'MA' | 'COM' | 'MCAID'
export type AgentStatus = 'available' | 'oncall' | 'postcall' | 'away'

export const LOB_LABEL: Record<Lob, string> = { MA: 'Medicare Advantage', COM: 'Commercial', MCAID: 'Medicaid' }

export interface Agent {
  id: string
  name: string
  languages: Language[]
  /** A care manager can cover several plans. */
  lobs: Lob[]
  /** Some care managers only place calls; inbound calls never ring them. */
  inboundEligible: boolean
  status: AgentStatus
}

/** `null` when the caller skipped the menu or the plan isn't on file. */
export interface IncomingCall {
  language: Language | null
  lob: Lob | null
}

export type Route = { kind: 'ring'; agents: Agent[] } | { kind: 'voicemail'; reason: string }

/** The caller hears the menu in both languages until they choose, then only theirs. */
export const PROMPTS: Record<Language, { connecting: string; voicemail: string }> = {
  english: {
    connecting: 'Thanks for calling. Connecting you with a care specialist now.',
    voicemail: 'All of our specialists are helping other members. Please leave a message and we’ll call you back.',
  },
  spanish: {
    connecting: 'Gracias por llamar. Lo estamos comunicando con un especialista.',
    voicemail: 'Todos nuestros especialistas están ayudando a otros miembros. Deje un mensaje y le devolveremos la llamada.',
  },
}
export const MENU = 'For English, press 1. Para español, oprima 2.'

const LANG_NAME: Record<Language, string> = { english: 'English', spanish: 'Spanish' }

/**
 * A care manager qualifies when they're available, take inbound calls, speak the member's language
 * (any, if none was chosen) and covers their plan. No plan on file means voicemail. Every match rings.
 */
export function routeCall(agents: Agent[], call: IncomingCall): Route {
  if (call.lob === null) return { kind: 'voicemail', reason: 'No plan on file for this caller, so the call goes straight to voicemail.' }
  const { lob, language } = call
  const matches = agents.filter(
    (a) => a.status === 'available' && a.inboundEligible && a.lobs.includes(lob) && (language === null || a.languages.includes(language)),
  )
  if (matches.length) return { kind: 'ring', agents: matches }
  return {
    kind: 'voicemail',
    reason: `No available care manager ${language ? `speaks ${LANG_NAME[language]} and ` : ''}covers ${lob} right now.`,
  }
}

export function setStatus(agents: Agent[], id: string, status: AgentStatus): Agent[] {
  return agents.map((a) => (a.id === id ? { ...a, status } : a))
}

export type Role = 'member' | 'agent' | 'supervisor' | 'interpreter'

export interface Participant {
  id: string
  role: Role
  name: string
  /** A coaching supervisor is heard by the agent only, never the member. */
  coaching?: boolean
}

export interface Conference {
  call: IncomingCall
  participants: Participant[]
  /** The agent handing off during a warm transfer, until they drop. */
  transferringFrom?: string
}

const MEMBER: Participant = { id: 'member', role: 'member', name: 'Member' }

export function startConference(call: IncomingCall, agent: Agent): Conference {
  return { call, participants: [MEMBER, { id: agent.id, role: 'agent', name: agent.name }] }
}

export function addCoach(conf: Conference, name: string): Conference {
  if (conf.participants.some((p) => p.role === 'supervisor')) return conf
  return { ...conf, participants: [...conf.participants, { id: 'supervisor', role: 'supervisor', name, coaching: true }] }
}

/** Dials the interpreter line into the call, for languages the team doesn't cover. */
export function addInterpreter(conf: Conference): Conference {
  if (conf.participants.some((p) => p.role === 'interpreter')) return conf
  return { ...conf, participants: [...conf.participants, { id: 'interpreter', role: 'interpreter', name: 'Interpreter line' }] }
}

/** Warm transfer: the new agent joins while the first stays on to introduce the member. */
export function startTransfer(conf: Conference, to: Agent): Conference {
  const current = conf.participants.find((p) => p.role === 'agent')
  if (!current || conf.transferringFrom || current.id === to.id) return conf
  return { ...conf, transferringFrom: current.id, participants: [...conf.participants, { id: to.id, role: 'agent', name: to.name }] }
}

export function completeTransfer(conf: Conference): { conf: Conference; released?: string } {
  const from = conf.transferringFrom
  if (!from) return { conf }
  return { conf: { ...conf, transferringFrom: undefined, participants: conf.participants.filter((p) => p.id !== from) }, released: from }
}

/** Who a listener can hear: everyone else, except that coaching is inaudible to the member. */
export function audibleTo(conf: Conference, listenerId: string): Participant[] {
  const listener = conf.participants.find((p) => p.id === listenerId)
  return conf.participants.filter((p) => p.id !== listenerId && !(p.coaching && listener?.role === 'member'))
}

/** Any free care manager can take a transfer; the agent decides who's right for the member. */
export function transferTargets(agents: Agent[], conf: Conference): Agent[] {
  const onCall = new Set(conf.participants.map((p) => p.id))
  return agents.filter((a) => a.status === 'available' && !onCall.has(a.id))
}
