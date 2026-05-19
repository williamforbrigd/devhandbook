import { client } from '../sanity'
import type { Maturity } from '../queries'

export type HandbookSearchResultType =
  | 'article'
  | 'guide'
  | 'glossary'
  | 'principle'
  | 'section'

export interface HandbookSearchResult {
  id: string
  type: HandbookSearchResultType
  title: string
  description: string | null
  href: string
  sectionTitle: string | null
  maturity: Maturity | null
  expertises: { title: string; slug: string }[]
  date: string | null
  matchText: string | null
}

export interface HandbookSearchResponse {
  query: string
  results: HandbookSearchResult[]
  total: number
}

const MIN_QUERY_LENGTH = 2
const DEFAULT_LIMIT = 8
const MAX_LIMIT = 50

const handbookSearchQuery = `{
  "articles": *[
    _type == "hb.article"
    && hidden != true
    && defined(slug.current)
    && defined(section->slug.current)
    && (
      title match $term
      || summary match $term
      || pt::text(body) match $term
      || section->title match $term
      || count(expertises[]->title[@ match $term]) > 0
    )
  ] | order(coalesce(lastVerifiedAt, _updatedAt) desc) [0...$limit] {
    "id": _id,
    "type": "article",
    title,
    "description": summary,
    "href": "/" + section->slug.current + "/" + slug.current,
    "sectionTitle": section->title,
    maturity,
    "expertises": expertises[]->{title, "slug": slug.current},
    "date": coalesce(lastVerifiedAt, _updatedAt),
    "matchText": select(summary match $term => summary, pt::text(body))
  },
  "guides": *[
    _type == "hb.guide"
    && hidden != true
    && defined(slug.current)
    && (
      title match $term
      || summary match $term
      || applicableWhen match $term
      || notApplicableWhen match $term
      || pt::text(body) match $term
      || count(expertises[]->title[@ match $term]) > 0
    )
  ] | order(coalesce(lastVerifiedAt, _updatedAt) desc) [0...$limit] {
    "id": _id,
    "type": "guide",
    title,
    "description": summary,
    "href": "/guides/" + slug.current,
    "sectionTitle": section->title,
    maturity,
    "expertises": expertises[]->{title, "slug": slug.current},
    "date": coalesce(lastVerifiedAt, _updatedAt),
    "matchText": select(summary match $term => summary, applicableWhen match $term => applicableWhen, pt::text(body))
  },
  "glossary": *[
    _type == "hb.glossaryTerm"
    && defined(slug.current)
    && (term match $term || pt::text(definition) match $term)
  ] | order(term asc) [0...$limit] {
    "id": _id,
    "type": "glossary",
    "title": term,
    "description": pt::text(definition),
    "href": "/glossary#" + slug.current,
    "sectionTitle": "Glossary",
    "maturity": null,
    "expertises": [],
    "date": _updatedAt,
    "matchText": pt::text(definition)
  },
  "principles": *[
    _type == "hb.principle"
    && defined(slug.current)
    && (title match $term || statement match $term || pt::text(rationale) match $term)
  ] | order(title asc) [0...$limit] {
    "id": _id,
    "type": "principle",
    title,
    "description": statement,
    "href": "/principles#" + slug.current,
    "sectionTitle": "Principles",
    "maturity": null,
    "expertises": [],
    "date": _updatedAt,
    "matchText": select(statement match $term => statement, pt::text(rationale))
  },
  "sections": *[
    _type == "hb.section"
    && defined(slug.current)
    && (title match $term || description match $term)
  ] | order(coalesce(order, 9999) asc, title asc) [0...$limit] {
    "id": _id,
    "type": "section",
    title,
    description,
    "href": "/" + slug.current,
    "sectionTitle": "Section",
    "maturity": null,
    "expertises": [],
    "date": _updatedAt,
    "matchText": description
  }
}`

interface SearchBuckets {
  articles?: HandbookSearchResult[]
  guides?: HandbookSearchResult[]
  glossary?: HandbookSearchResult[]
  principles?: HandbookSearchResult[]
  sections?: HandbookSearchResult[]
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ')
}

function toMatchTerm(query: string): string {
  return query
    .split(' ')
    .map((part) => `${part}*`)
    .join(' ')
}

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT)
}

function flattenBuckets(buckets: SearchBuckets, limit: number): HandbookSearchResult[] {
  return [
    ...(buckets.articles ?? []),
    ...(buckets.guides ?? []),
    ...(buckets.glossary ?? []),
    ...(buckets.principles ?? []),
    ...(buckets.sections ?? []),
  ].slice(0, limit)
}

export async function searchHandbookContent(
  query: string,
  limit?: number,
): Promise<HandbookSearchResponse> {
  const normalizedQuery = normalizeQuery(query)
  const normalizedLimit = normalizeLimit(limit)

  if (normalizedQuery.length < MIN_QUERY_LENGTH) {
    return { query: normalizedQuery, results: [], total: 0 }
  }

  const buckets = await client.fetch<SearchBuckets>(handbookSearchQuery, {
    term: toMatchTerm(normalizedQuery),
    limit: normalizedLimit,
  })

  const results = flattenBuckets(buckets, normalizedLimit)

  return {
    query: normalizedQuery,
    results,
    total: results.length,
  }
}