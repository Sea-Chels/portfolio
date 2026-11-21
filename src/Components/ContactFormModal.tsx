import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CloseOutlined } from '@ant-design/icons'
import ContactForm from './ContactForm'
import { AnnounceProvider } from '../a11y/announce'
import { useDialog } from '../a11y/useDialog'

/** Long enough to read the thank-you before the pop-up closes itself. */
const CLOSE_AFTER_SEND_MS = 2000

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
}

function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [sent, setSent] = useState(false)
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })
  useDialog(isOpen, closeRef, onClose)

  useEffect(() => {
    if (!sent) return
    const timer = window.setTimeout(() => {
      setSent(false)
      close.current()
    }, CLOSE_AFTER_SEND_MS)
    return () => window.clearTimeout(timer)
  }, [sent])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-[var(--backdrop)] backdrop-blur-[var(--backdrop-blur)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        data-comic-panel
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 id="contact-dialog-title" className="text-2xl font-bold text-[var(--text-primary)]">
              Get In Touch
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              I'll get back to you as soon as possible
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {/* aria-modal hides the site-wide live region from screen readers, so the form announces inside the dialog. */}
          <AnnounceProvider>
            <ContactForm showCancelButton onCancel={onClose} onSuccess={() => setSent(true)} />
          </AnnounceProvider>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ContactFormModal
