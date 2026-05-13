import { defineField, defineType } from 'sanity'

export const codeSnippet = defineType({
  name: 'hb.codeSnippet',
  title: 'Code Snippet',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'snippets',
      title: 'Snippets',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'code',
              title: 'Code',
              type: 'code',
              options: {
                withFilename: true,
                languageAlternatives: [
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'TSX', value: 'tsx' },
                  { title: 'JSX', value: 'jsx' },
                  { title: 'CSS', value: 'css' },
                  { title: 'HTML', value: 'html' },
                  { title: 'JSON', value: 'json' },
                  { title: 'Bash', value: 'sh', mode: 'sh' },
                  { title: 'SQL', value: 'sql' },
                  { title: 'Python', value: 'python' },
                  { title: 'Go', value: 'golang' },
                  { title: 'Rust', value: 'rust' },
                  { title: 'YAML', value: 'yaml' },
                  { title: 'Markdown', value: 'markdown' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'code.filename', subtitle: 'code.language' },
            prepare({ title, subtitle }) {
              return { title: title ?? 'Snippet', subtitle }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
