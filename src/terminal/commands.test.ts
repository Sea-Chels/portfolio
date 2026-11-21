import { describe, expect, it } from 'vitest'
import { DEFAULT_COMMAND, fakeCiphertext, findStudy, runCommand, type Context } from './commands'

const ctx: Context = {
  studies: [
    { id: 'newity', title: 'NEWITY' },
    { id: 'zipdrug', title: 'Zipdrug / CarelonRx' },
    { id: 'mm-converter', title: 'Millimeter Converter' },
  ],
  skills: ['TypeScript', 'Python'],
  theme: 'dark',
}
const run = (cmd: string) => runCommand(cmd, ctx)

describe('terminal commands', () => {
  it('keeps Execute’s original job as the default command', () => {
    expect(run(DEFAULT_COMMAND).effect).toEqual({ kind: 'scroll' })
  })

  it('lists and opens case studies by id, prefix or title', () => {
    expect(run('ls').lines).toHaveLength(3)
    expect(run('open zipdrug').effect).toEqual({ kind: 'open', id: 'zipdrug' })
    expect(run('open mm').effect).toEqual({ kind: 'open', id: 'mm-converter' })
    expect(run('OPEN millimeter').effect).toEqual({ kind: 'open', id: 'mm-converter' })
    expect(run('open nope').effect).toBeUndefined()
    expect(run('open').lines[0]).toMatch(/usage/)
  })

  it('switches theme only to a valid value', () => {
    expect(run('theme light').effect).toEqual({ kind: 'theme', theme: 'light' })
    expect(run('theme').lines).toEqual(['theme: dark'])
    expect(run('theme purple').effect).toBeUndefined()
  })

  it('answers specific sudo jokes before the generic one', () => {
    expect(run('sudo approve-loan').lines[0]).toMatch(/lacks loans:approve/)
    expect(run('sudo rm -rf /').lines).toEqual(['nice try'])
    expect(run('rm -rf /').lines).toEqual(['nice try'])
    expect(run('rm skills.txt').lines).toEqual(['nice try'])
    expect(run('rm').lines).toEqual(['nice try'])
    expect(run('rmdir x').lines[0]).toMatch(/command not found/)
    expect(run('sudo make me a sandwich').lines[0]).toMatch(/sudoers/)
  })

  it('cats skills and secrets, and nothing else', () => {
    expect(run('cat skills').lines).toEqual(['TypeScript  Python'])
    expect(run('cat secrets.txt').lines[0]).toMatch(/^[A-Za-z0-9+/]+==$/)
    expect(run('cat passwords').lines[0]).toMatch(/No such file/)
  })

  it('keeps argument case for echo and normalizes spacing', () => {
    expect(run('  echo   Hello World ').lines).toEqual(['Hello World'])
  })

  it('handles empty, clear, exit and unknown input', () => {
    expect(run('   ')).toEqual({ lines: [] })
    expect(run('clear').effect).toEqual({ kind: 'clear' })
    expect(run('exit').effect).toEqual({ kind: 'exit' })
    expect(run('vim').lines).toEqual(['command not found: vim. Try help.'])
  })

  it('streams the hacker commands as frames after their first line', () => {
    const scan = run('scan')
    expect(scan.lines).toEqual(['starting scan of chelby-sallady.com…'])
    expect(scan.frames?.length).toBeGreaterThan(5)
    expect(run('ping example.com').lines[0]).toBe('PING example.com: 56 data bytes')
    const last = (frames: { line: string }[] = [], fromEnd = 1) => frames[frames.length - fromEnd]?.line
    expect(last(run('hack the planet').frames)).toBe('HACK THE PLANET!')
    expect(last(run('npm install coffee').frames, 2)).toMatch(/coffee@latest/)
    expect(run('npm install').lines[0]).toMatch(/usage/)
    expect(run('netstat').frames).toBeUndefined()
  })

  it('lines help up in one column', () => {
    const rows = run('help').lines.slice(0, -1)
    const column = rows[0].indexOf('jump')
    expect(rows.every((r) => r[column - 1] === ' ' && r[column] !== ' ')).toBe(true)
  })

  it('points the curious toward the arrow-key secret', () => {
    expect(run('konami').lines[0]).toMatch(/↑ ↑ ↓ ↓ ← → ← →/)
  })
})

describe('helpers', () => {
  it('produces stable, ciphertext-looking noise', () => {
    expect(fakeCiphertext('a')).toBe(fakeCiphertext('a'))
    expect(fakeCiphertext('a')).not.toBe(fakeCiphertext('b'))
  })

  it('prefers an exact id over a title match', () => {
    expect(findStudy([{ id: 'diy', title: 'x' }, { id: 'other', title: 'diy stuff' }], 'diy')?.id).toBe('diy')
  })
})
