import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAnnounce } from '../../a11y/announce'
import {
  PBKDF2_ITERATIONS,
  decrypt,
  encrypt,
  fingerprint,
  flipByte,
  generateSessionKey,
  generateUserKeys,
  hasWebCrypto,
  toBase64,
  unwrapPrivateKey,
  unwrapSessionKey,
  wrapPrivateKey,
  wrapSessionKey,
  type Bytes,
  type Envelope,
} from '../logic/e2e'
import { StatusLine, type StatusLevel } from './StatusLine'

const PASSWORDS = { alice: 'alice-demo-pass', bob: 'bob-demo-pass' }
const COMMON_GUESS = 'password123'
const ROUNDS = PBKDF2_ITERATIONS.toLocaleString('en-US')

/** What the database holds. Nothing here can be read without a user's password. */
interface Stored {
  users: { name: string; print: string; encryptedPrivateKey: Bytes }[]
  sessionKeys: { name: string; encryptedSessionKey: Bytes }[]
}

interface Setup {
  stored: Stored
  aliceSession: CryptoKey
}

interface Result {
  level: StatusLevel
  text: string
}

async function setUp(): Promise<Setup> {
  const [alice, bob] = await Promise.all([generateUserKeys(), generateUserKeys()])
  const session = await generateSessionKey()
  const [alicePriv, bobPriv, aliceSk, bobSk, alicePrint, bobPrint] = await Promise.all([
    wrapPrivateKey(alice.privateKey, PASSWORDS.alice),
    wrapPrivateKey(bob.privateKey, PASSWORDS.bob),
    wrapSessionKey(session, alice.publicKey),
    wrapSessionKey(session, bob.publicKey),
    fingerprint(alice.publicKey),
    fingerprint(bob.publicKey),
  ])
  return {
    aliceSession: session,
    stored: {
      users: [
        { name: 'alice', print: alicePrint, encryptedPrivateKey: alicePriv },
        { name: 'bob', print: bobPrint, encryptedPrivateKey: bobPriv },
      ],
      sessionKeys: [
        { name: 'alice', encryptedSessionKey: aliceSk },
        { name: 'bob', encryptedSessionKey: bobSk },
      ],
    },
  }
}

function clip(bytes: Uint8Array): string {
  const b64 = toBase64(bytes)
  return b64.length > 28 ? `${b64.slice(0, 28)}… (${bytes.length} B)` : b64
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cs-panel flex min-w-0 flex-col gap-3">
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value, flag }: { label: string; value: string; flag?: string }) {
  return (
    <div>
      <dt className="cs-label !normal-case">
        {label}
        {flag && <span className="text-[rgb(var(--error-rgb))]"> · {flag}</span>}
      </dt>
      <dd className="break-all font-mono text-xs text-[var(--text-secondary)]">{value}</dd>
    </div>
  )
}

