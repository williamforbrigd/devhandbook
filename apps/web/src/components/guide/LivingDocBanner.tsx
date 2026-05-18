import React from 'react'
import { Icon } from '../ui/Icon'

/**
 * Banner shown on guides marked as a living document — communicates that the
 * content evolves and invites contribution.
 */
export function LivingDocBanner({
  title = 'Levende dokument.',
  message = 'Denne guiden oppdateres etter hvert som mønsteret modnes. Bidra gjerne.',
}: {
  title?: string
  message?: string
}): React.JSX.Element {
  return (
    <div className="hb-livingdoc" role="note">
      <span className="hb-livingdoc__icon" aria-hidden="true">
        <Icon name="edit" size={14} />
      </span>
      <span>
        <strong>{title}</strong> {message}
      </span>
    </div>
  )
}
