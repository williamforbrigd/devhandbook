import type { Metadata } from 'next'
import { fetchAiSkills, fetchAiCollections, fetchExpertises } from '../../lib/queries'
import { SkillsLibrary } from '../../components/ai-skills/SkillsLibrary'

export const metadata: Metadata = {
  title: 'AI Skills',
  description: 'Gjenbrukbare prompts og workflows for arbeid med AI.',
}

export default async function AiSkillsPage(): Promise<React.JSX.Element> {
  const [skills, collections, expertises] = await Promise.all([
    fetchAiSkills(),
    fetchAiCollections(),
    fetchExpertises(),
  ])

  return (
    <div>
      <h1
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 800,
          margin: '0 0 8px',
          color: 'var(--color-text)',
        }}
      >
        AI Skills
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        Gjenbrukbare prompts og workflows for arbeid med AI. Filtrer etter type, modell eller fagområde.
      </p>

      <SkillsLibrary skills={skills} collections={collections} expertises={expertises} />
    </div>
  )
}

