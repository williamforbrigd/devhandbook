import { defineField, defineType } from 'sanity'

export const template = defineType({
  name: 'hb.template',
  title: 'Template',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Markdown', value: 'markdown' },
          { title: 'Figma', value: 'figma' },
          { title: 'Miro', value: 'miro' },
          { title: 'Sheet', value: 'sheet' },
          { title: 'External', value: 'external' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Only used when format is "markdown"',
      hidden: ({ document }) => document?.format !== 'markdown',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Used for non-markdown formats',
      hidden: ({ document }) => document?.format === 'markdown',
    }),
    defineField({
      name: 'usedIn',
      title: 'Used in guides',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hb.guide' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'format' },
  },
})
