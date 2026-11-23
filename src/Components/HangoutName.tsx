import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { NAME_MAX_LENGTH, typeableName } from '@sea-chels/hangout/names'
import { useDisclosure } from '../a11y/useDisclosure'
import { FIELD_CLASS, FIELD_OK, Field } from './Field'

interface HangoutNameProps {
  initial: string
  /** Applies the name and returns it as everyone will see it, censored, or null when it was empty. */
  onSave: (name: string) => string | null
}

/** The + button in the park's corner and the small panel it opens for choosing your name. */
function HangoutName({ initial, onSave }: HangoutNameProps) {
  const { open, toggle, dismiss, root, button, panelId, onBlur } = useDisclosure()
  const [saved, setSaved] = useState(initial)
  const [name, setName] = useState(initial)
  const input = useRef<HTMLInputElement>(null)

  // Each opening starts from the saved name, dropping anything typed and then cancelled.
  useEffect(() => {
    if (!open) return
    setName(saved)
    input.current?.focus()
  }, [open, saved])

  const save = (event: FormEvent) => {
    event.preventDefault()
    setSaved(onSave(name) ?? '')
    dismiss()
  }

  return (
    <div ref={root} className="hangout-name" onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Your name in the park"
        title="Your name in the park"
        onClick={toggle}
        className="overlay-control"
      >
        <PlusOutlined aria-hidden className={`transition-transform ${open ? 'rotate-45' : ''}`} />
      </button>
      <form id={panelId} hidden={!open} onSubmit={save} className="popover-panel hangout-name-panel">
        <Field id="hangout-name" label="Your name in the park">
          <input
            ref={input}
            id="hangout-name"
            value={name}
            onChange={(e) => setName(typeableName(e.target.value))}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="nickname"
            spellCheck={false}
            placeholder="Shown beside your cursor"
            aria-describedby="hangout-name-hint"
            className={`${FIELD_CLASS} ${FIELD_OK}`}
          />
        </Field>
        <p id="hangout-name-hint" className="mt-2 text-sm text-[var(--text-muted)]">
          Up to {NAME_MAX_LENGTH} letters, numbers, spaces and . _ ' -. Everyone here sees it, so rude words become
          asterisks. It's saved in this browser for next time.
        </p>
        <button type="submit" className="btn-ghost btn-sm mt-3">
          Save name
        </button>
      </form>
    </div>
  )
}

export default HangoutName
