import { useEffect, useRef, useState } from 'react'
import { HomeOutlined, SearchOutlined } from '@ant-design/icons'
import { useAnnounce } from '../a11y/announce'
import { HOME, followInApp, type NavigablePage } from '../routing/routes'
import { displayPath, searchLines, type SearchLine } from './search'
import SectionMarker from '../Components/SectionMarker'

const LINE_CLASS: Record<SearchLine['kind'], string> = {
  command: 'text-[var(--text-muted)]',
  output: 'text-[var(--text-secondary)]',
  result: 'text-[var(--text-primary)]',
  secret: 'not-found-secret text-accent',
}

interface NotFoundPageProps {
  path: string
  navigate: (page: NavigablePage) => void
}

function NotFoundPage({ path, navigate }: NotFoundPageProps) {
  const [attempts, setAttempts] = useState(1)
  const outputRef = useRef<HTMLOListElement>(null)
  const announce = useAnnounce()

  const lines = Array.from({ length: attempts }, (_, attempt) => searchLines(path, attempt)).flat()

  useEffect(() => {
    const output = outputRef.current
    if (output) output.scrollTop = output.scrollHeight
  }, [attempts])

  const keepLooking = () => {
    const found = searchLines(path, attempts)
    setAttempts(attempts + 1)
    announce(found.filter((l) => l.kind === 'result' || l.kind === 'secret').map((l) => l.text).join(' '))
  }

  return (
    <div className="min-h-screen py-16">
      <SectionMarker num="404" />

      <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">This page wandered off.</h1>
      <p className="mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
        There's nothing at <code className="break-all text-accent">{displayPath(path)}</code>. I checked. Thoroughly.
        Maybe it was a typo, maybe it was never here, maybe it's on a better website now.
      </p>

      <div data-comic-panel className="mb-8 max-w-3xl overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="terminal-bar flex items-center gap-2 border-b border-[var(--border)] bg-[var(--elevated)] px-4 py-2">
          {['--window-close', '--window-minimize', '--window-expand'].map((tone) => (
            <span key={tone} aria-hidden className="h-3 w-3 rounded-full" style={{ background: `var(${tone})` }} />
          ))}
          <span className="ml-2 font-mono text-sm text-[var(--text-muted)]">~/search-party</span>
        </div>
        <ol ref={outputRef} aria-label="Search log" className="max-h-80 space-y-2 overflow-y-auto p-6 font-mono text-sm md:p-8">
          {lines.map((line, i) => (
            <li key={i} className={`break-words ${LINE_CLASS[line.kind]}`}>
              {line.kind === 'command' && <span aria-hidden className="text-accent">$ </span>}
              {line.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-4">
        <a
          href={HOME.path}
          onClick={(e) => followInApp(e, () => navigate(HOME.page))}
          className="btn-hacker inline-flex items-center gap-2"
        >
          <HomeOutlined />
          Take me home
        </a>
        <button type="button" onClick={keepLooking} className="btn-ghost inline-flex items-center gap-2">
          <SearchOutlined />
          Keep looking
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
