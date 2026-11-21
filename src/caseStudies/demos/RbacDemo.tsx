import { CheckOutlined, LockOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAnnounce } from '../../a11y/announce'
import { PERMISSIONS, ROLES, ROLE_LABEL, can, grantedBy, permissionsFor, type Permission, type Role } from '../logic/rbac'

const ACTIONS: { label: string; needs: Permission }[] = [
  { label: 'Edit credit memo', needs: 'underwriting:edit' },
  { label: 'Recommend decision', needs: 'decisions:recommend' },
  { label: 'Approve loan', needs: 'decisions:approve' },
  { label: 'Schedule closing', needs: 'closing:schedule' },
  { label: 'Sign off closing', needs: 'closing:sign-off' },
  { label: 'Manage users', needs: 'users:manage' },
]

export default function RbacDemo() {
  const [role, setRole] = useState<Role>('underwriter')
  const announce = useAnnounce()

  const choose = (next: Role) => {
    setRole(next)
    announce(`${ROLE_LABEL[next]}: ${permissionsFor(next).size} of ${PERMISSIONS.length} permissions`)
  }

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Signed in as" className="flex flex-wrap items-center gap-2">
        <span className="cs-label mr-1">Signed in as</span>
        {ROLES.map((r) => (
          <button key={r} type="button" className="cs-chip" aria-pressed={role === r} onClick={() => choose(r)}>
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      <div className="cs-panel">
        <p className="cs-label mb-3">What the UI renders</p>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => {
            const allowed = can(role, a.needs)
            return (
              <button key={a.needs} type="button" className="cs-chip" disabled={!allowed} title={allowed ? undefined : `Needs ${a.needs}`}>
                {allowed ? <CheckOutlined className="mr-1" aria-hidden /> : <LockOutlined className="mr-1" aria-hidden />}
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      <table className="w-full text-sm">
        <caption className="sr-only">Permissions for the {ROLE_LABEL[role]} role</caption>
        <thead>
          <tr className="cs-label text-left">
            <th className="py-1 font-normal">Permission</th>
            <th className="py-1 font-normal">Granted by</th>
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((p) => {
            const from = grantedBy(role, p)
            return (
              <tr key={p} className="border-t border-[var(--border)]">
                <td className={`py-1.5 font-mono ${from ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}`}>{p}</td>
                <td className="py-1.5 text-[var(--text-secondary)]">
                  {from ? (from === role ? ROLE_LABEL[from] : `${ROLE_LABEL[from]} (inherited)`) : <span className="text-[var(--text-muted)]">No</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <pre className="cs-code">{`can('${role}', 'decisions:approve')  // → ${can(role, 'decisions:approve')}`}</pre>
    </div>
  )
}
