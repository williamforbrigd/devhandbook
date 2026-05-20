import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { fetchGlossary, type GlossaryTermItem } from '../../lib/queries'
import { EmptyState } from '../../components/ui/EmptyState'
import { AlphaNav, CopyEntryLink } from './GlossaryClient'
import styles from './glossary.module.css'

export const metadata: Metadata = { title: 'Glossary' }

const LETTER_PATTERN = /^[A-Å]$/

function getTermLetter(term: string): string {
  const firstLetter = term.trim().charAt(0).toLocaleUpperCase('nb-NO')
  return LETTER_PATTERN.test(firstLetter) ? firstLetter : '#'
}

function groupGlossaryTerms(terms: GlossaryTermItem[]): Record<string, GlossaryTermItem[]> {
  return terms.reduce<Record<string, GlossaryTermItem[]>>((groups, term) => {
    if (!term.term?.trim() || !term.slug) return groups

    const letter = getTermLetter(term.term)
    groups[letter] ??= []
    groups[letter]!.push(term)
    return groups
  }, {})
}

export default async function GlossaryPage(): Promise<React.JSX.Element> {
  const terms = await fetchGlossary()
  const byLetter = groupGlossaryTerms(terms)
  const letters = Object.keys(byLetter).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b, 'nb-NO')
  })
  const activeLetters = letters.filter((letter) => LETTER_PATTERN.test(letter))

  return (
    <div className={styles.root}>
      <h1>Glossary</h1>
      <p className={styles.lede}>
        Fagbegreper og definisjoner brukt i håndboken.
      </p>

      {letters.length > 0 && (
        <AlphaNav activeLetters={activeLetters} active={letters[0]} />
      )}

      {letters.length === 0 && (
        <EmptyState
          icon="bookOpen"
          title="Ingen oppslag i ordlisten ennå."
          body="Bidra gjerne - legg til begreper i Sanity Studio."
        />
      )}

      {letters.map((letter) => (
        <div
          key={letter}
          id={`letter-${letter}`}
          className={styles.group}
        >
          <div className={styles.letter}>{letter}</div>
          {byLetter[letter]!.map((term) => (
            <div
              key={term._id}
              id={term.slug}
              className={styles.entry}
            >
              <div className={styles.term}>
                {term.term}
                <CopyEntryLink slug={term.slug} />
              </div>
              <div className={styles.definition}>
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
