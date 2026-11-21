import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { artworks } from '../Media'
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../a11y/useReducedMotion'
import { useComicMode } from '../terminal/useComicMode'
import PageCurl, { capturePage, type CurlPage } from './PageCurl'
import type { TurnDirection } from './curlGeometry'
import { queueTurn, takeTurn } from './turnQueue'
import { must } from '../utils/must'

/** The next piece settles in once the previous page has finished turning away. */
const PAGE_ENTER: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.97)' },
  { opacity: 1, transform: 'scale(1)' },
]
const PAGE_ENTER_MS = 200

interface Curl {
  id: number
  page: CurlPage
  direction: TurnDirection
  /** The piece to show once the page has finished turning. */
  to: number
}

function ArtPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [curl, setCurl] = useState<Curl | null>(null)
  const pageRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const nextCurlId = useRef(0)
  const pendingTurns = useRef(0)
  const comic = useComicMode()
  const reduced = useReducedMotion()
  const flips = comic && !reduced

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  const open = selectedIndex !== null

  // The open lightbox owns the page behind it: no scrolling, nothing reachable, and focus returns
  // to the piece that opened it. Cleanup also runs when the page is left with the lightbox open.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = must(document.getElementById('root'), '#root element')
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.inert = true
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      root.inert = false
      opener?.focus()
    }
  }, [open])

  const openLightbox = (index: number) => setSelectedIndex(index)

  const closeLightbox = () => {
    pendingTurns.current = 0
    setCurl(null)
    setSelectedIndex(null)
  }

  /**
   * Moves one piece in `direction`. In comic mode the page curls away first and the next piece only
   * appears once it's gone; presses made while a page is still turning wait their turn.
   */
  const step = (direction: TurnDirection) => {
    if (selectedIndex === null) return
    if (flips && curl) {
      pendingTurns.current = queueTurn(pendingTurns.current, direction)
      return
    }
    const to = (selectedIndex + direction + artworks.length) % artworks.length
    if (flips && pageRef.current) {
      setCurl({ id: nextCurlId.current++, page: capturePage(pageRef.current), direction, to })
    } else {
      setSelectedIndex(to)
    }
  }

  const goToPrevious = () => step(-1)
  const goToNext = () => step(1)

  useEffect(() => {
    if (flips) return
    pendingTurns.current = 0
    setCurl(null)
  }, [flips])

  useEffect(() => {
    if (curl) return
    const next = takeTurn(pendingTurns.current)
    if (!next) return
    let cancelled = false
    const turn = () => {
      if (cancelled) return
      pendingTurns.current = next.rest
      step(next.direction)
    }
    // The piece that just appeared has to finish loading before it can be captured and turned.
    const page = pageRef.current
    if (page && !page.complete) page.decode().then(turn, turn)
    else turn()
    return () => {
      cancelled = true
    }
  }, [curl])

  // One persistent page element whose source changes: remounting a keyed <img> per piece left the
  // old elements behind in the DOM after each turn, stacking up beside the new one.
  useEffect(() => {
    if (!flips || selectedIndex === null) return
    const entrance = pageRef.current?.animate(PAGE_ENTER, { duration: PAGE_ENTER_MS, easing: 'ease-out' })
    return () => entrance?.cancel()
  }, [selectedIndex, flips])

  const finishCurl = (finished: Curl) => {
    setCurl((current) => (current?.id === finished.id ? null : current))
    setSelectedIndex((index) => (index === null ? null : finished.to))
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, curl, flips])

  return (
    <div className="min-h-screen py-16">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <span className="section-num font-mono text-accent text-base">05</span>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">
          Personal Work
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl">
          A collection of illustrations and personal art projects. Click any
          image to view it larger.
        </p>
      </motion.section>

      {/* Masonry Gallery */}
      <div className="art-grid columns-1 sm:columns-2 lg:columns-3 gap-6">
        {artworks?.map((art, index) => (
          <TiltCard
            key={index}
            index={index}
            art={art}
            isVisible={isVisible}
            isLoaded={loadedImages.has(index)}
            onLoad={() => handleImageLoad(index)}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>

      {createPortal(
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Artwork viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <motion.button
              ref={closeRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={closeLightbox}
              aria-label="Close"
              className="overlay-control absolute top-3 right-3 z-30 sm:top-6 sm:right-6"
            >
              <CloseOutlined />
            </motion.button>

            {/* Navigation buttons */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Previous artwork"
              className="overlay-control absolute left-3 z-30 sm:left-6"
            >
              <LeftOutlined />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Next artwork"
              className="overlay-control absolute right-3 z-30 sm:right-6"
            >
              <RightOutlined />
            </motion.button>

            {/* Image with animation */}
            {flips ? (
              <img
                ref={pageRef}
                src={artworks[selectedIndex].path}
                alt={artworks[selectedIndex].alt}
                onClick={(e) => e.stopPropagation()}
                className={`art-lightbox-img max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl ${curl ? 'invisible' : ''}`}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedIndex}
                  src={artworks[selectedIndex].path}
                  alt={artworks[selectedIndex].alt}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="art-lightbox-img max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
              </AnimatePresence>
            )}
            {flips && curl && (
              <PageCurl
                key={curl.id}
                page={curl.page}
                direction={curl.direction}
                onDone={() => finishCurl(curl)}
              />
            )}

            {/* Image counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="art-counter absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-white font-mono text-sm bg-[rgb(var(--scrim-rgb)/0.75)] px-4 py-2 rounded-full"
            >
              {selectedIndex + 1} / {artworks.length}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  )
}

// Tilt Card Component with 3D hover effect
interface TiltCardProps {
  index: number
  art: { path: string; alt: string }
  isVisible: boolean
  isLoaded: boolean
  onLoad: () => void
  onClick: () => void
}

function TiltCard({ index, art, isVisible, isLoaded, onLoad, onClick }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = (y - centerY) / 10
    const tiltY = (centerX - x) / 10
    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovering(false)
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onClick()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-6 break-inside-avoid"
    >
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`View larger: ${art.alt}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onFocus={(e) => setIsHovering(e.currentTarget.matches(':focus-visible'))}
        onBlur={handleMouseLeave}
        className="art-frame relative cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[var(--elevated)] animate-pulse" />
        )}

        {/* Glare effect */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovering ? 0.15 : 0,
            background: `radial-gradient(circle at ${50 + tilt.y * 5}% ${50 + tilt.x * 5}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
          }}
        />

        <img
          src={art.path}
          alt={art.alt}
          onLoad={onLoad}
          className={`w-full h-auto transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: isHovering ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease-out',
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{
            background: isHovering ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          }}
        >
          <div
            className="art-view flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider transition-all duration-300"
            style={{
              opacity: isHovering ? 1 : 0,
              transform: isHovering ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>View</span>
          </div>
        </div>

        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent rounded-tl-xl transition-opacity duration-300"
          style={{ opacity: isHovering ? 1 : 0 }}
        />
        <div
          className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent rounded-br-xl transition-opacity duration-300"
          style={{ opacity: isHovering ? 1 : 0 }}
        />
      </div>
    </motion.div>
  )
}

export default ArtPage
