import { useState, useEffect } from 'react'
import { artworks } from '../Media'
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'

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
      <section
        className={`mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
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
      </section>

      {/* Masonry Gallery */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {artworks?.map((art, index) => (
          <div
            key={index}
            className={`mb-4 break-inside-avoid transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              onClick={() => openLightbox(index)}
              className="group relative cursor-pointer overflow-hidden rounded-lg border border-[var(--border)] hover:border-accent/50 transition-all duration-300"
            >
              {/* Loading skeleton */}
              {!loadedImages.has(index) && (
                <div className="absolute inset-0 bg-[var(--elevated)] animate-pulse" />
              )}

              <img
                src={art.path}
                alt={art.alt}
                onLoad={() => handleImageLoad(index)}
                className={`w-full h-auto transition-transform duration-500 group-hover:scale-105 ${
                  loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white font-mono text-sm uppercase tracking-wider">
                  View
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl p-2 transition-colors"
          >
            <CloseOutlined />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-6 text-white/70 hover:text-white text-3xl p-4 transition-colors"
          >
            <LeftOutlined />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-6 text-white/70 hover:text-white text-3xl p-4 transition-colors"
          >
            <RightOutlined />
          </button>

          {/* Image */}
          <img
            src={artworks[selectedIndex].path}
            alt={artworks[selectedIndex].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-mono text-sm">
            {selectedIndex + 1} / {artworks.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArtPage
