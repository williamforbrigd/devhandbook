import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchAllMethodParams, fetchMethod } from '../../../../lib/queries'
import { methodToMarkdown } from '../../../../lib/portableTextToMarkdown'
import { preprocessBody } from '../../../../lib/preprocessBody'
import { ArticleBody } from '../../../../components/article/ArticleBody'
import { CopyMarkdownButtons } from '../../../../components/article/CopyMarkdownButtons'
import { TocRegistrar, TableOfContentsMobile } from '../../../../components/layout/TocContext'
import { extractTocItems, estimateReadingMinutes } from '../../../../lib/toc'
import { Pill } from '../../../../components/ui/Pill'
import { MethodBreadcrumb } from '../../../../components/method/MethodBreadcrumb'
import { MethodOverviewPanel } from '../../../../components/method/MethodOverviewPanel'
import { MethodPager } from '../../../../components/method/MethodPager'
import { MethodTypeBadge } from '../../../../components/method/MethodCard'

export async function generateStaticParams() {
  return fetchAllMethodParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>
}): Promise<Metadata> {
  const { domain, slug } = await params
  const method = await fetchMethod(domain, slug)
  if (!method) return {}
  return { title: method.title, description: method.summary ?? undefined }
}

export default async function MethodPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>
}): Promise<React.JSX.Element> {
  const { domain, slug } = await params
  const method = await fetchMethod(domain, slug)
  if (!method) notFound()

  const tocItems = extractTocItems(method.body)
  const readingMinutes = estimateReadingMinutes(method.body ?? [])
  const expertises = method.expertises ?? []
  const body = await preprocessBody(method.body ?? [])
  const markdown = methodToMarkdown(
    {
      title: method.title,
      slug: method.slug,
      domain: method.domain.slug,
      methodType: method.type,
      expertises: expertises.map((expertise) => expertise.title),
    },
    method.body ?? [],
  )

  return (
    <article className="hb-method-page">
      <TocRegistrar items={tocItems} readingMinutes={readingMinutes} />

      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      <MethodBreadcrumb method={method} />

      <div className="hb-meta">
        <MethodTypeBadge type={method.type} />
        <Pill>{method.domain.title}</Pill>
        {expertises.map((expertise) => (
          <Pill key={expertise.slug}>{expertise.title}</Pill>
        ))}
      </div>

      <div className="hb-article__head">
        <h1>{method.title}</h1>
        <div className="hb-article__actions hb-method-actions">
          <MethodPager method={method} />
          <CopyMarkdownButtons markdown={markdown} path={`/methods/${domain}/${slug}`} />
        </div>
      </div>

      <div className="hb-method-layout">
        <div className="hb-method-layout__body">
          {method.summary && <p className="hb-article__lede">{method.summary}</p>}
          <ArticleBody body={body} />
        </div>
        <MethodOverviewPanel method={method} />
      </div>
    </article>
  )
}