export default function E2eDemo() {
  const [setup, setSetup] = useState<Setup | null>(null)
  const [unsupported, setUnsupported] = useState(false)
  const [text, setText] = useState('Running late, see you at 6')
  const [message, setMessage] = useState<Envelope | null>(null)
  const [tampered, setTampered] = useState(false)
  const [password, setPassword] = useState(PASSWORDS.bob)
  const [busy, setBusy] = useState<'bob' | 'server' | null>(null)
  const [bob, setBob] = useState<Result | null>(null)
  const [server, setServer] = useState<Result | null>(null)
  const latest = useRef(0)
  const announce = useAnnounce()

  useEffect(() => {
    if (!hasWebCrypto()) {
      setUnsupported(true)
      return
    }
    let cancelled = false
    setUp().then((s) => !cancelled && setSetup(s))
    return () => {
      cancelled = true
    }
  }, [])

  // Each action supersedes the last; a slower earlier result must not overwrite a newer one.
  const begin = () => ++latest.current
  const report = (id: number, set: (r: Result) => void, r: Result) => {
    if (id !== latest.current) return
    set(r)
    setBusy(null)
    announce(r.text)
  }

  if (unsupported) {
    return <p className="text-[var(--text-secondary)]">This browser doesn’t expose the Web Crypto API here, so the live demo can’t run.</p>
  }
  if (!setup) {
    return (
      <div className="grid h-48 place-items-center rounded-lg bg-[var(--elevated)] font-mono text-sm text-[var(--text-muted)]" role="status">
        Generating RSA key pairs and wrapping them with {ROUNDS} PBKDF2 rounds…
      </div>
    )
  }

  const { stored, aliceSession } = setup
  const bobRecord = stored.users[1]
  const bobSessionKey = stored.sessionKeys[1].encryptedSessionKey

  const send = async () => {
    begin()
    setMessage(await encrypt(aliceSession, text))
    setTampered(false)
    setBob(null)
    setServer(null)
    setBusy(null)
  }

  const tamper = () => {
    if (!message) return
    begin()
    setMessage(flipByte(message, 3))
    setTampered(true)
    setBob(null)
    setBusy(null)
  }

  const unlock = async () => {
    if (!message) return
    const id = begin()
    setBusy('bob')
    let privateKey: CryptoKey
    try {
      privateKey = await unwrapPrivateKey(bobRecord.encryptedPrivateKey, password)
    } catch {
      return report(id, setBob, { level: 'error', text: 'Wrong password. The private key stays locked, so nothing else can be decrypted.' })
    }
    try {
      const session = await unwrapSessionKey(bobSessionKey, privateKey)
      report(id, setBob, { level: 'ok', text: `“${await decrypt(session, message)}”` })
    } catch {
      report(id, setBob, { level: 'error', text: 'Integrity check failed. The message changed in transit, so Bob’s app rejects it.' })
    }
  }

  const serverRead = async () => {
    if (!message) return
    const id = begin()
    setBusy('server')
    try {
      const privateKey = await unwrapPrivateKey(bobRecord.encryptedPrivateKey, COMMON_GUESS)
      const session = await unwrapSessionKey(bobSessionKey, privateKey)
      report(id, setServer, { level: 'error', text: `Server read: ${await decrypt(session, message)}` })
    } catch {
      report(id, setServer, {
        level: 'ok',
        text: `Guessed “${COMMON_GUESS}” against Bob’s wrapped key: rejected. Every guess costs ${ROUNDS} PBKDF2 rounds, and the endpoints are rate-limited.`,
      })
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Panel title="Alice’s browser">
        <p className="font-mono text-xs text-[var(--text-muted)]">key {stored.users[0].print}</p>
        <label className="block">
          <span className="cs-label">Message</span>
          <textarea className="cs-select mt-1 min-h-20 resize-y" value={text} onChange={(e) => setText(e.target.value)} maxLength={140} />
        </label>
        <button type="button" className="btn-hacker btn-sm inline-flex items-center justify-center gap-2" onClick={send} disabled={!text.trim()}>
          <LockOutlined aria-hidden /> Encrypt &amp; send
        </button>
        <p className="mt-auto text-xs text-[var(--text-muted)]">Encrypts with the conversation’s AES-256-GCM session key, in the browser.</p>
      </Panel>

      <Panel title="Database (all the server has)">
        <dl className="space-y-2">
          {stored.users.map((u) => (
            <Row key={u.name} label={`${u.name}.encrypted_private_key`} value={clip(u.encryptedPrivateKey)} />
          ))}
          {stored.sessionKeys.map((k) => (
            <Row key={k.name} label={`${k.name}.encrypted_session_key v1`} value={clip(k.encryptedSessionKey)} />
          ))}
          {message ? (
            <>
              <Row label="message.ciphertext" value={toBase64(message.ciphertext)} flag={tampered ? '1 bit flipped' : undefined} />
              <Row label="message.iv / auth_tag" value={`${toBase64(message.iv)} / ${toBase64(message.authTag)}`} />
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No messages yet.</p>
          )}
        </dl>
        {message && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="cs-chip" onClick={serverRead} disabled={busy !== null}>
              <UnlockOutlined className="mr-1" aria-hidden /> {busy === 'server' ? 'Guessing…' : 'Try to read it'}
            </button>
            <button type="button" className="cs-chip" onClick={tamper} disabled={tampered}>
              Flip one bit
            </button>
          </div>
        )}
        {server && (
          <ul>
            <StatusLine level={server.level}>{server.text}</StatusLine>
          </ul>
        )}
      </Panel>

      <Panel title="Bob’s browser">
        <p className="font-mono text-xs text-[var(--text-muted)]">key {bobRecord.print}</p>
        <label className="block">
          <span className="cs-label">Bob’s password</span>
          <input className="cs-select mt-1 font-mono" value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} />
        </label>
        <button type="button" className="btn-hacker btn-sm inline-flex items-center justify-center gap-2" onClick={unlock} disabled={!message || busy !== null}>
          <UnlockOutlined aria-hidden /> {busy === 'bob' ? `Deriving key…` : 'Unlock & read'}
        </button>
        {bob ? (
          <ul>
            <StatusLine level={bob.level}>{bob.text}</StatusLine>
          </ul>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">{message ? 'A message is waiting. Unlock to read it.' : 'Waiting for a message…'}</p>
        )}
        <p className="mt-auto text-xs text-[var(--text-muted)]">
          Password → PBKDF2 ({ROUNDS} rounds) → unwraps RSA-OAEP private key → unwraps session key → decrypts.
        </p>
      </Panel>
    </div>
  )
}
