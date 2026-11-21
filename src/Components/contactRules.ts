export interface ContactFields {
  name: string
  email: string
  subject: string
  message: string
}

export const EMPTY_FIELDS: ContactFields = { name: '', email: '', subject: '', message: '' }

/** One message per visitor per week keeps the inbox free of repeat spam. */
export const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isComplete(fields: ContactFields): boolean {
  return Object.values(fields).every((value) => value.trim() !== '') && isValidEmail(fields.email)
}

/** When the cooldown from a stored send time ends, or null if there's none still running. */
export function cooldownEnd(lastSent: string | null, now: number): number | null {
  if (!lastSent) return null
  const sent = parseInt(lastSent, 10)
  if (Number.isNaN(sent)) return null
  const end = sent + COOLDOWN_MS
  return end > now ? end : null
}
