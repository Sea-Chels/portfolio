/** A note for anyone who opens dev tools. Called once from main.tsx, outside React. */
export function printConsoleHint() {
  const art = String.raw`
  ___  ___
 / __|/ __|
| (__ \__ \
 \___||___/`
  console.info(
    `%c${art}\n\n%cpsst, the terminal on the home page is real. Click into it (or press /) and type help.`,
    'color:#FF7A64;font-family:monospace;font-weight:bold',
    'color:inherit;font-family:monospace',
  )
}
