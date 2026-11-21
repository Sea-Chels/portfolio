import { describe, expect, it } from 'vitest'
import {
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
} from './callCenter'

const agents: Agent[] = [
  { id: 'maria', name: 'Maria', languages: ['english', 'spanish'], lobs: ['MA', 'MCAID'], inboundEligible: true, status: 'available' },
  { id: 'james', name: 'James', languages: ['english'], lobs: ['MA', 'COM'], inboundEligible: true, status: 'available' },
  { id: 'luis', name: 'Luis', languages: ['spanish'], lobs: ['MA'], inboundEligible: true, status: 'available' },
  { id: 'ana', name: 'Ana', languages: ['spanish', 'english'], lobs: ['MCAID'], inboundEligible: true, status: 'oncall' },
  { id: 'priya', name: 'Priya', languages: ['english'], lobs: ['COM'], inboundEligible: false, status: 'available' },
]
const ringing = (r: ReturnType<typeof routeCall>) => (r.kind === 'ring' ? r.agents.map((a) => a.id) : r.reason)

describe('call routing', () => {
  it('rings every available care manager who speaks the language and covers the plan', () => {
    expect(ringing(routeCall(agents, { language: 'spanish', lob: 'MA' }))).toEqual(['maria', 'luis'])
  })

  it('matches any of a care manager’s plans', () => {
    expect(ringing(routeCall(agents, { language: 'english', lob: 'MCAID' }))).toEqual(['maria'])
  })

  it('skips the language filter when the caller didn’t choose one', () => {
    expect(ringing(routeCall(agents, { language: null, lob: 'MA' }))).toEqual(['maria', 'james', 'luis'])
  })

  it('never rings someone who isn’t inbound-eligible', () => {
    expect(ringing(routeCall(agents, { language: 'english', lob: 'COM' }))).toEqual(['james'])
  })

  it('sends calls with no plan on file to voicemail', () => {
    expect(ringing(routeCall(agents, { language: 'english', lob: null }))).toMatch(/No plan on file/)
  })

  it('goes to voicemail, saying why, when nobody qualified is free', () => {
    const busy = setStatus(agents, 'maria', 'oncall')
    expect(ringing(routeCall(busy, { language: 'spanish', lob: 'MCAID' }))).toBe('No available care manager speaks Spanish and covers MCAID right now.')
  })
})

describe('conference', () => {
  const conf = startConference({ language: 'spanish', lob: 'MA' }, agents[0])

  it('keeps a coaching supervisor inaudible to the member but audible to the agent', () => {
    const coached = addCoach(conf, 'Supervisor')
    expect(audibleTo(coached, 'member').map((p) => p.id)).toEqual(['maria'])
    expect(audibleTo(coached, 'maria').map((p) => p.id)).toEqual(['member', 'supervisor'])
  })

  it('lets everyone hear the interpreter', () => {
    const withInterpreter = addInterpreter(conf)
    expect(audibleTo(withInterpreter, 'member').map((p) => p.id)).toEqual(['maria', 'interpreter'])
    expect(addInterpreter(withInterpreter)).toBe(withInterpreter)
  })

  it('warm-transfers with both agents on the line, then releases the first', () => {
    const mid = startTransfer(conf, agents[2])
    expect(mid.participants.map((p) => p.id)).toEqual(['member', 'maria', 'luis'])
    const { conf: done, released } = completeTransfer(mid)
    expect(released).toBe('maria')
    expect(done.participants.map((p) => p.id)).toEqual(['member', 'luis'])
  })

  it('offers transfers to any free care manager not already on the call', () => {
    expect(transferTargets(agents, conf).map((a) => a.id)).toEqual(['james', 'luis', 'priya'])
  })

  it('ignores a second transfer or a second coach', () => {
    const mid = startTransfer(conf, agents[2])
    expect(startTransfer(mid, agents[1])).toBe(mid)
    const coached = addCoach(conf, 'S')
    expect(addCoach(coached, 'S')).toBe(coached)
  })
})
