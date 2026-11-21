/** OWASP's 2023 recommendation for PBKDF2-HMAC-SHA256: every password guess costs this many rounds. */
export const PBKDF2_ITERATIONS = 600_000

const RSA: RsaHashedKeyGenParams = { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
const AES = 'AES-GCM'
/** 96-bit IVs are what GCM is designed for; never reuse one under the same key. */
const IV_BYTES = 12
const SALT_BYTES = 16
const TAG_BYTES = 16

export interface Envelope {
  iv: Uint8Array
  ciphertext: Uint8Array
  authTag: Uint8Array
}

export function hasWebCrypto(): boolean {
  return typeof globalThis.crypto?.subtle?.generateKey === 'function'
}

/** Extractable only so the private key can be wrapped once for storage; the unwrapped copy never is. */
export function generateUserKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(RSA, true, ['wrapKey', 'unwrapKey'])
}

async function passwordKey(password: string, salt: Uint8Array, iterations: number, usage: KeyUsage): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, { name: AES, length: 256 }, false, [usage])
}

/** Returns salt ‖ iv ‖ ciphertext, the only form of the private key the server ever stores. */
export async function wrapPrivateKey(privateKey: CryptoKey, password: string, iterations = PBKDF2_ITERATIONS): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await passwordKey(password, salt, iterations, 'wrapKey')
  const wrapped = new Uint8Array(await crypto.subtle.wrapKey('pkcs8', privateKey, key, { name: AES, iv }))
  const out = new Uint8Array(SALT_BYTES + IV_BYTES + wrapped.length)
  out.set(salt, 0)
  out.set(iv, SALT_BYTES)
  out.set(wrapped, SALT_BYTES + IV_BYTES)
  return out
}

/** Throws on a wrong password: GCM's tag check fails before any key material comes out. */
export async function unwrapPrivateKey(blob: Uint8Array, password: string, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
  const salt = blob.slice(0, SALT_BYTES)
  const iv = blob.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const key = await passwordKey(password, salt, iterations, 'unwrapKey')
  return crypto.subtle.unwrapKey('pkcs8', blob.slice(SALT_BYTES + IV_BYTES), key, { name: AES, iv }, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
    'unwrapKey',
  ])
}

export function generateSessionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: AES, length: 256 }, true, ['encrypt', 'decrypt'])
}

/** One copy per participant, each readable only with that participant's private key. */
export async function wrapSessionKey(sessionKey: CryptoKey, publicKey: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.wrapKey('raw', sessionKey, publicKey, { name: 'RSA-OAEP' }))
}

export function unwrapSessionKey(blob: Uint8Array, privateKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey('raw', blob, privateKey, { name: 'RSA-OAEP' }, { name: AES }, false, ['encrypt', 'decrypt'])
}

/** Stores the GCM tag in its own field, the way the messages table keeps auth_tag beside iv. */
export async function encrypt(key: CryptoKey, text: string): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: AES, iv }, key, new TextEncoder().encode(text)))
  return { iv, ciphertext: sealed.slice(0, -TAG_BYTES), authTag: sealed.slice(-TAG_BYTES) }
}

/** Throws if the key is wrong or a single bit of the envelope changed. */
export async function decrypt(key: CryptoKey, env: Envelope): Promise<string> {
  const sealed = new Uint8Array(env.ciphertext.length + env.authTag.length)
  sealed.set(env.ciphertext, 0)
  sealed.set(env.authTag, env.ciphertext.length)
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: AES, iv: env.iv }, key, sealed))
}

export function flipByte(env: Envelope, index = 0): Envelope {
  if (env.ciphertext.length === 0) throw new Error('Cannot tamper with an empty ciphertext')
  const ciphertext = env.ciphertext.slice()
  ciphertext[index % ciphertext.length] ^= 0x01
  return { ...env, ciphertext }
}

/** Short SHA-256 of the public key, what two people compare to rule out a swapped key. */
export async function fingerprint(publicKey: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey('spki', publicKey)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', spki))
  return toHex(hash.slice(0, 6)).match(/../g)?.join(':') ?? ''
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
