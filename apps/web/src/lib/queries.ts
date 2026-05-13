import { sanityFetch } from './live'

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
  "items": items[_type == "navItem"]${navItemProjection}
}`

const navGroupL2Projection = `{
  _type,
  title,
  "items": items[_type in ["navItem", "navGroupL3"]]{
    _type == "navItem" => ${navItemProjection},
    _type == "navGroupL3" => ${navGroupL3Projection}
  }
}`

export const navigationQuery = `*[_type == "hb.navigation" && _id == "navigation-singleton"][0]{
  "groups": groups[]{
    _type,
    title,
    "items": items[_type in ["navItem", "navGroupL2"]]{
      _type == "navItem" => ${navItemProjection},
      _type == "navGroupL2" => ${navGroupL2Projection}
    }
  }
}`

export async function fetchNavigation(): Promise<NavigationData | null> {
  const { data } = await sanityFetch({ query: navigationQuery })
  return data as NavigationData | null
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
  const { data } = await sanityFetch({ query: allExpertisesQuery })
  return (data as Expertise[]) ?? []
}

// ── Article ───────────────────────────────────────────────────────────────────

export type Maturity = 'established' | 'recommended' | 'exploratory' | 'deprecated'

export interface Contributor {
  _id: string
  name: string
  avatarUrl: string | null
}

export interface ArticleData {
  _id: string
  title: string
  slug: string
  summary: string | null
  maturity: Maturity
  lastVerifiedAt: string | null
  expertises: { _id: string; title: string; slug: string }[]
  contributors: Contributor[]
  supersededBy: { title: string; slug: string; section: { slug: string } } | null
  relatedArticles: { _id: string; title: string; slug: string; section: { slug: string } }[]
  // body is untyped — rendered via @portabletext/react
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any[]
}

export const articleQuery = `*[_type == "hb.article"
  && slug.current == $slug
  && section->slug.current == $section
  && hidden != true
][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  maturity,
  lastVerifiedAt,
  "expertises": expertises[]->{_id, title, "slug": slug.current},
  "contributors": contributors[]->{
    _id,
    name,
    "avatarUrl": avatar.asset->url
  },
  "supersededBy": supersededBy->{
    title,
    "slug": slug.current,
    "section": section->{"slug": slug.current}
  },
  "relatedArticles": relatedArticles[]->{
    _id,
    title,
    "slug": slug.current,
    "section": section->{"slug": slug.current}
  },
  body
}`

export const articleBySlugQuery = articleQuery

export async function fetchArticle(
  section: string,
  slug: string,
): Promise<ArticleData | null> {
  const { data } = await sanityFetch({ query: articleQuery, params: { section, slug } })
  return data as ArticleData | null
}

export const allArticleParamsQuery = `*[_type == "hb.article" && hidden != true && defined(slug) && defined(section->slug)]{
  "slug": slug.current,
  "section": section->slug.current
}`

export async function fetchAllArticleParams(): Promise<{ section: string; slug: string }[]> {
  const { data } = await sanityFetch({ query: allArticleParamsQuery })
  return (data as { section: string; slug: string }[]) ?? []
}

// ── Section listing ───────────────────────────────────────────────────────────

export interface SectionData {
  _id: string
  title: string
  slug: string
  description: string | null
}

export interface ArticleListItem {
  _id: string
  title: string
  slug: string
  summary: string | null
  maturity: Maturity
  expertises: { title: string; slug: string }[]
  lastVerifiedAt: string | null
}

export const sectionQuery = `*[_type == "hb.section" && slug.current == $section][0]{
  _id, title, "slug": slug.current, description
}`

export const sectionBySlugQuery = sectionQuery

export const sectionArticlesQuery = `*[_type == "hb.article"
  && section->slug.current == $section
  && hidden != true
] | order(title asc) {
  _id, title,
  "slug": slug.current,
  summary, maturity,
  "expertises": expertises[]->{title, "slug": slug.current},
  lastVerifiedAt
}`

export async function fetchSection(section: string): Promise<SectionData | null> {
  const { data } = await sanityFetch({ query: sectionQuery, params: { section } })
  return data as SectionData | null
}

export async function fetchSectionArticles(section: string): Promise<ArticleListItem[]> {
  const { data } = await sanityFetch({ query: sectionArticlesQuery, params: { section } })
  return (data as ArticleListItem[]) ?? []
}

// ── Guides ────────────────────────────────────────────────────────────────────

export interface GuideListItem {
  _id: string
  title: string
  slug: string
  summary: string | null
  maturity: Maturity
  expertises: { title: string; slug: string }[]
}

export const guidesQuery = `*[_type == "hb.guide"] | order(title asc) {
  _id, title,
  "slug": slug.current,
  summary, maturity,
  "expertises": expertises[]->{title, "slug": slug.current}
}`

export async function fetchGuides(): Promise<GuideListItem[]> {
  const { data } = await sanityFetch({ query: guidesQuery })
  return (data as GuideListItem[]) ?? []
}

// ── Glossary ──────────────────────────────────────────────────────────────────

export interface GlossaryTermItem {
  _id: string
  term: string
  slug: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: any[]
}

export const glossaryQuery = `*[_type == "hb.glossaryTerm"] | order(term asc) {
  _id, term,
  "slug": slug.current,
  definition
}`

export async function fetchGlossary(): Promise<GlossaryTermItem[]> {
  const { data } = await sanityFetch({ query: glossaryQuery })
  return (data as GlossaryTermItem[]) ?? []
}

// ── Principles ────────────────────────────────────────────────────────────────

export interface PrincipleItem {
  _id: string
  title: string
  slug: string
  statement: string
}

export const principlesQuery = `*[_type == "hb.principle"] | order(title asc) {
  _id, title,
  "slug": slug.current,
  statement
}`

export async function fetchPrinciples(): Promise<PrincipleItem[]> {
  const { data } = await sanityFetch({ query: principlesQuery })
  return (data as PrincipleItem[]) ?? []
}

// ── AI Skills ─────────────────────────────────────────────────────────────────

export interface AiSkillListItem {
  _id: string
  title: string
  slug: string
  summary: string | null
  useCase: string | null
  maturity: Maturity
  skillType: 'prompt' | 'workflow' | 'evaluation'
  targetModel: string[]
  expertises: { title: string; slug: string }[]
}

export interface AiSkillFilterParams {
  skillType?: string | null
  expertise?: string | null
  targetModel?: string | null
  maturity?: string | null
}

export interface AiSkillData {
  _id: string
  title: string
  slug: string
  summary: string | null
  useCase: string | null
  prerequisites: string | null
  maturity: Maturity
  skillType: 'prompt' | 'workflow' | 'evaluation'
  targetModel: string[]
  expertises: { _id: string; title: string; slug: string }[]
  contributors: Contributor[]
  lastVerifiedAt: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any[]
  promptArtifact: {
    systemPrompt: { code: string } | null
    userPromptTemplate: { code: string } | null
    variables: { name: string; description: string | null; example: string | null }[]
  } | null
  workflowArtifact: {
    steps: { title: string; prompt: string | null; expectedOutput: string | null; notes: string | null }[]
  } | null
  evaluationArtifact: {
    criteria: { label: string; description: string | null; scoringGuide: string | null }[]
    rubric: string | null
  } | null
  testedWith: { model: string; date: string | null; outcome: string | null; notes: string | null }[]
  relatedArticles: { _id: string; title: string; slug: string; section: { slug: string } }[]
  relatedGuides: { _id: string; title: string; slug: string }[]
  relatedSkills: { _id: string; title: string; slug: string; skillType: string; maturity: Maturity }[]
}

/** Filterable list query — pass null for any param to skip that filter */
export const allAiSkillsQuery = `*[_type == "hb.aiSkill"
  && hidden != true
  && (!defined($skillType) || skillType == $skillType)
  && (!defined($maturity) || maturity == $maturity)
  && (!defined($targetModel) || $targetModel in targetModel)
  && (!defined($expertise) || $expertise in expertises[]->slug.current)
] | order(title asc) {
  _id, title,
  "slug": slug.current,
  summary, useCase, maturity, skillType, targetModel,
  "expertises": expertises[]->{title, "slug": slug.current}
}`

/** Alias kept for backwards-compat */
export const aiSkillsQuery = allAiSkillsQuery

export const aiSkillBySlugQuery = `*[_type == "hb.aiSkill" && slug.current == $slug && hidden != true][0]{
  _id, title,
  "slug": slug.current,
  summary, useCase, prerequisites,
  maturity, skillType, targetModel,
  "expertises": expertises[]->{_id, title, "slug": slug.current},
  "contributors": contributors[]->{_id, name, "avatarUrl": avatar.asset->url},
  lastVerifiedAt,
  body,
  promptArtifact,
  workflowArtifact,
  evaluationArtifact,
  "testedWith": testedWith[]{model, date, outcome, notes},
  "relatedArticles": relatedArticles[]->{
    _id, title, "slug": slug.current,
    "section": section->{"slug": slug.current}
  },
  "relatedGuides": relatedGuides[]->{_id, title, "slug": slug.current},
  "relatedSkills": relatedSkills[]->{_id, title, "slug": slug.current, skillType, maturity}
}`

export async function fetchAiSkills(filters: AiSkillFilterParams = {}): Promise<AiSkillListItem[]> {
  const { data } = await sanityFetch({
    query: allAiSkillsQuery,
    params: {
      skillType: filters.skillType ?? null,
      maturity: filters.maturity ?? null,
      targetModel: filters.targetModel ?? null,
      expertise: filters.expertise ?? null,
    },
  })
  return (data as AiSkillListItem[]) ?? []
}

export async function fetchAiSkill(slug: string): Promise<AiSkillData | null> {
  const { data } = await sanityFetch({ query: aiSkillBySlugQuery, params: { slug } })
  return data as AiSkillData | null
}

// ── AI Collections ────────────────────────────────────────────────────────────

export interface AiCollectionItem {
  _id: string
  title: string
  slug: string
  description: string | null
  skills: { _id: string; title: string; slug: string; skillType: string; maturity: Maturity; summary: string | null }[]
  relatedGuides: { _id: string; title: string; slug: string }[]
}

export const aiCollectionsQuery = `*[_type == "hb.aiCollection"] | order(title asc) {
  _id, title,
  "slug": slug.current,
  description,
  "skills": skills[]->{
    _id, title, "slug": slug.current,
    skillType, maturity, summary
  },
  "relatedGuides": relatedGuides[]->{_id, title, "slug": slug.current}
}`

export async function fetchAiCollections(): Promise<AiCollectionItem[]> {
  const { data } = await sanityFetch({ query: aiCollectionsQuery })
  return (data as AiCollectionItem[]) ?? []
}
