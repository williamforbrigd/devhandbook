import { defineField, defineType } from 'sanity'

export const expertise = defineType({
  name: 'hb.expertise',
  title: 'Expertise',
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
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color for visual marking (e.g. "#3B82F6")',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'color',
    },
  },
})
