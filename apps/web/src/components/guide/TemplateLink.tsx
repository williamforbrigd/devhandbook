import React from 'react'
import { Icon, type IconName } from '../ui/Icon'

/**
 * Card linking to an external artifact / template (Figma, Miro, Markdown,
 * Notion, etc.). Used in the "Maler og ressurser" section of a guide.
 */
export function TemplateLink({
  href,
  title,
  sub,
  icon = 'fileText',
  external,
}: {
  href: string
  title: string
  sub?: string | null
  icon?: IconName
  external?: boolean
}): React.JSX.Element {
  const isExternal = external ?? /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      className="hb-tmpl"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <span className="hb-tmpl__icon">
        <Icon name={icon} size={18} />
      </span>
      <span className="hb-tmpl__txt">
        <span className="hb-tmpl__title">{title}</span>
        {sub && <span className="hb-tmpl__sub">{sub}</span>}
      </span>
      <span className="hb-tmpl__cta">
        <Icon name={isExternal ? 'external' : 'arrowRight'} size={14} />
      </span>
    </a>
  )
}
