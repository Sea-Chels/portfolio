import { Suspense, useState, type ReactNode } from 'react'

/**
 * Loads and mounts `children` (typically a lazy pop-up) the first time `open` turns true, then keeps
 * it mounted so its own close animation still plays. Until then its code isn't downloaded at all.
 */
function MountOnceOpened({ open, children }: { open: boolean; children: ReactNode }) {
  const [opened, setOpened] = useState(open)
  if (open && !opened) setOpened(true)
  return opened ? <Suspense fallback={null}>{children}</Suspense> : null
}

export default MountOnceOpened
