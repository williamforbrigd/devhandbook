import Link from 'next/link'
import type { MethodData } from '../../lib/queries'
import { Icon } from '../ui/Icon'

export function MethodBreadcrumb({ method }: { method: MethodData }): React.JSX.Element {
  const parent = method.parent
  const crumbs = [
    { href: '/methods', label: 'Methods' },
    { href: `/methods/${method.domain.slug}`, label: method.domain.title },
    ...(parent ? [{ href: `/methods/${parent.domain.slug}/${parent.slug}`, label: parent.title }] : []),
  ]

  return (
    <nav className="hb-crumb hb-method-crumb" aria-label="Method breadcrumb">
      <Link href="/" className="hb-crumb__home" aria-label="Home">
        <Icon name="home" size={16} />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="hb-method-crumb__item">
          <span className="hb-crumb__sep">
            <Icon name="chevronRight" size={14} />
          </span>
          <Link href={crumb.href} className="hb-crumb__step">
            <span className="hb-crumb__dot" />
            {crumb.label}
          </Link>
        </span>
      ))}
      <span className="hb-method-crumb__item">
        <span className="hb-crumb__sep">
          <Icon name="chevronRight" size={14} />
        </span>
        <span className="hb-crumb__step is-current">
          <span className="hb-crumb__dot" />
          {method.title}
        </span>
      </span>
    </nav>
  )
}