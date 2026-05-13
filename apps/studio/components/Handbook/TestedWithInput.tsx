import React, { useCallback } from 'react'
import { insert, set } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'

interface TestEntry {
  _key: string
  model?: string
  date?: string
  outcome?: string
  notes?: string
}

const MODEL_OPTIONS = ['claude', 'gpt-4', 'gemini', 'other']
const OUTCOME_OPTIONS = ['passed', 'partial', 'failed']

export function TestedWithInput(props: ArrayOfObjectsInputProps): React.JSX.Element {
  const { onChange, value = [] } = props

  const handleAdd = useCallback(() => {
    const newEntry: TestEntry = {
      _key: crypto.randomUUID(),
      model: '',
      date: new Date().toISOString(),
      outcome: 'passed',
      notes: '',
    }
    onChange(insert([newEntry], 'after', [-1]))
  }, [onChange])

  const handleUpdate = useCallback(
    (key: string, field: keyof Omit<TestEntry, '_key'>, val: string) => {
      const entries = value as TestEntry[]
      const idx = entries.findIndex((e) => e._key === key)
      if (idx === -1) return
      const updated = entries.map((e) =>
        e._key === key ? { ...e, [field]: val } : e,
      )
      onChange(set(updated))
    },
    [value, onChange],
  )

  const handleRemove = useCallback(
    (key: string) => {
      const updated = (value as TestEntry[]).filter((e) => e._key !== key)
      onChange(set(updated))
    },
    [value, onChange],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(value as TestEntry[]).map((entry, i) => (
        <div
          key={entry._key}
          style={{
            padding: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>
              Test result {i + 1}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(entry._key)}
              style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            >
              Remove
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Model</span>
              <select
                value={entry.model ?? ''}
                onChange={(e) => handleUpdate(entry._key, 'model', e.target.value)}
                style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#fff' }}
              >
                <option value="">Select model…</option>
                {MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Date</span>
              <input
                type="date"
                value={entry.date ? entry.date.slice(0, 10) : ''}
                onChange={(e) => handleUpdate(entry._key, 'date', new Date(e.target.value).toISOString())}
                style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#fff' }}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Outcome</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {OUTCOME_OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => handleUpdate(entry._key, 'outcome', o)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 99,
                    border: `1.5px solid ${entry.outcome === o ? (o === 'passed' ? '#16a34a' : o === 'partial' ? '#d97706' : '#dc2626') : '#d1d5db'}`,
                    background: entry.outcome === o ? (o === 'passed' ? '#dcfce7' : o === 'partial' ? '#fef3c7' : '#fee2e2') : '#fff',
                    color: entry.outcome === o ? (o === 'passed' ? '#16a34a' : o === 'partial' ? '#d97706' : '#dc2626') : '#6b7280',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Notes</span>
            <textarea
              value={entry.notes ?? ''}
              onChange={(e) => handleUpdate(entry._key, 'notes', e.target.value)}
              rows={2}
              style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', background: '#fff' }}
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        style={{
          padding: '8px 16px',
          background: '#1d4ed8',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        + Add test result
      </button>
    </div>
  )
}
