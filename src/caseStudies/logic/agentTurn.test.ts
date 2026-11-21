import { describe, expect, it } from 'vitest'
import { CHARACTER_LIMIT, acuity, alertGate, extractEntities, moderate, route, runTurn } from './agentTurn'

const labels = (text: string) => extractEntities(text).map((e) => `${e.kind}:${e.label}`)

describe('entity extraction', () => {
  it('pulls several kinds out of one message', () => {
    expect(labels('Had oatmeal and coffee, weighed in at 182 lbs. Feeling stressed about work.')).toEqual([
      'measurement:Weight · 182 lb',
      'food:Oatmeal',
      'food:Coffee',
      'mood:Stressed',
    ])
  })

  it('reads height', () => {
    expect(labels('I am 5 ft 9')).toEqual(['measurement:Height · 5 ft 9 in'])
  })

  it('skips hypothetical sentences but keeps real ones', () => {
    expect(labels('I might get pizza later. Had eggs this morning.')).toEqual(['food:Eggs'])
  })

  it('never extracts blood pressure as a body measurement', () => {
    expect(labels('My blood pressure was 185/125')).toEqual([])
  })

  it('does not match food words inside other words', () => {
    expect(labels('I ate bricecake')).toEqual([])
  })

  it('labels chest pain once, not as a generic symptom too', () => {
    expect(labels('I have chest pain')).toEqual(['symptom:Chest pain'])
  })
})

describe('alert detection', () => {
  it('stops at the gate when there is no clinical signal', () => {
    const gate = alertGate('Feeling stressed about work')
    expect(gate.signal).toBe(false)
    expect(acuity('Feeling stressed about work', gate)).toBeNull()
  })

  it.each([
    ['I have a headache', 'symptom', 2],
    ['I felt dizzy since lunch', 'symptom', 4],
    ['Blood pressure 130/85 today', 'vital', 4],
    ['Blood pressure 185/125 today', 'vital', 8],
    ['I have chest pain and can’t breathe', 'symptom', 9],
    ["I don't want to live anymore", 'behavioral', 10],
  ])('%s → %s, acuity %i', (text, type, score) => {
    const gate = alertGate(text)
    expect(gate.type).toBe(type)
    expect(acuity(text, gate)).toBe(score)
  })
})

describe('moderation', () => {
  it('flags self-harm language and nothing else here', () => {
    expect(moderate('I want to hurt myself').flagged).toBe(true)
    expect(moderate('This workout hurt my knees').flagged).toBe(false)
  })
})

describe('routing', () => {
  it('transfers to the goals agent on a goal', () => {
    expect(route('I want to set a goal to walk more', 'coach')).toEqual({ agent: 'goals', transferred: true, tool: null })
  })

  it('stays with the last agent when the message does not say otherwise', () => {
    expect(route('Had eggs today', 'goals')).toEqual({ agent: 'goals', transferred: false, tool: null })
  })

  it('reads curly apostrophes the same as straight ones', () => {
    expect(alertGate('I can’t breathe').type).toBe('symptom')
    expect(moderate('I don’t want to be here').flagged).toBe(true)
  })

  it('hands plan requests to the create-plan tool', () => {
    expect(route('Can you make me a plan to sleep better?', 'coach').tool).toBe('create a plan')
    expect(route('Change my plan to mornings', 'goals')).toEqual({ agent: 'coach', transferred: true, tool: 'edit the plan' })
  })
})

describe('a full turn', () => {
  it('rejects oversize input before any agent runs', () => {
    expect(runTurn('a'.repeat(CHARACTER_LIMIT + 1), 'coach').kind).toBe('rejected')
    expect(runTurn('a'.repeat(CHARACTER_LIMIT), 'coach').kind).toBe('processed')
  })

  it('cancels the reply when moderation flags the message, while the alert still fires', () => {
    const turn = runTurn("Some days I don't want to live anymore", 'coach')
    if (turn.kind !== 'processed') throw new Error('expected processed')
    expect(turn.reply).toBeNull()
    expect(turn.acuity).toBe(10)
    expect(turn.events).toEqual(['reply started', 'message flagged', 'support message'])
  })

  it('streams the reply and then the extracted entities', () => {
    const turn = runTurn('Had oatmeal', 'coach')
    if (turn.kind !== 'processed') throw new Error('expected processed')
    expect(turn.events[turn.events.length - 1]).toBe('logged data')
    expect(turn.reply).toMatch(/logged that/)
  })
})
