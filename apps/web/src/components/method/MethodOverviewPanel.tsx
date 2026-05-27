import Link from 'next/link'
import type { MethodData, MethodDocumentType, MethodListItem } from '../../lib/queries'
import { TemplateLink } from '../guide/TemplateLink'
import { Icon, type IconName } from '../ui/Icon'

const DOCUMENT_TYPE_LABEL: Record<MethodDocumentType, string> = {
  pdf: 'PDF',
  docx: 'Word document',
  xlsx: 'Excel workbook',
  pptx: 'PowerPoint presentation',
  link: 'Link',
  other: 'Resource',
}

const DOCUMENT_TYPE_ICON: Record<MethodDocumentType, IconName> = {
  pdf: 'fileText',
  docx: 'fileText',
  xlsx: 'fileText',
  pptx: 'fileText',
  link: 'external',
  other: 'fileText',
}

function MethodLinkList({
  title,
  methods,
}: {
  title: string
  methods: MethodListItem[]
}): React.JSX.Element | null {
  if (methods.length === 0) return null

  return (
    <section className="hb-method-panel__section">
      <h2>{title}</h2>
      <div className="hb-method-panel__links">
        {methods.map((method) => (
          <Link key={method._id} href={`/methods/${method.domain.slug}/${method.slug}`} className="hb-method-panel__method">
            <span>{method.title}</span>
            <Icon name="arrowRight" size={13} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function MethodOverviewPanel({ method }: { method: MethodData }): React.JSX.Element | null {
  const subMethods = method.subMethods ?? []
  const relatedMethods = method.relatedMethods ?? []
  const links = (method.links ?? []).filter((link) => link.title && link.url)

  if (subMethods.length === 0 && links.length === 0 && relatedMethods.length === 0) return null

  return (
    <aside className="hb-method-panel" aria-label="Method overview">
      <MethodLinkList title={method.subMethodsTitle || 'Sub-methods'} methods={subMethods} />

      {links.length > 0 && (
        <section className="hb-method-panel__section">
          <h2>Links</h2>
          <div className="hb-method-panel__resources">
            {links.map((link, index) => (
              <TemplateLink
                key={`${link.url}-${index}`}
                href={link.url}
                title={link.title}
                sub={DOCUMENT_TYPE_LABEL[link.documentType] ?? DOCUMENT_TYPE_LABEL.other}
                icon={DOCUMENT_TYPE_ICON[link.documentType] ?? DOCUMENT_TYPE_ICON.other}
              />
            ))}
          </div>
        </section>
      )}

      <MethodLinkList title="Related methods" methods={relatedMethods} />
    </aside>
  )
}