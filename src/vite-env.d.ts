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
