import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchDomain, fetchDomainMethods } from '../../../lib/queries'
import { MethodCard } from '../../../components/method/MethodCard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const { domain } = await params
  const domainData = await fetchDomain(domain)
  return { title: domainData?.title ?? domain }
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<React.JSX.Element> {
  const { domain } = await params
  const [domainData, methods] = await Promise.all([
    fetchDomain(domain),
    fetchDomainMethods(domain),
  ])

  if (!domainData) notFound()

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        {domainData.title}
      </h1>
      {domainData.description && (
        <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
          {domainData.description}
        </p>
      )}

      {methods.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No methods yet.</p>}

      <div className="hb-method-list">
        {methods.map((method) => (
          <MethodCard key={method._id} method={method} />
        ))}
      </div>
    </div>
  )
}