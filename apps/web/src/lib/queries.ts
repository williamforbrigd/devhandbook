import { client } from './sanity'

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
  _type: 'navItem'
  article: {
    _id: string
    title: string
    slug: string
    section: { slug: string }
    expertises: string[]
    maturity: string
  } | null
}

export interface NavGroup {
  _type: 'navGroupL1' | 'navGroupL2' | 'navGroupL3'
  title: string
  items: (NavItem | NavGroup)[]
}

export interface NavigationData {
  groups: NavGroup[]
}

const navItemProjection = `{
  _type,
  article->{
    _id,
    title,
    "slug": slug.current,
    "section": section->{ "slug": slug.current },
    "expertises": expertises[]->slug.current,
    maturity
  }
}`

const navGroupL3Projection = `{
  _type,
  title,
  "items": items[]{ _type == "navItem" => ${navItemProjection} }
}`

const navGroupL2Projection = `{
  _type,
  title,
  "items": items[]{
    _type == "navItem" => ${navItemProjection},
    _type == "navGroupL3" => ${navGroupL3Projection}
  }
}`

export const navigationQuery = `*[_type == "hb.navigation" && _id == "navigation-singleton"][0]{
  "groups": groups[]{
    _type,
    title,
    "items": items[]{
      _type == "navItem" => ${navItemProjection},
      _type == "navGroupL2" => ${navGroupL2Projection}
    }
  }
}`

export async function fetchNavigation(): Promise<NavigationData | null> {
  return client.fetch<NavigationData | null>(navigationQuery, {}, { next: { revalidate: 60 } })
}

// ── Expertises ────────────────────────────────────────────────────────────────

export interface Expertise {
  _id: string
  title: string
  slug: string
}

export const allExpertisesQuery = `*[_type == "hb.expertise"] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`

export async function fetchExpertises(): Promise<Expertise[]> {
  return client.fetch<Expertise[]>(allExpertisesQuery, {}, { next: { revalidate: 3600 } })
}
