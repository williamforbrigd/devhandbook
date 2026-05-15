import React from 'react'
import Link from 'next/link'

interface InternalLinkValue {
  article?: {
    _id: string
    title: string
    slug: string
    section: { slug: string } | null
  } | null
}

export function InternalLink({
  value,
  children,
}: {
  value?: InternalLinkValue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}): React.JSX.Element {
  const article = value?.article
  const section = article?.section?.slug
  const slug = article?.slug

  // If the reference couldn't be resolved, render plain text
  if (!article || !section || !slug) {
    return <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{children}</span>
  }

  return (
    <Link
      href={`/${section}/${slug}`}
      style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
    >
      {children}
    </Link>
  )
}
