import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(SplitText, ScrambleTextPlugin)

interface ScrambledTextProps {
  children: React.ReactNode
  /** Radius (px) around the cursor that triggers a scramble. */
  radius?: number
  /** Max duration (s) a character takes to resolve back to its original glyph. */
  duration?: number
  /** Scramble cycle speed passed to GSAP's scrambleText plugin. */
  speed?: number
  /** Glyph pool used while a character is unresolved. */
  scrambleChars?: string
  className?: string
  style?: React.CSSProperties
}

function ScrambledText({
  children,
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style,
}: ScrambledTextProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Splits text in every descendant — not just <p> — so the wrapper can hold
    // paragraphs, headings, or any combination. Keep chars as natural inline
    // spans (no inline-block) so they don't inflate the line-height — the
    // scramble plugin only mutates textContent, so transforms aren't needed.
    const split = SplitText.create(root, {
      type: 'chars',
    })

    split.chars.forEach((el) => {
      const c = el as HTMLElement
      gsap.set(c, { attr: { 'data-content': c.innerHTML } })
    })

    const handleMove = (e: PointerEvent) => {
      split.chars.forEach((el) => {
        const c = el as HTMLElement
        const { left, top, width, height } = c.getBoundingClientRect()
        const dx = e.clientX - (left + width / 2)
        const dy = e.clientY - (top + height / 2)
        const dist = Math.hypot(dx, dy)

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || '',
              chars: scrambleChars,
              speed,
            },
            ease: 'none',
          })
        }
      })
    }

    root.addEventListener('pointermove', handleMove)
    return () => {
      root.removeEventListener('pointermove', handleMove)
      split.revert()
    }
  }, [radius, duration, speed, scrambleChars])

  return (
    <div ref={rootRef} className={className} style={style}>
      {children}
    </div>
  )
}

export default ScrambledText
