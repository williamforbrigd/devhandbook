import Link from 'next/link'
import type { MethodData, MethodListItem } from '../../lib/queries'
import { Icon } from '../ui/Icon'

function siblingHref(method: MethodListItem): string {
  return `/methods/${method.domain.slug}/${method.slug}`
}

export function MethodPager({ method }: { method: MethodData }): React.JSX.Element | null {
  const siblings = method.parent?.subMethods ?? []
  if (siblings.length === 0) return null

  const currentIndex = siblings.findIndex((sibling) => sibling._id === method._id)
  if (currentIndex < 0) return null

  const previous = siblings[currentIndex - 1]
  const next = siblings[currentIndex + 1]
  if (!previous && !next) return null

  return (
    <nav className="hb-method-pager" aria-label="Sibling methods">
      {previous && (
        <Link href={siblingHref(previous)} className="hb-method-pager__link">
          <Icon name="chevronRight" size={13} className="hb-method-pager__prev" />
          <span className="hb-method-pager__text">
            <span className="hb-method-pager__kicker">Previous</span>
            <span className="hb-method-pager__title">{previous.title}</span>
          </span>
        </Link>
      )}
      {next && (
        <Link href={siblingHref(next)} className="hb-method-pager__link">
          <span className="hb-method-pager__text">
            <span className="hb-method-pager__kicker">Next</span>
            <span className="hb-method-pager__title">{next.title}</span>
          </span>
          <Icon name="chevronRight" size={13} />
        </Link>
      )}
    </nav>
  )
}