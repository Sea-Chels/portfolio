import { useEffect, useState } from 'react'

export const COMIC_CLASS = 'comic'

const isComic = () => document.documentElement.classList.contains(COMIC_CLASS)

/** Whether comic mode is on, for effects that CSS alone can't switch. */
export function useComicMode(): boolean {
  const [on, setOn] = useState(isComic)
  useEffect(() => {
    const observer = new MutationObserver(() => setOn(isComic()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return on
}
