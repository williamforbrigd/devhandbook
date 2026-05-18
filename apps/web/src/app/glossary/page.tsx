import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { fetchGlossary } from '../../lib/queries'
import { EmptyState } from '../../components/ui/EmptyState'
import { AlphaNav, CopyEntryLink } from './GlossaryClient'

export const metadata: Metadata = { title: 'Glossary' }

export default async function GlossaryPage(): Promise<React.JSX.Element> {
  const terms = await fetchGlossary()

  // Group alphabetically
  const byLetter = terms.reduce<Record<string, typeof terms>>((acc, t) => {
    const letter = t.term.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter]!.push(t)
    return acc
  }, {})
  const letters = Object.keys(byLetter).sort()
  const activeLetters = new Set(letters)

  return (
    <div className="hb-glossary">
      <h1>Glossary</h1>
      <p className="hb-glossary__lede">
        Fagbegreper og definisjoner brukt i håndboken.
      </p>

      {letters.length > 0 && (
        <AlphaNav activeLetters={activeLetters} active={letters[0]} />
      )}

      {terms.length === 0 && (
        <EmptyState
          icon="bookOpen"
          title="Ingen oppslag i ordlisten ennå."
          body="Bidra gjerne — legg til begreper i Sanity Studio."
        />
      )}

      {letters.map((letter) => (
        <div
          key={letter}
          id={`letter-${letter}`}
          className="hb-gl__group"
          style={{ scrollMarginTop: 'calc(var(--header-height, 64px) + 16px)' }}
        >
          <div className="hb-gl__letter">{letter}</div>
          {byLetter[letter]!.map((term) => (
            <div
              key={term._id}
              id={term.slug}
              className="hb-gl__entry"
              style={{ scrollMarginTop: 'calc(var(--header-height, 64px) + 16px)' }}
            >
              <div className="hb-gl__term">
                {term.term}
                <CopyEntryLink slug={term.slug} />
              </div>
              <div className="hb-gl__def">
                {term.definition?.length > 0 ? (
                  <PortableText value={term.definition} />
                ) : (
                  <span style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    Ingen definisjon ennå.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
