import type { AiSkillData } from '../../lib/queries'
import { CopyButton } from '../portable-text/CopyButton'
import { Icon } from '../ui/Icon'
import styles from './AiSkillDetail.module.css'

const SKILL_TYPE_META: Record<string, { label: string; icon: string; tone: string }> = {
  prompt: { label: 'Prompt', icon: 'sparkles', tone: 'lilla' },
  workflow: { label: 'Workflow', icon: 'gitBranch', tone: 'blue' },
  evaluation: { label: 'Evaluation', icon: 'check', tone: 'amber' },
}

const MODEL_LABEL: Record<string, string> = {
  claude: 'Claude',
  'gpt-4': 'GPT-4',
  'gpt-4o': 'GPT-4o',
  gemini: 'Gemini',
  'model-agnostic': 'Model-agnostic',
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
  return MODEL_LABEL[model] ?? model
}

export function SkillTypeBadge({ kind }: { kind: string }): React.JSX.Element {
  const meta = SKILL_TYPE_META[kind] ?? SKILL_TYPE_META.prompt!
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

function artifactText(skill: AiSkillData): string {
  if (skill.skillType === 'prompt' && skill.promptArtifact) {
    return [
      skill.promptArtifact.systemPrompt?.code,
      skill.promptArtifact.userPromptTemplate?.code,
    ].filter(Boolean).join('\n\n---\n\n')
  }

  if (skill.skillType === 'workflow' && skill.workflowArtifact) {
    return skill.workflowArtifact.steps
      .map((step, index) => [
        `${index + 1}. ${step.title}`,
        step.prompt,
        step.expectedOutput ? `Expected output: ${step.expectedOutput}` : null,
        step.notes ? `Notes: ${step.notes}` : null,
      ].filter(Boolean).join('\n'))
      .join('\n\n')
  }

  if (skill.skillType === 'evaluation' && skill.evaluationArtifact) {
    return [
      ...skill.evaluationArtifact.criteria.map((criterion) => [
        criterion.label,
        criterion.description,
        criterion.scoringGuide,
      ].filter(Boolean).join('\n')),
      skill.evaluationArtifact.rubric,
    ].filter(Boolean).join('\n\n')
  }

  return ''
}

function CodeBlock({ filename, value, children }: { filename: string; value: string; children?: React.ReactNode }): React.JSX.Element | null {
  if (!value.trim()) return null

  return (
    <div className="hb-codeblock">
      <div className="hb-codeblock__head">
        <span className="hb-codeblock__filename"><Icon name="hash" size={12} /> {filename}</span>
        <CopyButton code={value} className="hb-codeblock__copy" />
      </div>
      <pre>{children ?? value}</pre>
    </div>
  )
}

function highlightVars(text: string): React.ReactNode {
  return text.split(/(\{\{[^}]+\}\})/g).map((part, index) => (
    /^\{\{[^}]+\}\}$/.test(part)
      ? <span key={`${part}-${index}`} className={styles.varToken}>{part}</span>
      : <span key={`${part}-${index}`}>{part}</span>
  ))
}

