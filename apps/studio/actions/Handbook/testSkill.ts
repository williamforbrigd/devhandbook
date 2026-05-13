import React, { useState } from 'react'
import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

interface CodeField { code?: string }
interface PromptArtifact {
  systemPrompt?: CodeField
  userPromptTemplate?: CodeField
  variables?: { name?: string; example?: string }[]
}

interface TestResult {
  model: string
  response: string
  error?: string
}

export const TestSkillAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published } = props
  const { patch } = useDocumentOperation(id, type)

  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)
  const [outcome, setOutcome] = useState<'passed' | 'partial' | 'failed'>('passed')
  const [notes, setNotes] = useState('')

  const doc = (draft ?? published) as Record<string, unknown> | null
  if (!doc) return null
  if (type !== 'hb.aiSkill') return null

  const artifact = doc.promptArtifact as PromptArtifact | undefined
  if (!artifact?.systemPrompt && !artifact?.userPromptTemplate) return null

  const systemCode = artifact.systemPrompt?.code ?? ''
  const templateCode = artifact.userPromptTemplate?.code ?? ''

  // substitute variables with examples for the preview
  const resolvedTemplate = (artifact.variables ?? []).reduce((acc, v) => {
    if (!v.name) return acc
    return acc
      .replaceAll(`{{${v.name}}}`, v.example ?? `[${v.name}]`)
      .replaceAll(`{${v.name}}`, v.example ?? `[${v.name}]`)
  }, templateCode)

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/test-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: systemCode,
          userPrompt: userInput || resolvedTemplate,
        }),
      })
      const json = await res.json() as { model?: string; response?: string; error?: string }
      if (!res.ok || json.error) {
        setResult({ model: json.model ?? 'unknown', response: '', error: json.error ?? 'Request failed' })
      } else {
        setResult({ model: json.model ?? 'claude', response: json.response ?? '' })
        setNotes(json.response ?? '')
      }
    } catch (err) {
      setResult({ model: 'unknown', response: '', error: String(err) })
    } finally {
      setRunning(false)
    }
  }

  const handleSave = () => {
    if (!result) return
    const entry = {
      _key: crypto.randomUUID(),
      model: result.model,
      date: new Date().toISOString(),
      outcome,
      notes,
    }
    const existing = Array.isArray(doc.testedWith) ? (doc.testedWith as unknown[]) : []
    patch.execute([{ set: { testedWith: [...existing, entry] } }])
    setOpen(false)
    setResult(null)
    setUserInput('')
    setNotes('')
    props.onComplete()
  }

  const OUTCOME_COLORS: Record<'passed' | 'partial' | 'failed', { border: string; bg: string; text: string }> = {
    passed:  { border: '#16a34a', bg: '#dcfce7', text: '#16a34a' },
    partial: { border: '#d97706', bg: '#fef3c7', text: '#d97706' },
    failed:  { border: '#dc2626', bg: '#fee2e2', text: '#dc2626' },
  }

  return {
    label: 'Test this skill',
    title: 'Send prompt to Anthropic and save result',
    onHandle() { setOpen(true) },
    dialog: open && {
      type: 'dialog',
      id: 'test-skill-dialog',
      header: 'Test this skill',
      width: 'large',
      onClose() { setOpen(false); props.onComplete() },
      content: React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 0', minWidth: 480 } },

        // System prompt preview (read-only)
        systemCode && React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' } }, 'System prompt'),
          React.createElement('pre', {
            style: { margin: 0, padding: '8px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto', color: '#374151' },
          }, systemCode),
        ),

        // User prompt (editable, pre-filled with resolved template)
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' } }, 'User prompt'),
          React.createElement('textarea', {
            rows: 5,
            value: userInput || resolvedTemplate,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setUserInput(e.target.value),
            placeholder: 'Edit user prompt…',
            style: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', resize: 'vertical' },
          }),
        ),

        // Run button
        React.createElement(
          'button',
          {
            type: 'button',
            disabled: running,
            onClick: handleRun,
            style: {
              alignSelf: 'flex-start',
              padding: '8px 18px',
              background: running ? '#93c5fd' : '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: running ? 'not-allowed' : 'pointer',
            },
          },
          running ? 'Running…' : 'Send to Anthropic',
        ),

        // Result
        result && React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 10 } },

          result.error
            ? React.createElement('div', {
                style: { padding: '10px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#dc2626' },
              }, `Error: ${result.error}`)
            : React.createElement(
                'div',
                { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
                React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' } }, `Response · ${result.model}`),
                React.createElement('pre', {
                  style: { margin: 0, padding: '8px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', color: '#111827' },
                }, result.response),
              ),

          // Outcome picker
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' } }, 'Outcome'),
            React.createElement(
              'div',
              { style: { display: 'flex', gap: 6 } },
              ...(['passed', 'partial', 'failed'] as const).map((o) =>
                React.createElement('button', {
                  key: o,
                  type: 'button',
                  onClick: () => setOutcome(o),
                  style: {
                    padding: '4px 14px',
                    borderRadius: 99,
                    border: `1.5px solid ${outcome === o ? OUTCOME_COLORS[o].border : '#d1d5db'}`,
                    background: outcome === o ? OUTCOME_COLORS[o].bg : '#fff',
                    color: outcome === o ? OUTCOME_COLORS[o].text : '#6b7280',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  },
                }, o),
              ),
            ),
          ),

          // Notes
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' } }, 'Notes'),
            React.createElement('textarea', {
              rows: 3,
              value: notes,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value),
              style: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' },
            }),
          ),

          // Save button
          !result.error && React.createElement(
            'div',
            { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
            React.createElement('button', {
              type: 'button',
              onClick: () => { setOpen(false); props.onComplete() },
              style: { padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff', cursor: 'pointer' },
            }, 'Discard'),
            React.createElement('button', {
              type: 'button',
              onClick: handleSave,
              style: { padding: '7px 14px', border: 'none', borderRadius: 6, fontSize: 13, background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' },
            }, 'Save to testedWith'),
          ),
        ),
      ),
    },
  }
}

