export const PERMISSIONS = [
  'applications:view',
  'documents:request',
  'underwriting:edit',
  'decisions:recommend',
  'decisions:approve',
  'closing:schedule',
  'closing:sign-off',
  'users:manage',
] as const
export type Permission = (typeof PERMISSIONS)[number]

export const ROLES = ['underwriter', 'admin', 'credit-manager', 'closer'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABEL: Record<Role, string> = {
  underwriter: 'Underwriter',
  admin: 'Admin',
  'credit-manager': 'Credit manager',
  closer: 'Closer',
}

interface RoleDef {
  inherits?: Role[]
  grants: Permission[]
}

/** Each role lists only what it adds; everything else comes from the roles it inherits. */
export const ROLE_DEFS: Record<Role, RoleDef> = {
  underwriter: { grants: ['applications:view', 'documents:request', 'underwriting:edit', 'decisions:recommend'] },
  'credit-manager': { inherits: ['underwriter'], grants: ['decisions:approve'] },
  closer: { grants: ['applications:view', 'documents:request', 'closing:schedule', 'closing:sign-off'] },
  admin: { inherits: ['credit-manager', 'closer'], grants: ['users:manage'] },
}

/** Depth-first over the inheritance graph, own grants first, so the nearest granting role wins. */
function walk(role: Role, defs: Record<Role, RoleDef>, visit: (r: Role) => boolean | void, path: Role[] = []): boolean {
  if (path.includes(role)) throw new Error(`Role inheritance cycle: ${[...path, role].join(' → ')}`)
  if (visit(role)) return true
  return (defs[role].inherits ?? []).some((parent) => walk(parent, defs, visit, [...path, role]))
}

export function permissionsFor(role: Role, defs: Record<Role, RoleDef> = ROLE_DEFS): Set<Permission> {
  const out = new Set<Permission>()
  walk(role, defs, (r) => {
    for (const p of defs[r].grants) out.add(p)
  })
  return out
}

/** Which role grants a permission, for explaining why a check passed. */
export function grantedBy(role: Role, permission: Permission, defs: Record<Role, RoleDef> = ROLE_DEFS): Role | undefined {
  let found: Role | undefined
  walk(role, defs, (r) => {
    if (defs[r].grants.includes(permission)) found = r
    return found !== undefined
  })
  return found
}

export function can(role: Role, permission: Permission): boolean {
  return permissionsFor(role).has(permission)
}
