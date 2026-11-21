/**
 * A rule-based stand-in for one chat turn through ClosedLoop's Google ADK agent graph.
 * The agents, their order and their gates mirror production; keyword tables stand in for the LLM calls.
 */

export const CHARACTER_LIMIT = 2000

export type EntityKind = 'measurement' | 'food' | 'mood' | 'symptom'
export interface Entity {
  id: string
  kind: EntityKind
  label: string
}

export const EXTRACTION_TOOL: Record<EntityKind, string> = {
  measurement: 'measurements',
  food: 'food',
  mood: 'mood',
  symptom: 'symptoms',
}

export type AgentName = 'coach' | 'goals'
export const AGENT_LABEL: Record<AgentName, string> = { coach: 'Health coach', goals: 'Goals coach' }

export type SignalType = 'behavioral' | 'vital' | 'symptom'

type Rule = { re: RegExp; label: (m: RegExpMatchArray) => string }
const word = (w: string) => new RegExp(`\\b${w}\\b`, 'i')

/** Weight and height only; other body measurements are deliberately not logged. */
const MEASUREMENTS: Rule[] = [
  { re: /\b(\d{2,3}(?:\.\d)?)\s*(?:lbs?|pounds)\b/i, label: (m) => `Weight · ${m[1]} lb` },
  { re: /\b(\d{2,3}(?:\.\d)?)\s*kg\b/i, label: (m) => `Weight · ${m[1]} kg` },
  { re: /\b([4-7])\s*(?:ft|feet|foot|')\s*(\d{1,2})?/i, label: (m) => `Height · ${m[1]} ft${m[2] ? ` ${m[2]} in` : ''}` },
]
const FOODS = ['oatmeal', 'eggs', 'salad', 'coffee', 'pizza', 'banana', 'chicken', 'rice', 'toast', 'yogurt', 'sandwich']
const MOODS: [RegExp, string][] = [
  [/\bstress(ed|ful)?\b/i, 'Stressed'],
  [/\banxious\b|\banxiety\b/i, 'Anxious'],
  [/\boverwhelmed\b/i, 'Overwhelmed'],
  [/\bhappy\b/i, 'Happy'],
  [/\bcalm\b/i, 'Calm'],
  [/\bsad\b/i, 'Sad'],
]
/** Ordered: the first match per pattern wins, so "chest pain" never also reads as generic pain. */
const SYMPTOMS: [RegExp, string][] = [
  [/\bchest pain\b/i, 'Chest pain'],
  [/\bcan[’']?t breathe\b|\bshort(ness)? of breath\b/i, 'Shortness of breath'],
  [/\bheadache\b/i, 'Headache'],
  [/\bnause(a|ous)\b/i, 'Nausea'],
  [/\bdizz(y|iness)\b/i, 'Dizziness'],
  [/\bexhausted\b|\bfatigue(d)?\b/i, 'Fatigue'],
]
/** Extraction captures what happened, not what might. */
const HYPOTHETICAL = /\b(will|going to|gonna|might|maybe|plan(ning)? to|tomorrow|later)\b/i

export const BEHAVIORAL_RISK = /\b(kill myself|end my life|hurt myself|suicid\w*|don[’']?t want to (live|be here))\b/i
const BLOOD_PRESSURE = /\b(\d{2,3})\s*\/\s*(\d{2,3})\b/

export function sentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** The silent logging agent: each kind is a separate tool it can call zero or more times. */
export function extractEntities(text: string): Entity[] {
  const found: Entity[] = []
  const add = (kind: EntityKind, label: string) => {
    if (!found.some((e) => e.kind === kind && e.label === label)) found.push({ id: `${kind}:${label}`, kind, label })
  }
  for (const s of sentences(text)) {
    if (HYPOTHETICAL.test(s)) continue
    for (const r of MEASUREMENTS) {
      const m = s.match(r.re)
      if (m) add('measurement', r.label(m))
    }
    for (const f of FOODS) if (word(f).test(s)) add('food', f[0].toUpperCase() + f.slice(1))
    for (const [re, label] of MOODS) if (re.test(s)) add('mood', label)
    for (const [re, label] of SYMPTOMS) if (re.test(s)) add('symptom', label)
  }
  return found
}

export interface Gate {
  signal: boolean
  type: SignalType | null
  reason: string
}

/** Stage 1 of risk detection: a quick screen decides whether the deeper check runs at all. */
export function alertGate(text: string): Gate {
  if (BEHAVIORAL_RISK.test(text)) return { signal: true, type: 'behavioral', reason: 'Language suggesting risk of self-harm.' }
  if (BLOOD_PRESSURE.test(text) || /\bheart rate\b/i.test(text)) return { signal: true, type: 'vital', reason: 'A reported vital sign.' }
  const symptom = SYMPTOMS.find(([re]) => re.test(text))
  if (symptom) return { signal: true, type: 'symptom', reason: `Reports ${symptom[1].toLowerCase()}.` }
  return { signal: false, type: null, reason: 'No symptom, vital or safety concern.' }
}

/** Stage 2: urgency 1–10. 10 always escalates. */
export function acuity(text: string, gate: Gate): number | null {
  if (!gate.signal) return null
  if (gate.type === 'behavioral') return 10
  if (/\bchest pain\b|\bcan[’']?t breathe\b|\bshort(ness)? of breath\b/i.test(text)) return 9
  const bp = text.match(BLOOD_PRESSURE)
  if (bp) return Number(bp[1]) >= 180 || Number(bp[2]) >= 120 ? 8 : 4
  if (/\bdizz(y|iness)\b|\bnause(a|ous)\b/i.test(text)) return 4
  return 2
}

/** The safety check runs alongside the reply; a flag stops the reply before it reaches the user. */
export function moderate(text: string): { flagged: boolean; category?: string } {
  return BEHAVIORAL_RISK.test(text) ? { flagged: true, category: 'self-harm' } : { flagged: false }
}

export interface Routing {
  agent: AgentName
  transferred: boolean
  tool: string | null
}

/**
 * The coach can hand off to the goals agent, and the handoff sticks,
 * so the next turn starts with whichever agent the user was last talking to.
 */
export function route(text: string, locked: AgentName): Routing {
  let agent = locked
  if (/\bgoals?\b/i.test(text)) agent = 'goals'
  else if (/\b(plan|checklist)\b/i.test(text)) agent = 'coach'
  let tool: string | null = null
  if (agent === 'coach') {
    if (/\b(make|create|build|start)\b.*\bplan\b/i.test(text)) tool = 'create a plan'
    else if (/\b(change|edit|update|swap)\b.*\bplan\b/i.test(text)) tool = 'edit the plan'
    else if (/\bhow do i\b/i.test(text)) tool = 'app guide'
  }
  return { agent, transferred: agent !== locked, tool }
}

export type Turn =
  | { kind: 'rejected'; reason: string; events: string[] }
  | {
      kind: 'processed'
      routing: Routing
      entities: Entity[]
      gate: Gate
      acuity: number | null
      flagged: boolean
      reply: string | null
      events: string[]
    }

const TOOL_REPLY: Record<string, string> = {
  'create a plan': 'I drafted a plan around that. Take a look and tell me what to change.',
  'edit the plan': 'Done. I updated your plan and your checklist will follow it from tomorrow.',
  'app guide': 'You’ll find that under Profile → Health data. Tap any entry to edit it.',
}

function reply(routing: Routing, entities: Entity[], gate: Gate, score: number | null): string {
  const parts: string[] = []
  if (score !== null && score >= 8) parts.push('That can be serious. If it’s severe or getting worse, call 911 now. Your care team has been alerted.')
  else if (gate.type === 'symptom' || gate.type === 'vital') parts.push('Thanks for telling me. I’ll keep an eye on how that changes.')
  if (routing.tool) parts.push(TOOL_REPLY[routing.tool])
  else if (routing.agent === 'goals' && routing.transferred) parts.push('Let’s make that a goal. How often do you want to aim for it each week?')
  if (entities.length) parts.push(`I logged ${entities.length === 1 ? 'that' : 'those'} for you below.`)
  if (!parts.length) parts.push('Got it. What would you like to work on today?')
  return parts.join(' ')
}

export function runTurn(text: string, locked: AgentName): Turn {
  if (text.length > CHARACTER_LIMIT) {
    return { kind: 'rejected', reason: `${text.length.toLocaleString('en-US')} characters is over the ${CHARACTER_LIMIT.toLocaleString('en-US')} limit, so no agent runs.`, events: ['error'] }
  }
  const routing = route(text, locked)
  const entities = extractEntities(text)
  const gate = alertGate(text)
  const score = acuity(text, gate)
  const { flagged } = moderate(text)
  const events = flagged
    ? ['reply started', 'message flagged', 'support message']
    : ['reply started', 'reply text', 'reply finished', ...(entities.length ? ['logged data'] : [])]
  return {
    kind: 'processed',
    routing,
    entities,
    gate,
    acuity: score,
    flagged,
    reply: flagged ? null : reply(routing, entities, gate, score),
    events,
  }
}
