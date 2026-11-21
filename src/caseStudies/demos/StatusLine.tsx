import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons'
import type { ReactNode } from 'react'

export type StatusLevel = 'ok' | 'warn' | 'error'

const ICON = { ok: CheckCircleFilled, warn: ExclamationCircleFilled, error: CloseCircleFilled }
const LABEL = { ok: 'Pass', warn: 'Warning', error: 'Problem' }

export function StatusLine({ level, children }: { level: StatusLevel; children: ReactNode }) {
  const Icon = ICON[level]
  return (
    <li className="cs-status" data-level={level}>
      <Icon className="cs-status-icon" aria-hidden />
      <span>
        <span className="sr-only">{LABEL[level]}: </span>
        {children}
      </span>
    </li>
  )
}
