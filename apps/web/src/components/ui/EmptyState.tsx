import React from 'react'
import { Icon } from './Icon'

export interface EmptyStateProps {
  /** Icon name from the {@link Icon} set. Defaults to `fileText`. */
  icon?: string
  title: React.ReactNode
  body?: React.ReactNode
  /** Optional action area (e.g. a link or button). */
  action?: React.ReactNode
}

/**
 * Friendly empty-state block for zero-result lists, missing content, etc.
 * Mirrors the design system's `.hb-empty` markup.
 */
export function EmptyState({
  icon = 'fileText',
  title,
  body,
  action,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="hb-empty">
      <div className="hb-empty__icon" aria-hidden="true">
        <Icon name={icon} size={28} />
      </div>
      <div className="hb-empty__title">{title}</div>
      {body && <div className="hb-empty__body">{body}</div>}
      {action && <div className="hb-empty__action">{action}</div>}
    </div>
  )
}
