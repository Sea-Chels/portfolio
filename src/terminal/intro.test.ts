import { describe, expect, it } from 'vitest'
import { CONTENT_DELAY_MS, GREETING, NAME_LINE, TITLE, typedEnd } from './intro'

describe('terminal intro timing', () => {
  it('types each line after the one before has finished', () => {
    expect(NAME_LINE.startDelay).toBeGreaterThan(typedEnd(GREETING))
    expect(TITLE.startDelay).toBeGreaterThan(typedEnd(NAME_LINE))
    expect(CONTENT_DELAY_MS).toBeGreaterThan(typedEnd(TITLE))
  })
  it('keeps the original choreography', () => {
    expect([GREETING.startDelay, NAME_LINE.startDelay, TITLE.startDelay, CONTENT_DELAY_MS]).toEqual([300, 1500, 3200, 4500])
  })
})
