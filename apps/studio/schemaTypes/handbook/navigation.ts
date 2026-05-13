import { defineField, defineType } from 'sanity'

// navGroup is defined up to 3 levels deep (Sanity doesn't support true recursion)
const navItem = {
  type: 'object' as const,
  name: 'navItem',
  title: 'Article link',
  fields: [
    defineField({
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'hb.article' }],
    }),
  ],
  preview: {
    select: { title: 'article.title' },
    prepare({ title }: { title?: string }) {
      return { title: title ?? 'Article ref' }
    },
  },
}

const navGroupLevel3 = {
  type: 'object' as const,
  name: 'navGroupL3',
  title: 'Group',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [navItem],
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
}

const navGroupLevel2 = {
  type: 'object' as const,
  name: 'navGroupL2',
  title: 'Group',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [navItem, navGroupLevel3],
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
}

export const navigation = defineType({
  name: 'hb.navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Main Navigation',
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navGroupL1',
          title: 'Group',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [navItem, navGroupLevel2],
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
