import { useEffect, useState, type RefObject } from 'react'
import { caretX } from './caret'

/** Tracks where a text field's caret is, so a custom-drawn caret can follow it. */
export function useCaretPosition(inputRef: RefObject<HTMLInputElement | null>): number | null {
  const [x, setX] = useState<number | null>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const ctx = document.createElement('canvas').getContext('2d')

    let frame = 0
    const measure = () => {
      frame = 0
      const style = getComputedStyle(input)
      const start = input.selectionStart ?? input.value.length
      let textWidth = 0
      if (ctx) {
        ctx.font = style.font
        ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
        textWidth = ctx.measureText(input.value.slice(0, start)).width
      }
      setX(
        caretX({
          textWidth,
          scrollLeft: input.scrollLeft,
          fieldWidth: input.clientWidth,
          selectionCollapsed: input.selectionStart === input.selectionEnd,
          focused: document.activeElement === input,
        }),
      )
    }

    // Measuring inside the input event itself would set state before React's onChange runs,
    // re-rendering the controlled field with its old value and swallowing the keystroke.
    const update = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    const events = ['input', 'focus', 'blur', 'scroll', 'keyup', 'pointerup'] as const
    events.forEach((e) => input.addEventListener(e, update))
    document.addEventListener('selectionchange', update)
    document.fonts?.addEventListener('loadingdone', update)
    update()
    return () => {
      events.forEach((e) => input.removeEventListener(e, update))
      document.removeEventListener('selectionchange', update)
      document.fonts?.removeEventListener('loadingdone', update)
      cancelAnimationFrame(frame)
    }
  }, [inputRef])

  return x
}
