import React from 'react'
import { set, unset } from 'sanity'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'
import type { StringInputProps } from 'sanity'

const OPTIONS = [
  {
    value: 'established',
    label: 'Established',
    description: 'Velprøvd, bredt brukt i miljøet',
    color: '#16a34a',
  },
  {
    value: 'recommended',
    label: 'Recommended',
    description: 'Anbefalt, noe mindre erfaring',
    color: '#2563eb',
  },
  {
    value: 'exploratory',
    label: 'Exploratory',
    description: 'Under utforskning — bruk med bevissthet',
    color: '#d97706',
  },
  {
    value: 'deprecated',
    label: 'Deprecated',
    description: 'Frarådet — bevart for kontekst',
    color: '#dc2626',
  },
]

export function MaturityInput(props: StringInputProps): React.JSX.Element {
  const { value, onChange } = props

  return (
    <Stack gap={2}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <Card
            as="button"
            key={opt.value}
            type="button"
            border
            padding={3}
            pressed={selected}
            radius={2}
            onClick={() => onChange(selected ? unset() : set(opt.value))}
            style={{
              borderColor: selected ? opt.color : undefined,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s ease',
              width: '100%',
            }}
          >
            <Flex align="center" gap={3}>
              <Box
                flex="none"
                style={{
                  background: opt.color,
                  borderRadius: '50%',
                  height: 12,
                  width: 12,
                }}
              />
              <Stack gap={2}>
                <Text size={1} weight="semibold" style={{ color: selected ? opt.color : undefined }}>
                  {opt.label}
                </Text>
                <Text muted size={1}>
                  {opt.description}
                </Text>
              </Stack>
            </Flex>
          </Card>
        )
      })}
    </Stack>
  )
}
