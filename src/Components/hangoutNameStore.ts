const STORAGE_KEY = 'hangout-name'

/** The name this visitor last used in the park, if storage is available and holds one. */
export function storedHangoutName(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Remembers the name for next time, or forgets it when null. Storage may be unavailable (private mode, quota); the name then lasts only this visit. */
export function storeHangoutName(name: string | null) {
  try {
    if (name) window.localStorage.setItem(STORAGE_KEY, name)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // See above.
  }
}
