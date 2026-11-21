export interface TypedLine {
  text: string
  /** Milliseconds per character. */
  speed: number
  startDelay: number
}

export const NAME = 'Chelby Sallady'

/** When a line finishes typing. */
export const typedEnd = (line: TypedLine) => line.startDelay + line.text.length * line.speed

const after = (line: TypedLine, pause: number) => typedEnd(line) + pause

export const GREETING: TypedLine = { text: '> hello world', speed: 80, startDelay: 300 }
export const NAME_LINE: TypedLine = { text: NAME, speed: 100, startDelay: after(GREETING, 160) }
export const TITLE: TypedLine = { text: 'Full Stack Engineer', speed: 60, startDelay: after(NAME_LINE, 300) }

/** The rest of the hero (prompt, scroll cue) fades in once the title has finished typing. */
export const CONTENT_DELAY_MS = after(TITLE, 160)
