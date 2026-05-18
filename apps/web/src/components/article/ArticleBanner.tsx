import React from 'react'
import Link from 'next/link'
import { Icon } from '../ui/Icon'

/**
 * Maturity-based article banner. Use on top of article body when an article's
 * maturity is `exploratory` or `deprecated` to set reader expectations.
 *
 * For `deprecated`, optionally pass a `supersededBy` link to point readers at
 * the current recommendation.
 */
export type ArticleBannerKind = 'exploratory' | 'deprecated'

export interface ArticleBannerProps {
  kind: ArticleBannerKind
  /** Optional pointer for deprecated articles. */
  supersededBy?: { title: string; href: string } | null
  /** Override the default title (bolded). */
  title?: string
  /** Override the default message. */
  message?: React.ReactNode
}

export function ArticleBanner({
  kind,
  supersededBy,
  title,
  message,
}: ArticleBannerProps): React.JSX.Element | null {
  if (kind === 'exploratory') {
    return (
      <div className="hb-artbanner hb-artbanner--exp" role="note">
        <Icon name="sparkles" size={16} />
        <div className="hb-artbanner__body">
          <strong>{title ?? 'Under utforskning.'}</strong>
          <span>
            {message ??
              'Dette mønsteret er under utforskning. Del gjerne erfaringer.'}
          </span>
        </div>
      </div>
    )
  }

  if (kind === 'deprecated') {
    return (
      <div className="hb-artbanner hb-artbanner--dep" role="note">
        <Icon name="archive" size={16} />
        <div className="hb-artbanner__body">
          <strong>{title ?? 'Denne anbefalingen er utdatert.'}</strong>
          <span>
            {message ??
              (supersededBy ? (
                <>
                  Se <Link href={supersededBy.href}>{supersededBy.title} →</Link>{' '}
                  istedenfor.
                </>
              ) : (
                'Se nyere artikler for gjeldende anbefaling.'
              ))}
          </span>
        </div>
      </div>
    )
  }

  return null
}
