import { useState, useEffect, useRef } from 'react'
import { artworks } from '../Media'
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'

function ArtPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'auto'
  }

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === 0 ? artworks.length - 1 : selectedIndex - 1
      )
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === artworks.length - 1 ? 0 : selectedIndex + 1
      )
    }
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
  }, [selectedIndex])

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
          <span className="font-mono text-accent text-base">05</span>
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
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
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

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl p-2 transition-colors z-10"
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
              className="absolute left-6 text-white/70 hover:text-white text-3xl p-4 transition-colors z-10 hover:scale-110"
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
              className="absolute right-6 text-white/70 hover:text-white text-3xl p-4 transition-colors z-10 hover:scale-110"
            >
              <RightOutlined />
            </motion.button>

            {/* Image with animation */}
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
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </AnimatePresence>

            {/* Image counter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-mono text-sm bg-black/50 px-4 py-2 rounded-full"
            >
              {selectedIndex + 1} / {artworks.length}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-6 break-inside-avoid"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
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
            className="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider transition-all duration-300"
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
