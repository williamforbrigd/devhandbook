import React, { useState } from 'react'
import { useDocumentOperation, useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

export const MarkAsDeprecatedAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, published, draft } = props
  const { patch } = useDocumentOperation(id, type)
  const client = useClient({ apiVersion: '2024-01-01' })
  const doc = draft ?? published

  const [open, setOpen] = useState(false)
  const [supersededByRef, setSupersededByRef] = useState('')
  const [supersededByTitle, setSupersededByTitle] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ _id: string; title: string }[]>([])

  if (!doc) return null
  if ((doc as Record<string, unknown>).maturity === 'deprecated') return null

  const handleSearch = async (q: string) => {
    setSupersededByTitle(q)
    setSupersededByRef('')
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const docType = type as string
      const results = await client.fetch<{ _id: string; title: string }[]>(
        `*[_type == $type && title match $q][0..9]{ _id, title }`,
        { type: docType, q: q + '*' },
      )
      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }

  const handleConfirm = () => {
    const patches: Record<string, unknown>[] = [{ set: { maturity: 'deprecated' } }]
    if (supersededByRef) {
      patches.push({ set: { supersededBy: { _type: 'reference', _ref: supersededByRef } } })
    }
    patch.execute(patches as Parameters<typeof patch.execute>[0])
    setOpen(false)
    props.onComplete()
  }

  return {
    label: 'Mark as deprecated',
    title: 'Set maturity to deprecated',
    tone: 'caution',
    onHandle() { setOpen(true) },
    dialog: open && {
      type: 'dialog',
      id: 'mark-as-deprecated-dialog',
      header: 'Mark as deprecated',
      width: 'medium',
      onClose() { setOpen(false); props.onComplete() },
      content: React.createElement(
        'div',
        { style: { padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 340 } },
        React.createElement(
          'p',
          { style: { margin: 0, fontSize: 14, color: '#374151' } },
          'This will set ',
          React.createElement('strong', null, 'maturity'),
          ' to ',
          React.createElement('code', { style: { background: '#fef3c7', padding: '1px 5px', borderRadius: 3 } }, 'deprecated'),
          '.',
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          React.createElement(
            'label',
            { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const } },
            'Superseded by (optional)',
          ),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search by title…',
            value: supersededByTitle,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value),
            style: { padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 },
          }),
          searching && React.createElement('div', { style: { fontSize: 12, color: '#9ca3af' } }, 'Searching…'),
          searchResults.length > 0 && React.createElement(
            'div',
            { style: { border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' } },
            ...searchResults.map((r) =>
              React.createElement(
                'button',
                {
                  key: r._id,
                  type: 'button',
                  onClick: () => { setSupersededByRef(r._id); setSupersededByTitle(r.title); setSearchResults([]) },
                  style: {
                    display: 'block',
                    width: '100%',
                    textAlign: 'left' as const,
                    padding: '7px 10px',
                    fontSize: 13,
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    background: supersededByRef === r._id ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                  },
                },
                r.title,
              ),
            ),
          ),
          supersededByRef && React.createElement(
            'div',
            { style: { fontSize: 12, color: '#16a34a' } },
            '✓ Will link to: ',
            supersededByTitle,
          ),
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => { setOpen(false); props.onComplete() },
              style: { padding: '7px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff', cursor: 'pointer' },
            },
            'Cancel',
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: handleConfirm,
              style: { padding: '7px 14px', border: 'none', borderRadius: 6, fontSize: 13, background: '#d97706', color: '#fff', fontWeight: 700, cursor: 'pointer' },
            },
            'Confirm deprecation',
          ),
        ),
      ),
    },
  }
}
