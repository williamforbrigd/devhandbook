import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchSection, fetchSectionArticles } from '../../lib/queries'
import { ArticleCard } from '../../components/article/ArticleCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const s = await fetchSection(section)
  return { title: s?.title ?? section }
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<React.JSX.Element> {
  const { section } = await params
  const [sectionData, articles] = await Promise.all([
    fetchSection(section),
    fetchSectionArticles(section),
  ])
  if (!sectionData) notFound()

  const byMaturity = {
    established: articles.filter((a) => a.maturity === 'established'),
    recommended:  articles.filter((a) => a.maturity === 'recommended'),
    exploratory:  articles.filter((a) => a.maturity === 'exploratory'),
    deprecated:   articles.filter((a) => a.maturity === 'deprecated'),
  }

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        {sectionData.title}
      </h1>
      {sectionData.description && (
        <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
          {sectionData.description}
        </p>
      )}

      {articles.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)' }}>No articles yet.</p>
      )}

      {(['established', 'recommended', 'exploratory', 'deprecated'] as const).map((m) => {
        const group = byMaturity[m]
        if (group.length === 0) return null
        return (
          <section key={m} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.map((article) => (
                <ArticleCard key={article._id} article={article} section={section} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
