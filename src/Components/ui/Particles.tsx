import { useEffect, useRef, useCallback } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

interface ParticlesProps {
  particleCount?: number
  particleSpread?: number
  speed?: number
  particleColors?: string[]
  moveParticlesOnHover?: boolean
  particleHoverFactor?: number
  alphaParticles?: boolean
  particleBaseSize?: number
  sizeRandomness?: number
  cameraDistance?: number
  disableRotation?: boolean
  className?: string
}

const defaultColors = ['#FF7A64', '#ff8f7d', '#fb923c']

export default function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors = defaultColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 2,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className = '',
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const animationFrameRef = useRef<number>(0)

  const hexToVec3 = useCallback((hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [1, 1, 1]
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const renderer = new Renderer({
      alpha: true,
      antialias: true,
    })
    rendererRef.current = renderer
    const gl = renderer.gl
    container.appendChild(gl.canvas)

    gl.clearColor(0, 0, 0, 0)

    const resize = () => {
      if (!containerRef.current) return
      renderer.setSize(
        containerRef.current.offsetWidth,
        containerRef.current.offsetHeight
      )
    }

    window.addEventListener('resize', resize)
    resize()

    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    if (moveParticlesOnHover) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    const numParticles = particleCount
    const positions = new Float32Array(numParticles * 3)
    const randomOffsets = new Float32Array(numParticles * 3)
    const sizes = new Float32Array(numParticles)
    const colors = new Float32Array(numParticles * 3)

    for (let i = 0; i < numParticles; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * particleSpread
      positions[i3 + 1] = (Math.random() - 0.5) * particleSpread
      positions[i3 + 2] = (Math.random() - 0.5) * particleSpread

      randomOffsets[i3] = Math.random() * Math.PI * 2
      randomOffsets[i3 + 1] = Math.random() * Math.PI * 2
      randomOffsets[i3 + 2] = Math.random() * Math.PI * 2

      sizes[i] = Math.random() * sizeRandomness + 0.5

      const color = hexToVec3(
        particleColors[Math.floor(Math.random() * particleColors.length)]
      )
      colors[i3] = color[0]
      colors[i3 + 1] = color[1]
      colors[i3 + 2] = color[2]
    }

    const geometry = new Triangle(gl)
    geometry.addAttribute('position', {
      size: 3,
      data: positions,
    })
    geometry.addAttribute('random', {
      size: 3,
      data: randomOffsets,
    })
    geometry.addAttribute('size', {
      size: 1,
      data: sizes,
    })
    geometry.addAttribute('color', {
      size: 3,
      data: colors,
    })

    const vertex = /* glsl */ `
      attribute vec3 position;
      attribute vec3 random;
      attribute float size;
      attribute vec3 color;

      uniform float uTime;
      uniform float uScale;
      uniform vec2 uMouse;
      uniform float uHoverFactor;

      varying vec3 vColor;

      void main() {
        vColor = color;

        vec3 pos = position;
        pos.x += sin(uTime * 0.3 + random.x) * 0.5;
        pos.y += cos(uTime * 0.2 + random.y) * 0.5;
        pos.z += sin(uTime * 0.4 + random.z) * 0.5;

        if (uHoverFactor > 0.0) {
          pos.x += uMouse.x * uHoverFactor;
          pos.y += uMouse.y * uHoverFactor;
        }

        gl_Position = vec4(pos.xy / ${cameraDistance.toFixed(1)}, pos.z / ${cameraDistance.toFixed(1)}, 1.0);
        gl_PointSize = size * uScale;
      }
    `

    const fragment = /* glsl */ `
      precision highp float;

      varying vec3 vColor;
      uniform float uAlpha;

      void main() {
        vec2 uv = gl_PointCoord.xy;
        float d = length(uv - vec2(0.5));

        if (d > 0.5) discard;

        float alpha = uAlpha > 0.5 ? smoothstep(0.5, 0.0, d) : 1.0;
        gl_FragColor = vec4(vColor, alpha);
      }
    `

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: particleBaseSize * window.devicePixelRatio },
        uMouse: { value: [0, 0] },
        uHoverFactor: { value: moveParticlesOnHover ? particleHoverFactor : 0 },
        uAlpha: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    })

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program })

    let rotation = 0
    const animate = (time: number) => {
      animationFrameRef.current = requestAnimationFrame(animate)

      program.uniforms.uTime.value = time * 0.001 * speed

      if (moveParticlesOnHover) {
        program.uniforms.uMouse.value = [mouse.x, mouse.y]
      }

      if (!disableRotation) {
        rotation += 0.001
        particles.rotation.y = rotation
        particles.rotation.x = rotation * 0.5
      }

      renderer.render({ scene: particles })
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener('resize', resize)
      if (moveParticlesOnHover) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      if (containerRef.current && gl.canvas.parentNode) {
        containerRef.current.removeChild(gl.canvas)
      }
    }
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    hexToVec3,
  ])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    />
  )
}
