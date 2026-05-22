import { TARGET_MODELS } from '@/types/ai_models';
import type { AiSkillData } from '../../lib/queries'
import { Icon } from '../ui/Icon'
import styles from './AiSkillDetail.module.css'

const SKILL_TYPE_META: Record<string, { label: string; icon: string; tone: string }> = {
  prompt: { label: 'Prompt', icon: 'sparkles', tone: 'lilla' },
  workflow: { label: 'Workflow', icon: 'gitBranch', tone: 'blue' },
  evaluation: { label: 'Evaluation', icon: 'check', tone: 'amber' },
}

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

export function modelLabel(model: string): string {
  return TARGET_MODELS.find((targetModel) => targetModel.value === model)?.label ?? "Unknown model"
}

export function skillTypeMeta(kind: string): { label: string; icon: string; tone: string } {
  return SKILL_TYPE_META[kind] ?? SKILL_TYPE_META.prompt!
}

export function SkillTypeBadge({ kind }: { kind: string }): React.JSX.Element {
  const meta = skillTypeMeta(kind)
  const toneClass = meta.tone === 'blue'
    ? styles.skillTypeBlue
    : meta.tone === 'amber'
      ? styles.skillTypeAmber
      : styles.skillTypeLilla

  return (
    <span className={`${styles.skillType} ${toneClass}`} title={`Skill type: ${meta.label}`}>
      <Icon name={meta.icon} size={12} /> {meta.label}
    </span>
  )
}

export function TargetModelList({ models }: { models: string[] }): React.JSX.Element | null {
  if (models.length === 0) return null
  return (
    <span className={styles.targetModels} title="Target models">
      {models.map((model) => (
        <span key={model} className={styles.targetModel} data-agnostic={model === 'model-agnostic' ? 'true' : undefined}>
          {modelLabel(model)}
        </span>
      ))}
    </span>
  )
}

export function LastTestedChip({ testedWith }: { testedWith: AiSkillData['testedWith'] }): React.JSX.Element {
  const latest = testedWith
    .map((test) => test.date)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)

  if (!latest) {
    return <span className={`${styles.lastTested} ${styles.lastTestedNone}`}><Icon name="alertTriangle" size={11} /> Not tested</span>
  }

  return <span className={styles.lastTested}><Icon name="check" size={11} /> Tested {formatDate(latest)}</span>
}
