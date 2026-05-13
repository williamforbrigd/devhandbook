import { defineField, defineType } from 'sanity'

export const aiCollection = defineType({
  name: 'hb.aiCollection',
  title: 'AI Collection',
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
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hb.aiSkill' }] }],
      validation: (Rule) => Rule.min(2),
    }),
    defineField({
      name: 'relatedGuides',
      title: 'Related guides',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hb.guide' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
