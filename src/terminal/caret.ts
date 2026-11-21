export interface CaretInput {
  textWidth: number
  scrollLeft: number
  fieldWidth: number
  selectionCollapsed: boolean
  focused: boolean
}

/** Where to draw the comic caret, in px from the field's left edge, or null to hide it. */
export function caretX({ textWidth, scrollLeft, fieldWidth, selectionCollapsed, focused }: CaretInput): number | null {
  if (!focused || !selectionCollapsed) return null
  return Math.min(Math.max(textWidth - scrollLeft, 0), Math.max(fieldWidth, 0))
}
