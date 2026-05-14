/**
 * Returns true only on engines that fully support SVG-filter-based
 * backdrop-filter (Chromium). Safari and Firefox short-circuit to false —
 * the GlassSurface component disables its distortion effect on those engines,
 * and consumers that want to fall back to a plain overlay can check this too.
 */
export function supportsGlassDistortion(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }
  const ua = navigator.userAgent
  const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua)
  const isFirefox = /Firefox/.test(ua)
  if (isWebkit || isFirefox) return false

  const div = document.createElement('div')
  div.style.backdropFilter = 'url(#glass-filter-probe)'
  return div.style.backdropFilter !== ''
}
