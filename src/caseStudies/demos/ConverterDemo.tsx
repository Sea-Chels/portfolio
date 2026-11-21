import { CopyOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAnnounce } from '../../a11y/announce'
import { formatMm, inchesToMm, parseInches } from '../logic/units'

const EXAMPLES = ['3 3/8', '7/16"', '1-1/4', '2.125 in']

export default function ConverterDemo() {
  const [text, setText] = useState('3 3/8')
  const announce = useAnnounce()
  const inches = parseInches(text)
  const mm = inches === null ? null : formatMm(inchesToMm(inches))

  const copy = async () => {
    if (!mm) return
    try {
      await navigator.clipboard.writeText(mm.replace(' mm', ''))
      announce(`Copied ${mm}`)
    } catch {
      announce('Copy isn’t available in this browser')
    }
  }

  return (
    <div className="space-y-4">
      <div className="cs-panel grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="block">
          <span className="cs-label">Inches</span>
          <input
            className="cs-select mt-1 font-mono !text-lg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="converter-result"
            spellCheck={false}
          />
        </label>
        <span className="hidden sm:block pb-2 text-accent font-mono" aria-hidden>
          →
        </span>
        <div>
          <span className="cs-label">Millimeters</span>
          <div className="mt-1 flex items-center gap-2">
            <output id="converter-result" className={`font-mono text-2xl ${mm ? 'text-[var(--text-primary)]' : 'text-[rgb(var(--error-rgb))] text-base'}`}>
              {mm ?? 'Try 3, 3.25, 3/8 or 3 3/8'}
            </output>
            {mm && (
              <button type="button" className="cs-chip" onClick={copy} aria-label={`Copy ${mm}`}>
                <CopyOutlined aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="cs-label mr-1">Try</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="cs-chip" aria-pressed={text === ex} onClick={() => setText(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
