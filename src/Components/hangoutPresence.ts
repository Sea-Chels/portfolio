import type { Presence } from '@sea-chels/hangout/engine'

/** The line under the park saying who else is there, or why it's just you. */
export function presenceText({ status, others }: Presence): string {
  switch (status) {
    case 'connecting':
      return 'Looking for other visitors…'
    case 'full':
      return "The park is full right now, so you're hanging out on your own."
    case 'offline':
      return "Couldn't reach the park, so it's just you for now."
    case 'open':
      if (others === 0) return "It's just you in the park right now."
      return `You and ${others} other ${others === 1 ? 'person are' : 'people are'} in the park.`
  }
}
