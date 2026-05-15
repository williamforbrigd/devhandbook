import { defineField, defineType } from 'sanity'
import { body } from './body'
import { MaturityInput } from '../../components/Handbook/MaturityInput'

// Inline warning icon — avoids adding @sanity/icons as an explicit dependency
const WarningIcon = () =>
  React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', width: '1em', height: '1em', viewBox: '0 0 25 25', fill: 'currentColor' },
    React.createElement('path', {
      d: 'M12.5 2a.75.75 0 0 1 .657.387l9.75 17.5A.75.75 0 0 1 22.25 21H2.75a.75.75 0 0 1-.657-1.113l9.75-17.5A.75.75 0 0 1 12.5 2zm0 2.236L4.07 19.5h16.86L12.5 4.236zM12.5 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 12.5 9zm0 7.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    }),
  )
import React from 'react'

export const article = defineType({
  name: 'hb.article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'classification', title: 'Classification' },
    { name: 'metadata', title: 'Metadata' },
    { name: 'relations', title: 'Relations' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      group: 'content',
      to: [{ type: 'hb.section' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.required().max(200),
    }),
    { ...body, group: 'content' },
    defineField({
      name: 'expertises',
      title: 'Expertises',
      type: 'array',
      group: 'classification',
      of: [{ type: 'reference', to: [{ type: 'hb.expertise' }] }],
    }),
    defineField({
      name: 'maturity',
      title: 'Maturity',
      type: 'string',
      group: 'classification',
      initialValue: 'recommended',
      components: { input: MaturityInput },
      options: {
        list: [
          { title: 'Established — velprøvd, bredt brukt', value: 'established' },
          { title: 'Recommended — anbefalt, noe mindre erfaring', value: 'recommended' },
          { title: 'Exploratory — under utforskning', value: 'exploratory' },
          { title: 'Deprecated — frarådet', value: 'deprecated' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'supersededBy',
      title: 'Superseded by',
      type: 'reference',
      group: 'classification',
      to: [{ type: 'hb.article' }],
      description: 'Only relevant when maturity is "deprecated"',
    }),
    defineField({
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      group: 'metadata',
      of: [{ type: 'reference', to: [{ type: 'hb.contributor' }] }],
    }),
    defineField({
      name: 'lastVerifiedAt',
      title: 'Last verified at',
      type: 'datetime',
      group: 'metadata',
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related articles',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'hb.article' }] }],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'relatedSkills',
      title: 'Related AI Skills',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'hb.aiSkill' }] }],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      section: 'section.title',
      maturity: 'maturity',
      lastVerifiedAt: 'lastVerifiedAt',
    },
    prepare({ title, section, maturity, lastVerifiedAt }: {
      title?: string
      section?: string
      maturity?: string
      lastVerifiedAt?: string
    }) {
      const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 180
      const isStale =
        !lastVerifiedAt ||
        Date.now() - new Date(lastVerifiedAt).getTime() > SIX_MONTHS_MS

      const maturityEmoji: Record<string, string> = {
        established: '🟢',
        recommended: '🔵',
        exploratory: '🟡',
        deprecated: '🔴',
      }
      const emoji = maturity ? (maturityEmoji[maturity] ?? '') : ''
      const maturityLabel = maturity ? `${emoji} ${maturity}` : ''

      const displayTitle = maturity === 'deprecated' ? `[Deprecated] ${title ?? ''}` : (title ?? 'Untitled')

      return {
        title: displayTitle,
        subtitle: [section, maturityLabel].filter(Boolean).join(' · '),
        media: isStale ? WarningIcon : undefined,
      }
    },
  },
})
