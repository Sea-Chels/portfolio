import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { SendOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useAnnounce } from '../a11y/announce'
import { COOLDOWN_MS, EMPTY_FIELDS, cooldownEnd, isComplete, isValidEmail, type ContactFields } from './contactRules'

// Get your free access key from https://web3forms.com/
export const WEB3FORMS_ACCESS_KEY = 'c29a362b-dd97-4d9f-951a-54c64960941e'

const RATE_LIMIT_STORAGE_KEY = 'portfolio-contact-last-sent'
const SEND_TIMEOUT_MS = 15_000

const FIELD_CLASS =
  'w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors'
const FIELD_OK = 'border-[var(--border)] focus:border-accent'
const FIELD_INVALID = 'border-[rgb(var(--error-rgb))] focus:border-[rgb(var(--error-rgb))]'

function readStoredCooldown(): number | null {
  try {
    return cooldownEnd(window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY), Date.now())
  } catch {
    return null
  }
}

function formatCooldownDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-mono text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

interface ContactFormProps {
  onSuccess?: () => void
  showCancelButton?: boolean
  onCancel?: () => void
}

function ContactForm({ onSuccess, showCancelButton = false, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFields>(EMPTY_FIELDS)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(readStoredCooldown)
  const announce = useAnnounce()

  const isRateLimited = cooldownUntil !== null && cooldownUntil > Date.now()
  const emailInvalid = emailTouched && formData.email !== '' && !isValidEmail(formData.email)
  const isFormComplete = isComplete(formData)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const fail = (message: string) => {
    setStatus('error')
    setErrorMessage(message)
    announce(message)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isRateLimited) return
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          ...formData,
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setFormData(EMPTY_FIELDS)
        setEmailTouched(false)
        const now = Date.now()
        try {
          window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, now.toString())
        } catch {
          // localStorage may be unavailable (private mode, quota); the in-memory
          // cooldown still applies for the rest of the session.
        }
        setCooldownUntil(now + COOLDOWN_MS)
        announce('Message sent. Thank you for reaching out.')
        onSuccess?.()
      } else {
        fail(data.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      fail(
        error instanceof DOMException && error.name === 'TimeoutError'
          ? 'The message service didn’t answer. Please try again in a moment.'
          : 'Failed to send message. Please try again.',
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircleOutlined className="text-5xl text-[rgb(var(--ok-rgb))] mb-4" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Message Sent!
        </h3>
        <p className="text-[var(--text-secondary)] mb-4">
          Thank you for reaching out. I'll be in touch soon.
        </p>
        {cooldownUntil && (
          <p className="text-[var(--text-muted)] text-sm font-mono">
            You can send another message after{' '}
            <span className="text-accent">{formatCooldownDate(cooldownUntil)}</span>.
          </p>
        )}
      </div>
    )
  }

  if (isRateLimited && cooldownUntil) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--text-primary)] font-semibold mb-2">
          You've already sent a message recently.
        </p>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          To prevent spam, the contact form is limited to one message per week. You
          can reach out again after{' '}
          <span className="text-accent font-mono">
            {formatCooldownDate(cooldownUntil)}
          </span>
          .
        </p>
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 text-accent hover:underline font-mono text-sm"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="contact-name" label="Name">
        <input
          type="text"
          id="contact-name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={`${FIELD_CLASS} ${FIELD_OK}`}
          placeholder="Your name"
        />
      </Field>

      <Field id="contact-email" label="Email">
        <input
          type="email"
          id="contact-email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={emailInvalid}
          aria-describedby={emailInvalid ? 'contact-email-error' : undefined}
          className={`${FIELD_CLASS} ${emailInvalid ? FIELD_INVALID : FIELD_OK}`}
          placeholder="your@email.com"
        />
        {emailInvalid && (
          <p id="contact-email-error" className="text-[rgb(var(--error-rgb))] text-sm mt-1 font-mono">
            Please enter a valid email address
          </p>
        )}
      </Field>

      <Field id="contact-subject" label="Subject">
        <input
          type="text"
          id="contact-subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          className={`${FIELD_CLASS} ${FIELD_OK}`}
          placeholder="What's this about?"
        />
      </Field>

      <Field id="contact-message" label="Message">
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={`${FIELD_CLASS} ${FIELD_OK} resize-none`}
          placeholder="Tell me about your project..."
        />
      </Field>

      {status === 'error' && (
        <div className="p-3 bg-[rgb(var(--error-rgb)/0.1)] border border-[rgb(var(--error-rgb)/0.3)] rounded-lg text-[rgb(var(--error-rgb))] text-sm">
          {errorMessage}
        </div>
      )}

      <div className={`flex gap-3 pt-2 ${showCancelButton ? '' : 'justify-end'}`}>
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
        )}
        <Tooltip
          title={!isFormComplete && status !== 'loading' ? 'Please fill in all fields with a valid email' : ''}
          placement="top"
        >
          <span className={showCancelButton ? 'flex-1' : ''}>
            <button
              type="submit"
              disabled={status === 'loading' || !isFormComplete}
              className={`${showCancelButton ? 'w-full' : ''} btn-hacker inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'loading' ? (
                <>
                  <LoadingOutlined className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendOutlined />
                  Send Message
                </>
              )}
            </button>
          </span>
        </Tooltip>
      </div>
    </form>
  )
}

export default ContactForm
