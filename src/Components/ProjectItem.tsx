import { GithubOutlined, ArrowRightOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Modal, Button } from 'antd'
import { useState, useRef, useEffect } from 'react'

interface ProjectItemProps {
  theme?: string
  title: string
  alt: string
  path: string
  description: string
  link?: string
  website?: string
}

function ProjectItem({
  title,
  alt,
  path,
  description,
  link,
  website,
}: ProjectItemProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isGif = path.toLowerCase().endsWith('.gif')

  // Capture first frame of GIF for thumbnail
  useEffect(() => {
    if (!isGif) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        setThumbnail(canvas.toDataURL('image/png'))
      }
      setImageLoaded(true)
    }
    img.src = path
  }, [path, isGif])

  // For non-GIFs, just mark as loaded
  useEffect(() => {
    if (isGif) return
    setImageLoaded(true)
  }, [isGif])

  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  // Determine which image to show
  const displayImage = isGif ? (isHovering ? path : thumbnail || path) : path

  return (
    <>
      <div
        onClick={toggleModal}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="group cursor-pointer card-hacker overflow-hidden h-full"
      >
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-[var(--elevated)]">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--elevated)] animate-pulse" />
          )}

          {/* Hidden canvas for GIF processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Main Image */}
          <img
            src={displayImage}
            alt={alt}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Play indicator for GIFs */}
          {isGif && !isHovering && imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
                <PlayCircleOutlined className="text-4xl text-white" />
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider">
                <EyeOutlined className="text-xl" />
                <span>View Details</span>
              </div>
            </div>
          </div>

          {/* Accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3 group-hover:text-accent transition-colors duration-200">
            {title}
          </h3>
          <p className="text-base text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {description?.substring(0, 100)}...
          </p>

          {/* Tech indicator */}
          <div className="mt-5 flex items-center gap-3">
            {link && (
              <span className="text-sm text-accent">
                <GithubOutlined className="mr-1" />
                Open Source
              </span>
            )}
            {website && (
              <span className="text-sm text-accent">
                <ArrowRightOutlined className="mr-1" />
                Live Demo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalVisible}
        title={null}
        onCancel={toggleModal}
        footer={null}
        width={700}
        className="project-modal"
        styles={{
          content: {
            backgroundColor: 'var(--surface)',
            padding: 0,
            borderRadius: '12px',
            overflow: 'hidden',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          },
        }}
      >
        <div>
          {/* Modal Header Image - always show animated GIF in modal */}
          <div className="relative aspect-video">
            <img src={path} alt={alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />
          </div>

          {/* Modal Content */}
          <div className="p-8 -mt-20 relative z-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-5">
              {title}
            </h2>

            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={toggleModal}
                size="large"
                className="!bg-transparent !border-[var(--border)] !text-[var(--text-secondary)] hover:!border-accent hover:!text-accent !h-12 !px-6"
              >
                Close
              </Button>

              {link && !website && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-hacker inline-flex items-center gap-2 !py-3"
                >
                  <GithubOutlined className="text-lg" />
                  View Code
                </a>
              )}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-hacker inline-flex items-center gap-2 !py-3"
                >
                  <ArrowRightOutlined className="text-lg" />
                  Visit Site
                </a>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProjectItem
