import { useEffect, useState } from 'react'
import type { TypedLine } from './intro'

export function useTypingEffect({ text, speed, startDelay }: TypedLine, instant: boolean) {
  const [count, setCount] = useState(instant ? text.length : 0)

  useEffect(() => {
    if (instant) {
      setCount(text.length)
      return
    }
    setCount(0)
    let typed = 0
    let interval: number | undefined
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        typed += 1
        setCount(typed)
        if (typed >= text.length) window.clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [text, speed, startDelay, instant])

  return { displayedText: text.slice(0, count), isComplete: count >= text.length }
}
