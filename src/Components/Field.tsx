import type { ReactNode } from 'react'

export const FIELD_CLASS =
  'w-full px-4 py-3 bg-[var(--bg)] border rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors'
export const FIELD_OK = 'border-[var(--border)] focus:border-accent'
export const FIELD_INVALID = 'border-[rgb(var(--error-rgb))] focus:border-[rgb(var(--error-rgb))]'

/** A labelled form control; pass the input as children with the same `id`. */
export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-mono text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}
