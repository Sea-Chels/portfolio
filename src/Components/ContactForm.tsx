import { useState } from 'react'
import { SendOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

// Get your free access key from https://web3forms.com/
export const WEB3FORMS_ACCESS_KEY = 'c29a362b-dd97-4d9f-951a-54c64960941e'

const RATE_LIMIT_STORAGE_KEY = 'portfolio-contact-last-sent'
const RATE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000 // one week

function readStoredCooldown(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    if (!raw) return null
    const lastSent = parseInt(raw, 10)
    if (Number.isNaN(lastSent)) return null
    const cooldownEnd = lastSent + RATE_LIMIT_MS
    return cooldownEnd > Date.now() ? cooldownEnd : null
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

interface ContactFormProps {
  onSuccess?: () => void
  showCancelButton?: boolean
  onCancel?: () => void
}

function ContactForm({ onSuccess, showCancelButton = false, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(readStoredCooldown)

  const isRateLimited = cooldownUntil !== null && cooldownUntil > Date.now()

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const emailIsValid = isValidEmail(formData.email)
  const isFormComplete =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.subject.trim() !== '' &&
    formData.message.trim() !== '' &&
    emailIsValid

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setEmailTouched(false)
        const now = Date.now()
        try {
          window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, now.toString())
        } catch {
          // localStorage may be unavailable (private mode, quota); the in-memory
          // cooldown still applies for the rest of the session.
        }
        setCooldownUntil(now + RATE_LIMIT_MS)
        onSuccess?.()
      } else {
        setStatus('error')
        setErrorMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
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
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-mono text-[var(--text-secondary)] mb-2"
        >
          Name
        </label>
        <input
          type="text"
          id="contact-name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors"
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-mono text-[var(--text-secondary)] mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="contact-email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          className={`w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-colors ${
            emailTouched && formData.email && !emailIsValid
              ? 'border-red-500 focus:border-red-500'
              : 'border-[var(--border)] focus:border-accent'
          }`}
          placeholder="your@email.com"
        />
        {emailTouched && formData.email && !emailIsValid && (
          <p className="text-red-500 text-sm mt-1 font-mono">
            Please enter a valid email address
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-mono text-[var(--text-secondary)] mb-2"
        >
          Subject
        </label>
        <input
          type="text"
          id="contact-subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors"
          placeholder="What's this about?"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-mono text-[var(--text-secondary)] mb-2"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Tell me about your project..."
        />
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Buttons */}
      <div className={`flex gap-3 pt-2 ${showCancelButton ? '' : 'justify-end'}`}>
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] font-mono text-sm uppercase tracking-wider hover:border-accent hover:text-accent transition-all duration-300 rounded-lg"
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
