import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const AnnounceContext = createContext<((message: string) => void) | null>(null)

/** The one polite live region for the whole site. */
export function AnnounceProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const announce = (next: string) => {
    // Clearing first makes screen readers repeat an identical message.
    setMessage('')
    requestAnimationFrame(() => setMessage(next))
  }
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {message}
      </div>
    </AnnounceContext.Provider>
  )
}

export function useAnnounce(): (message: string) => void {
  const announce = useContext(AnnounceContext)
  if (!announce) throw new Error('useAnnounce must be used inside <AnnounceProvider>')
  return announce
}

/** Announces `message` whenever it changes; renders nothing. */
export function Announce({ message }: { message: string }) {
  const announce = useAnnounce()
  useEffect(() => {
    announce(message)
  }, [announce, message])
  return null
}
