/** One look for every nav link and the "Other" button: mono caps, accent underline on the current page. */
export const navLinkClasses = (isActive: boolean) =>
  `nav-link px-1 sm:px-4 py-2 font-mono text-xs sm:text-sm sm:tracking-wider transition-all duration-200 ${
    isActive ? 'text-accent border-b-2 border-accent' : 'text-[var(--text-secondary)] hover:text-accent'
  }`
