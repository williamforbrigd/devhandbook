import { defineField, defineType } from 'sanity'

export const glossaryTerm = defineType({
  name: 'hb.glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'term' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { title: 'term' },
  },
})
