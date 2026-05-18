import React from 'react'
import { Icon } from '../ui/Icon'

/**
 * Banner shown on guides marked as a living document — communicates that the
 * content evolves and invites contribution.
 *
 * Uses the shared `.hb-artbanner--living` design-system variant so it sits
 * alongside the exploratory/deprecated article banners.
 */
export function LivingDocBanner({
  title = 'Levende dokument.',
  message = 'Denne guiden oppdateres etter hvert som mønsteret modnes. Bidra gjerne.',
}: {
  title?: string
  message?: string
}): React.JSX.Element {
  return (
    <div className="hb-artbanner hb-artbanner--living" role="note">
      <Icon name="edit" size={16} />
      <div className="hb-artbanner__body">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}
