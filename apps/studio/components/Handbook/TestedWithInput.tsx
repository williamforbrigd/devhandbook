import React, { useCallback } from 'react'
import { insert, set } from 'sanity'
import { Button, Card, Flex, Grid, Label, Select, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import type { ButtonTone } from '@sanity/ui'
import type { ArrayOfObjectsInputProps } from 'sanity'
import { AddIcon, TrashIcon } from '@sanity/icons'

interface TestEntry {
  _key: string
  model?: string
  date?: string
  outcome?: string
  notes?: string
}

const MODEL_OPTIONS = ['claude', 'gpt-4', 'gemini', 'other']
const OUTCOME_OPTIONS = ['passed', 'partial', 'failed']

function getOutcomeTone(outcome: string): ButtonTone {
  if (outcome === 'passed') return 'positive'
  if (outcome === 'partial') return 'caution'
  return 'critical'
}

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
    <Stack gap={3}>
      {(value as TestEntry[]).map((entry, i) => (
        <Card
          key={entry._key}
          border
          padding={3}
          radius={2}
          tone="default"
          shadow={1}
        >
          <Stack gap={3}>
            <Flex align="center" justify="space-between" gap={3}>
              <Text size={1} weight="semibold">
                Test result {i + 1}
              </Text>
              <Button
                icon={TrashIcon}
                mode="bleed"
                padding={2}
                text="Remove"
                tone="critical"
                type="button"
                fontSize={1}
                onClick={() => handleRemove(entry._key)}
              />
            </Flex>

            <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
              <Stack as="label" gap={2}>
                <Label muted size={0} weight="semibold">
                  Model
                </Label>
                <Select
                  value={entry.model ?? ''}
                  onChange={(e) => handleUpdate(entry._key, 'model', e.currentTarget.value)}
                  padding={2}
                  radius={2}
                  fontSize={1}
                >
                  <option value="">Select model…</option>
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Stack>

              <Stack as="label" gap={2}>
                <Label muted size={0} weight="semibold">
                  Date
                </Label>
                <TextInput
                  type="date"
                  value={entry.date ? entry.date.slice(0, 10) : ''}
                  onChange={(e) => handleUpdate(entry._key, 'date', new Date(e.currentTarget.value).toISOString())}
                  padding={2}
                  radius={2}
                  fontSize={1}
                />
              </Stack>
            </Grid>

            <Stack space={2}>
              <Label muted size={0} weight="semibold">
                Outcome
              </Label>
              <Flex wrap="wrap" gap={2}>
                {OUTCOME_OPTIONS.map((outcome) => (
                  <Button
                    key={outcome}
                    type="button"
                    onClick={() => handleUpdate(entry._key, 'outcome', outcome)}
                    mode={entry.outcome === outcome ? 'default' : 'ghost'}
                    selected={entry.outcome === outcome}
                    tone={getOutcomeTone(outcome)}
                    text={outcome}
                    padding={2}
                    radius={4}
                    fontSize={1}
                  />
                ))}
              </Flex>
            </Stack>

            <Stack as="label" gap={2}>
              <Label muted size={0} weight="semibold">
                Notes
              </Label>
              <TextArea
                value={entry.notes ?? ''}
                onChange={(e) => handleUpdate(entry._key, 'notes', e.currentTarget.value)}
                rows={2}
                padding={2}
                radius={2}
                fontSize={1}
              />
            </Stack>
          </Stack>
        </Card>
      ))}

      <Button
        icon={AddIcon}
        mode="ghost"
        onClick={handleAdd}
        text="Add test result"
        type="button"
      />
    </Stack>
  )
}
