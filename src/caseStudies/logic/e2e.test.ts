import { describe, expect, it } from 'vitest'
import {
  decrypt,
  encrypt,
  fingerprint,
  flipByte,
  generateSessionKey,
  generateUserKeys,
  hasWebCrypto,
  toBase64,
  toHex,
  unwrapPrivateKey,
  unwrapSessionKey,
  wrapPrivateKey,
  wrapSessionKey,
} from './e2e'

// Real PBKDF2 cost is 600k rounds; the property under test doesn't depend on it.
const FAST = 1_000

async function user(password: string) {
  const keys = await generateUserKeys()
  return { keys, stored: await wrapPrivateKey(keys.privateKey, password, FAST) }
}

describe('e2e', () => {
  it('runs where Web Crypto exists', () => {
    expect(hasWebCrypto()).toBe(true)
  })

  it('delivers a message through wrapped keys end to end', async () => {
    const [alice, bob] = await Promise.all([user('alice-pw'), user('bob-pw')])
    const session = await generateSessionKey()
    const forBob = await wrapSessionKey(session, bob.keys.publicKey)
    const env = await encrypt(session, 'meet at 6 ✨')

    const bobPrivate = await unwrapPrivateKey(bob.stored, 'bob-pw', FAST)
    const bobSession = await unwrapSessionKey(forBob, bobPrivate)
    expect(await decrypt(bobSession, env)).toBe('meet at 6 ✨')
    expect(alice.stored).not.toEqual(bob.stored)
  })

  it('refuses to unwrap a private key with the wrong password', async () => {
    const bob = await user('bob-pw')
    await expect(unwrapPrivateKey(bob.stored, 'password123', FAST)).rejects.toThrow()
  })

  it('keeps session keys unreadable to anyone but their recipient', async () => {
    const [alice, bob] = await Promise.all([user('a'), user('b')])
    const forBob = await wrapSessionKey(await generateSessionKey(), bob.keys.publicKey)
    const alicePrivate = await unwrapPrivateKey(alice.stored, 'a', FAST)
    await expect(unwrapSessionKey(forBob, alicePrivate)).rejects.toThrow()
  })

  it('never puts the plaintext in the envelope and uses a fresh IV each time', async () => {
    const key = await generateSessionKey()
    const [a, b] = await Promise.all([encrypt(key, 'secret secret'), encrypt(key, 'secret secret')])
    expect(new TextDecoder().decode(a.ciphertext)).not.toContain('secret')
    expect(toHex(a.iv)).not.toBe(toHex(b.iv))
    expect(a.authTag).toHaveLength(16)
  })

  it('rejects an envelope with a single flipped bit', async () => {
    const key = await generateSessionKey()
    const env = await encrypt(key, 'hi')
    await expect(decrypt(key, flipByte(env))).rejects.toThrow()
    expect(await decrypt(key, env)).toBe('hi')
  })

  it('fingerprints keys stably and distinctly', async () => {
    const [a, b] = await Promise.all([generateUserKeys(), generateUserKeys()])
    expect(await fingerprint(a.publicKey)).toMatch(/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/)
    expect(await fingerprint(a.publicKey)).toBe(await fingerprint(a.publicKey))
    expect(await fingerprint(a.publicKey)).not.toBe(await fingerprint(b.publicKey))
  })

  it('encodes bytes', () => {
    expect(toHex(new Uint8Array([0, 255]))).toBe('00ff')
    expect(toBase64(new Uint8Array([104, 105]))).toBe('aGk=')
  })
})
