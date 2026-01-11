/// <reference types="vite/client" />

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.pdf' {
  const src: string
  export default src
}

declare module 'react-scroll-into-view' {
  import { ReactNode } from 'react'
  interface ScrollIntoViewProps {
    selector: string
    className?: string
    children?: ReactNode
  }
  const ScrollIntoView: React.FC<ScrollIntoViewProps>
  export default ScrollIntoView
}

declare module 'react-responsive-masonry' {
  import { ReactNode } from 'react'
  interface MasonryProps {
    columnsCount?: number
    gutter?: string
    children?: ReactNode
  }
  const Masonry: React.FC<MasonryProps>
  export default Masonry
}

declare module 'ogl' {
  export class Renderer {
    constructor(options?: { alpha?: boolean; antialias?: boolean })
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement }
    setSize(width: number, height: number): void
    render(options: { scene: Mesh }): void
  }

  export class Program {
    constructor(
      gl: WebGLRenderingContext,
      options: {
        vertex: string
        fragment: string
        uniforms?: Record<string, { value: unknown }>
        transparent?: boolean
        depthTest?: boolean
      }
    )
    uniforms: Record<string, { value: unknown }>
  }

  export class Mesh {
    constructor(
      gl: WebGLRenderingContext,
      options: { mode: number; geometry: Triangle; program: Program }
    )
    rotation: { x: number; y: number; z: number }
  }

  export class Triangle {
    constructor(gl: WebGLRenderingContext)
    addAttribute(
      name: string,
      options: { size: number; data: Float32Array }
    ): void
  }

  export class Color {
    constructor(color?: string | number)
  }
}
