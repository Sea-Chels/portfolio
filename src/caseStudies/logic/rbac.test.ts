import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ROLE_DEFS, can, grantedBy, permissionsFor } from './rbac'

describe('rbac', () => {
  it('gives credit managers everything underwriters have, plus approval', () => {
    for (const p of permissionsFor('underwriter')) expect(can('credit-manager', p)).toBe(true)
    expect(can('credit-manager', 'decisions:approve')).toBe(true)
  })

  it('lets underwriters recommend but not approve', () => {
    expect(can('underwriter', 'decisions:recommend')).toBe(true)
    expect(can('underwriter', 'decisions:approve')).toBe(false)
  })

  it('keeps closers out of underwriting and decisions', () => {
    expect(can('closer', 'closing:sign-off')).toBe(true)
    expect(can('closer', 'underwriting:edit')).toBe(false)
    expect(can('closer', 'decisions:approve')).toBe(false)
  })

  it('gives admins every permission through both branches', () => {
    expect(permissionsFor('admin').size).toBe(PERMISSIONS.length)
  })

  it('reports the nearest role that granted a permission', () => {
    expect(grantedBy('admin', 'users:manage')).toBe('admin')
    expect(grantedBy('admin', 'decisions:approve')).toBe('credit-manager')
    expect(grantedBy('admin', 'closing:schedule')).toBe('closer')
    expect(grantedBy('admin', 'underwriting:edit')).toBe('underwriter')
    expect(grantedBy('closer', 'users:manage')).toBeUndefined()
  })

  it('fails loudly on an inheritance cycle', () => {
    const defs = { ...ROLE_DEFS, underwriter: { inherits: ['admin' as const], grants: [] } }
    expect(() => permissionsFor('admin', defs)).toThrow(/cycle/)
  })
})