function PromptArtifact({ skill }: { skill: AiSkillData }): React.JSX.Element | null {
  const artifact = skill.promptArtifact
  if (!artifact) return null

  const systemPrompt = artifact.systemPrompt?.code ?? ''
  const userPromptTemplate = artifact.userPromptTemplate?.code ?? ''
  const variables = artifact.variables ?? []

  if (!systemPrompt && !userPromptTemplate && variables.length === 0) return null

  return (
    <>
      <div className={styles.artifactSection}>
        <div className={styles.artifactSectionTitle}>System prompt</div>
        <CodeBlock filename="system.md" value={systemPrompt} />
      </div>

      <div className={styles.artifactSection}>
        <div className={styles.artifactSectionTitle}>User prompt template</div>
        <CodeBlock filename="user.md" value={userPromptTemplate}>{highlightVars(userPromptTemplate)}</CodeBlock>
      </div>

      {variables.length > 0 && (
        <div className={styles.artifactSection}>
          <div className={styles.artifactSectionTitle}>Variables</div>
          <div className={styles.vars}>
            <div className={styles.varsHead}>
              <div>Name</div><div>Description</div><div>Example</div>
            </div>
            {variables.map((variable) => (
              <div className={styles.varsRow} key={variable.name}>
                <div className={styles.varsName}><code>{`{{${variable.name}}}`}</code></div>
                <div className={styles.varsDesc}>{variable.description ?? ''}</div>
                <div className={styles.varsExample}>{variable.example ?? ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function WorkflowArtifact({ skill }: { skill: AiSkillData }): React.JSX.Element | null {
  const steps = skill.workflowArtifact?.steps ?? []
  if (steps.length === 0) return null

  return (
    <ol className={styles.workflowSteps}>
      {steps.map((step, index) => (
        <li key={`${step.title}-${index}`} className={styles.workflowStep}>
          <div className={styles.workflowStepNumber}>{index + 1}</div>
          <div className={styles.workflowStepBody}>
            <div className={styles.workflowStepTitle}>{step.title}</div>
            {step.prompt && <CodeBlock filename={`Step ${index + 1} - prompt`} value={step.prompt} />}
            {step.expectedOutput && (
              <div className={styles.workflowStepExpected}>
                <div className={styles.workflowStepExpectedLabel}>Expected output</div>
                <div className={styles.workflowStepExpectedBody}>{step.expectedOutput}</div>
              </div>
            )}
            {step.notes && (
              <div className={styles.workflowStepNotes}>
                <Icon name="info" size={11} /> {step.notes}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function EvaluationArtifact({ skill }: { skill: AiSkillData }): React.JSX.Element | null {
  const artifact = skill.evaluationArtifact
  if (!artifact) return null

  const criteria = artifact.criteria ?? []
  if (criteria.length === 0 && !artifact.rubric) return null

  return (
    <>
      {criteria.length > 0 && (
        <div className={styles.artifactSection}>
          <div className={styles.artifactSectionTitle}>Criteria</div>
          <div className={styles.criteria}>
            <div className={styles.criteriaHead}>
              <div>Label</div><div>Description</div><div>Scoring guide</div>
            </div>
            {criteria.map((criterion, index) => (
              <div className={styles.criteriaRow} key={`${criterion.label}-${index}`}>
                <div className={styles.criteriaLabel}>{criterion.label}</div>
                <div className={styles.criteriaDescription}>{criterion.description ?? ''}</div>
                <div className={styles.criteriaScore}>{criterion.scoringGuide ?? ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {artifact.rubric && (
        <div className={styles.artifactSection}>
          <div className={styles.artifactSectionTitle}>Rubric</div>
          <pre className={styles.rubric}>{artifact.rubric}</pre>
        </div>
      )}
    </>
  )
}

export function SkillArtifact({ skill }: { skill: AiSkillData }): React.JSX.Element | null {
  const meta = SKILL_TYPE_META[skill.skillType] ?? SKILL_TYPE_META.prompt!

  const content = skill.skillType === 'workflow'
    ? <WorkflowArtifact skill={skill} />
    : skill.skillType === 'evaluation'
      ? <EvaluationArtifact skill={skill} />
      : <PromptArtifact skill={skill} />

  if (!content) return null

  return (
    <section className={styles.artifact} id="artefakt">
      <header className={styles.artifactHead}>
        <span className={styles.artifactLabel}>
          <Icon name={meta.icon} size={12} /> Artifact - {meta.label}
          {skill.skillType === 'workflow' && skill.workflowArtifact ? ` - ${skill.workflowArtifact.steps.length} steps` : ''}
          {skill.skillType === 'evaluation' && skill.evaluationArtifact ? ` - ${skill.evaluationArtifact.criteria.length} criteria` : ''}
        </span>
        <CopyButton code={artifactText(skill)} className={styles.artifactCopy} />
      </header>
      {content}
    </section>
  )
}
