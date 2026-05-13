import { defineField, defineType } from 'sanity'
import { body } from './body'
import { MaturityInput } from '../../components/Handbook/MaturityInput'

export const guide = defineType({
  name: 'hb.guide',
  title: 'Guide',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'classification', title: 'Classification' },
    { name: 'structure', title: 'Structure' },
    { name: 'metadata', title: 'Metadata' },
    { name: 'relations', title: 'Relations' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
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
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'reference',
      group: 'content',
      to: [{ type: 'hb.section' }],
      validation: (Rule) => Rule.required(),
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
    }),
    defineField({
      name: 'phases',
      title: 'Phases',
      type: 'array',
      group: 'structure',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({ name: 'duration', title: 'Duration', type: 'string' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'duration' },
          },
        },
      ],
    }),
    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'array',
      group: 'structure',
      of: [{ type: 'reference', to: [{ type: 'hb.role' }] }],
    }),
    defineField({
      name: 'applicableWhen',
      title: 'Applicable when',
      type: 'text',
      rows: 3,
      group: 'structure',
    }),
    defineField({
      name: 'notApplicableWhen',
      title: 'Not applicable when',
      type: 'text',
      rows: 3,
      group: 'structure',
    }),
    defineField({
      name: 'artifacts',
      title: 'Artifacts',
      type: 'array',
      group: 'structure',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({
              name: 'artifactType',
              title: 'Type',
              type: 'string',
              options: { list: ['templateRef', 'externalLink'] },
              initialValue: 'externalLink',
            }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'artifactType' },
          },
        },
      ],
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
      name: 'isLivingDocument',
      title: 'Living document',
      type: 'boolean',
      group: 'metadata',
      description: 'Actively maintained by the community',
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
      name: 'relatedGuides',
      title: 'Related guides',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'hb.guide' }] }],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      section: 'section.title',
      maturity: 'maturity',
    },
    prepare({ title, section, maturity }: { title?: string; section?: string; maturity?: string }) {
      return {
        title: title ?? 'Untitled guide',
        subtitle: [section, maturity].filter(Boolean).join(' · '),
      }
    },
  },
})
