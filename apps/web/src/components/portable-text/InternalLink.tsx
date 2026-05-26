import React from 'react'
import Link from 'next/link'

interface InternalLinkValue {
  article?: {
    _id: string
    title: string
    slug: string
    section: { slug: string } | null
  } | null
  guide?: {
    _id: string
    title: string
    slug: string
  } | null
  section?: {
    _id: string
    title: string
    slug: string
  } | null
  domain?: {
    _id: string
    title: string
    slug: string
  } | null
  method?: {
    _id: string
    title: string
    slug: string
    domain: { slug: string } | null
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
  const broken = <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{children}</span>

  if (value?.guide?.slug) {
    return <Link href={`/guides/${value.guide.slug}`}>{children}</Link>
  }

  if (value?.section?.slug) {
    return <Link href={`/${value.section.slug}`}>{children}</Link>
  }

  if (value?.domain?.slug) {
    return <Link href={`/methods/${value.domain.slug}`}>{children}</Link>
  }

  const method = value?.method
  const methodDomainSlug = method?.domain?.slug
  if (method?.slug && methodDomainSlug) {
    return <Link href={`/methods/${methodDomainSlug}/${method.slug}`}>{children}</Link>
  }

  const article = value?.article
  const sectionSlug = article?.section?.slug
  const articleSlug = article?.slug
  if (!article || !sectionSlug || !articleSlug) return broken

  return <Link href={`/${sectionSlug}/${articleSlug}`}>{children}</Link>
}
