import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchAiSkill, fetchAllAiSkillParams } from '../../../lib/queries'
import type { AiSkillData } from '../../../lib/queries'
import { aiSkillToMarkdown } from '../../../lib/portableTextToMarkdown'
import { preprocessBody } from '../../../lib/preprocessBody'
import { extractTocItems, estimateReadingMinutes } from '../../../lib/toc'
import { ArticleBody } from '../../../components/article/ArticleBody'
import { ArticleBanner } from '../../../components/article/ArticleBanner'
import { CopyMarkdownButtons } from '../../../components/article/CopyMarkdownButtons'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { RelatedSkillsSection } from '../../../components/article/RelatedSkillsSection'
import { SkillArtifact } from '../../../components/ai-skills/SkillArtifact'
import { LastTestedChip, SkillTypeBadge, TargetModelList, modelLabel } from '../../../components/ai-skills/SkillMeta'
import { TocRegistrar, TableOfContentsMobile } from '../../../components/layout/TocContext'
import { Avatar, Avatars } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { Pill } from '../../../components/ui/Pill'
import styles from '../../../components/ai-skills/AiSkillDetail.module.css'

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

function outcomeTone(outcome: string | null): 'good' | 'warn' | 'bad' | 'neutral' {
  const normalized = outcome?.toLowerCase().trim()
  if (normalized === 'passed') return 'good'
  if (normalized === 'partial') return 'warn'
  if (normalized === 'failed') return 'bad'
  return 'neutral'
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return fetchAllAiSkillParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const skill = await fetchAiSkill(slug)
  if (!skill) return {}
  return { title: skill.title, description: skill.summary ?? skill.useCase ?? undefined }
}

function UseCase({ useCase }: { useCase: string | null }): React.JSX.Element | null {
  if (!useCase) return null

  return (
    <div className={styles.useCase}>
      <span className={styles.useCaseLabel}>Use case</span>
      <span className={styles.useCaseText}>{useCase}</span>
    </div>
  )
}

function Prerequisites({ prerequisites }: { prerequisites: string | null }): React.JSX.Element | null {
  if (!prerequisites) return null

  return (
    <div className="hb-callout hb-callout--info" id="forutsetninger" role="note">
      <span className="hb-callout__icon"><Icon name="info" size={16} /></span>
      <div className="hb-callout__title">Prerequisites</div>
      <div className="hb-callout__body">{prerequisites}</div>
    </div>
  )
}

function TestedWith({ testedWith }: { testedWith: AiSkillData['testedWith'] }): React.JSX.Element | null {
  if (testedWith.length === 0) return null

  const latest = testedWith.map((entry) => entry.date).filter(Boolean).sort().at(-1) ?? null

  return (
    <section id="testet" className={styles.testedSection}>
      <div className={styles.testedHead}>
        <h2 className={styles.testedTitle}>Tested with</h2>
        <span className="hb-meta__txt">
          {testedWith.length} runs{latest ? ` - latest ${formatDate(latest)}` : ''}
        </span>
      </div>
      <div className={styles.tested}>
        <div className={`${styles.testedRow} ${styles.testedRowHead}`}>
          <div>Model</div>
          <div>Date</div>
          <div>Outcome</div>
          <div>Notes</div>
        </div>
        {testedWith.map((test, index) => (
          <div className={styles.testedRow} key={`${test.model}-${test.date ?? index}`}>
            <div className={styles.testedModel}>{test.model ? modelLabel(test.model) : 'Unknown model'}</div>
            <div className={styles.testedDate}>{formatDate(test.date)}</div>
            <div className={styles.testedOutcome} data-tone={outcomeTone(test.outcome)}>
              {test.outcome && <span className={styles.testedDot} aria-hidden="true" />}
              {test.outcome ?? ''}
            </div>
            <div className={styles.testedNotes}>{test.notes ?? ''}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RelatedContent({ skill }: { skill: AiSkillData }): React.JSX.Element | null {
  const hasArticles = skill.relatedArticles.length > 0
  const hasGuides = skill.relatedGuides.length > 0
  if (!hasArticles && !hasGuides) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <Icon name="bookOpen" size={16} />
        <h2>Related reading</h2>
      </div>
      <div className={styles.relatedList}>
        {skill.relatedArticles.map((article) => (
          <Link key={article._id} href={`/${article.section.slug}/${article.slug}`} className={styles.relatedLink}>
            <span><strong>{article.title}</strong></span>
          </Link>
        ))}
        {skill.relatedGuides.map((guide) => (
          <Link key={guide._id} href={`/guides/${guide.slug}`} className={styles.relatedLink}>
            <span><strong>{guide.title}</strong></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function AiSkillPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<React.JSX.Element> {
  const { slug } = await params
  const skill = await fetchAiSkill(slug)
  if (!skill) notFound()

  const tocItems = extractTocItems(skill.body)
  const readingMinutes = estimateReadingMinutes(skill.body ?? [])
  const expertises = skill.expertises ?? []
  const contributors = skill.contributors ?? []
  const body = await preprocessBody(skill.body ?? [])
  const markdown = aiSkillToMarkdown(skill)

  return (
    <article>
      <TocRegistrar items={tocItems} readingMinutes={readingMinutes} />

      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      <div className="hb-meta">
        <SkillTypeBadge kind={skill.skillType} />
        <MaturityBadge maturity={skill.maturity} />
        <TargetModelList models={skill.targetModel ?? []} />
        {expertises.map((expertise) => (
          <Pill key={expertise._id}>{expertise.title}</Pill>
        ))}
        <span style={{ flex: 1 }} />
        <LastTestedChip testedWith={skill.testedWith ?? []} />
        {skill.lastVerifiedAt && (
          <span className="hb-meta__txt">- Verified {formatDate(skill.lastVerifiedAt)}</span>
        )}
        {contributors.length > 0 && (
          <Avatars title={`Bidratt av ${contributors.map((c) => c.name).join(', ')}`}>
            {contributors.map((contributor) => (
              <Avatar key={contributor._id} name={contributor.name} avatarUrl={contributor.avatarUrl} />
            ))}
          </Avatars>
        )}
      </div>

      <div className="hb-article__head">
        <h1>{skill.title}</h1>
        <div className="hb-article__actions">
          <CopyMarkdownButtons markdown={markdown} path={`/ai-skills/${slug}`} />
        </div>
      </div>

      {(skill.summary ?? skill.useCase) && (
        <p className="hb-article__lede">{skill.summary ?? skill.useCase}</p>
      )}

      <UseCase useCase={skill.useCase} />

      {skill.maturity === 'exploratory' && <ArticleBanner kind="exploratory" />}
      {skill.maturity === 'deprecated' && <ArticleBanner kind="deprecated" />}

      <Prerequisites prerequisites={skill.prerequisites} />
      <SkillArtifact skill={skill} />

      {body.length > 0 && (
        <section className={`${styles.section} ${styles.bodySection}`}>
          <ArticleBody body={body} />
        </section>
      )}

      <TestedWith testedWith={skill.testedWith ?? []} />
      <RelatedContent skill={skill} />
      <RelatedSkillsSection skills={skill.relatedSkills ?? []} />
    </article>
  )
}
