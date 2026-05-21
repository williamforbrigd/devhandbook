'use client'

import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { ConceptModel } from '../portable-text/ConceptModel'
import { baseBodyComponents } from '../portable-text/bodyComponents'

// ── Component map ─────────────────────────────────────────────────────────────

const components: PortableTextComponents = {
  ...baseBodyComponents,
  types: {
    ...baseBodyComponents.types,
    'hb.conceptModel': ConceptModel,
  },
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleBody({ body }: { body: any[] }): React.JSX.Element {
  return (
    <div className="prose">
      <PortableText value={body} components={components} />
    </div>
  )
}

