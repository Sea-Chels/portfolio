import { ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons'
import { useReducer, useState } from 'react'
import { useAnnounce } from '../../a11y/announce'
import { current, historyReducer, matchRoute, startHistory } from '../logic/router'
import chillWitch from '../../Media/personalWork/a_chill-witch.png'
import witchCat from '../../Media/personalWork/a_witch-cat.png'
import granolaGhost from '../../Media/personalWork/a_granola-ghost-illustration.png'
import photo2 from '../../Media/personalWork/photo-2.jpeg'
import photo9 from '../../Media/personalWork/photo-9.jpeg'
import photo14 from '../../Media/personalWork/photo-14.jpeg'
import motionGraphic from '../../Media/motion-graphics/motion_graphic.gif'
import programming from '../../Media/motion-graphics/Programming.gif'

const CATEGORIES = ['illustration', 'photography', 'motion'] as const
type Category = (typeof CATEGORIES)[number]

const WORKS: { src: string; alt: string; cat: Category }[] = [
  { src: chillWitch, alt: 'Chill witch illustration', cat: 'illustration' },
  { src: witchCat, alt: 'Witch cat illustration', cat: 'illustration' },
  { src: granolaGhost, alt: 'Granola ghost illustration', cat: 'illustration' },
  { src: photo2, alt: 'Photograph', cat: 'photography' },
  { src: photo9, alt: 'Photograph', cat: 'photography' },
  { src: photo14, alt: 'Photograph', cat: 'photography' },
  { src: motionGraphic, alt: 'Looping motion graphic', cat: 'motion' },
  { src: programming, alt: 'Animated programming illustration', cat: 'motion' },
]

const NAV = [
  { label: 'All', path: '/' },
  ...CATEGORIES.map((c) => ({ label: c[0].toUpperCase() + c.slice(1), path: `/${c}` })),
  { label: 'Broken link', path: '/sculpture' },
]

export default function RoutingDemo() {
  const [history, dispatch] = useReducer(historyReducer, startHistory('/'))
  const [changes, setChanges] = useState(0)
  const announce = useAnnounce()
  const path = current(history)
  const route = matchRoute(path, CATEGORIES)
  const works = route === 'all' ? WORKS : WORKS.filter((w) => w.cat === route)

  const go = (action: Parameters<typeof dispatch>[0]) => {
    const next = historyReducer(history, action)
    if (next === history) return
    dispatch(action)
    setChanges((n) => n + 1)
    const r = matchRoute(current(next), CATEGORIES)
    announce(r === null ? `Page not found: ${current(next)}` : `Showing ${r === 'all' ? 'all work' : r}`)
  }

  return (
    <div className="cs-panel !p-0 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
        <button type="button" className="cs-chip !px-2" aria-label="Back" disabled={history.index === 0} onClick={() => go({ type: 'back' })}>
          <ArrowLeftOutlined aria-hidden />
        </button>
        <button
          type="button"
          className="cs-chip !px-2"
          aria-label="Forward"
          disabled={history.index === history.entries.length - 1}
          onClick={() => go({ type: 'forward' })}
        >
          <ArrowRightOutlined aria-hidden />
        </button>
        <div className="flex-1 truncate rounded bg-[var(--bg)] px-3 py-1 font-mono text-sm text-[var(--text-secondary)]">
          artist.site<span className="text-accent">{path === '/' ? '' : path}</span>
        </div>
        <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]" title="Full page loads">
          <ReloadOutlined aria-hidden /> 1 load
        </span>
      </div>

      <nav aria-label="Demo site" className="flex flex-wrap gap-2 px-3 py-3">
        {NAV.map((n) => (
          <button key={n.path} type="button" className="cs-chip" aria-pressed={path === n.path} onClick={() => go({ type: 'push', path: n.path })}>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-3">
        {route === null ? (
          <div className="grid h-40 place-items-center rounded bg-[var(--bg)] text-center font-mono text-sm text-[var(--text-muted)]">
            404 · no route matches {path}
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {works.map((w) => (
              <li key={w.src} className="aspect-square overflow-hidden rounded bg-[var(--bg)]">
                <img src={w.src} alt={w.alt} loading="lazy" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
          {changes} route change{changes === 1 ? '' : 's'} · 1 full page load · history: [{history.entries.join(', ')}]
        </p>
      </div>
    </div>
  )
}
