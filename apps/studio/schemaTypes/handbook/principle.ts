import { defineField, defineType } from 'sanity'

export const principle = defineType({
  name: 'hb.principle',
  title: 'Principle',
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
      name: 'statement',
      title: 'Statement',
      type: 'string',
      description: 'One sentence — e.g. "Vi foretrekker kjedelig teknologi"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rationale',
      title: 'Rationale',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hb.article' }] }],
    }),
    defineField({
      name: 'relatedGuides',
      title: 'Related guides',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hb.guide' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'statement' },
  },
})
