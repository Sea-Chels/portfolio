/**
 * Makes everything on the page inert except `keep` and what's inside them, so keyboard and screen
 * reader users can only reach what's showing. Returns a function that undoes exactly what it did.
 */
export function inertExcept(keep: readonly Element[]): () => void {
  const onPath = new Set<Element>()
  for (const element of keep) for (let node: Element | null = element; node; node = node.parentElement) onPath.add(node)
  const made: HTMLElement[] = []
  const walk = (parent: Element) => {
    for (const child of parent.children) {
      if (keep.includes(child)) continue
      if (onPath.has(child)) walk(child)
      else if (child instanceof HTMLElement && !child.inert) {
        child.inert = true
        made.push(child)
      }
    }
  }
  walk(document.body)
  return () => {
    for (const element of made) element.inert = false
  }
}
