import { describe, expect, it } from 'vitest'
import { caretX } from './caret'

const base = { textWidth: 40, scrollLeft: 0, fieldWidth: 200, selectionCollapsed: true, focused: true }

describe('caretX', () => {
  it('sits after the measured text', () => {
    expect(caretX(base)).toBe(40)
  })
  it('follows the field when it scrolls', () => {
    expect(caretX({ ...base, textWidth: 260, scrollLeft: 70 })).toBe(190)
  })
  it('stays inside the field', () => {
    expect(caretX({ ...base, textWidth: 500 })).toBe(200)
    expect(caretX({ ...base, scrollLeft: 90 })).toBe(0)
    expect(caretX({ ...base, fieldWidth: -5 })).toBe(0)
  })
  it('hides when unfocused or when a range is selected', () => {
    expect(caretX({ ...base, focused: false })).toBeNull()
    expect(caretX({ ...base, selectionCollapsed: false })).toBeNull()
  })
})
