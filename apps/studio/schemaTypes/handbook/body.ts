import React from 'react'
import { defineArrayMember, defineField } from 'sanity'
import { HighlightLinesInput } from '../../components/Handbook/HighlightLinesInput'
import { DiagramBlockInput } from '../../components/Handbook/DiagramBlockInput'
import { HotspotFigureInput } from '../../components/Handbook/HotspotFigureInput'
import { ConceptModelVariantInput } from '../../components/Handbook/ConceptModelVariantInput'

const languageAlternatives = [
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
]

// All body block types except hb.conceptModel — reused in nested content fields
const coreMembers = [
  // ── Standard block ──────────────────────────────────────────────────────
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Blockquote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Em', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'internalLink',
            type: 'object',
            title: 'Internal link',
            fields: [
              defineField({ name: 'article', type: 'reference', to: [{ type: 'hb.article' }] }),
              defineField({ name: 'guide', type: 'reference', to: [{ type: 'hb.guide' }] }),
              defineField({ name: 'section', type: 'reference', to: [{ type: 'hb.section' }] }),
              defineField({ name: 'domain', type: 'reference', to: [{ type: 'hb.domain' }] }),
              defineField({ name: 'method', type: 'reference', to: [{ type: 'hb.method' }] }),
            ],
          },
          {
            name: 'externalLink',
            type: 'object',
            title: 'External link',
            fields: [
              defineField({ name: 'url', type: 'url', title: 'URL' }),
              defineField({ name: 'newTab', type: 'boolean', title: 'Open in new tab', initialValue: true }),
            ],
          },
          {
            name: 'glossaryRef',
            type: 'object',
            title: 'Glossary term',
            fields: [
              defineField({ name: 'term', type: 'reference', to: [{ type: 'hb.glossaryTerm' }] }),
            ],
          },
          {
            name: 'skillRef',
            type: 'object',
            title: 'AI Skill',
            fields: [
              defineField({ name: 'skill', type: 'reference', to: [{ type: 'hb.aiSkill' }] }),
            ],
          },
        ],
      },
    }),

    // ── hb.codeBlock ────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.codeBlock',
      type: 'object',
      title: 'Code block',
      fields: [
        defineField({
          name: 'code',
          title: 'Code',
          type: 'code',
          options: {
            withFilename: true,
            languageAlternatives,
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: 'highlightLines', type: 'string', title: 'Highlight lines', description: 'e.g. "1,3-5,8"', components: { input: HighlightLinesInput } }),
        defineField({ name: 'showLineNumbers', type: 'boolean', title: 'Show line numbers', initialValue: true }),
      ],
      preview: {
        select: { title: 'code.filename', subtitle: 'code.language' },
        prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
          return { title: title ?? 'Code block', subtitle }
        },
      },
    }),

    // ── hb.codeGroup ────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.codeGroup',
      type: 'object',
      title: 'Code group',
      fields: [
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
                    languageAlternatives,
                  },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({ name: 'highlightLines', type: 'string', title: 'Highlight lines', components: { input: HighlightLinesInput } }),
                defineField({ name: 'showLineNumbers', type: 'boolean', title: 'Show line numbers', initialValue: true }),
              ],
              preview: {
                select: { title: 'code.filename', subtitle: 'code.language' },
                prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
                  return { title: title ?? 'Snippet', subtitle }
                },
              },
            },
          ],
          validation: (Rule) => Rule.min(2).max(6),
        }),
      ],
      preview: {
        select: { snippets: 'snippets' },
        prepare({ snippets }: { snippets?: unknown[] }) {
          return { title: `Code group (${snippets?.length ?? 0} snippets)` }
        },
      },
    }),

    // ── hb.callout ──────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.callout',
      type: 'object',
      title: 'Callout',
      fields: [
        defineField({
          name: 'variant',
          type: 'string',
          title: 'Variant',
          options: { list: ['info', 'warning', 'tip', 'deprecated'] },
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: 'title', type: 'string', title: 'Title' }),
        defineField({
          name: 'content',
          type: 'array',
          title: 'Content',
          of: [{ type: 'block' }],
          validation: (Rule) => Rule.min(1),
        }),
      ],
      preview: {
        select: { title: 'title', subtitle: 'variant' },
        prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
          return { title: title ?? 'Callout', subtitle }
        },
      },
    }),

    // ── table ───────────────────────────────────────────────────────────────
    defineArrayMember({
      type: 'table',
      title: 'Table',
    }),

    // ── hb.imageBlock ───────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.imageBlock',
      type: 'object',
      title: 'Image',
      fields: [
        defineField({ name: 'asset', type: 'image', title: 'Image', options: { hotspot: true } }),
        defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (Rule) => Rule.required() }),
        defineField({ name: 'caption', type: 'string', title: 'Caption' }),
      ],
      preview: {
        select: { title: 'alt', media: 'asset' },
      },
    }),

    // ── hb.embed ────────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.embed',
      type: 'object',
      title: 'Embed',
      fields: [
        defineField({ name: 'url', type: 'url', title: 'URL', validation: (Rule) => Rule.required() }),
        defineField({ name: 'title', type: 'string', title: 'Title' }),
      ],
      preview: {
        select: { title: 'title', subtitle: 'url' },
        prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
          return { title: title ?? 'Embed', subtitle }
        },
      },
    }),

    // ── hb.snippetRef ───────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.snippetRef',
      type: 'object',
      title: 'Code snippet reference',
      fields: [
        defineField({
          name: 'snippet',
          title: 'Snippet',
          type: 'reference',
          to: [{ type: 'hb.codeSnippet' }],
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: { title: 'snippet.title' },
        prepare({ title }: { title?: string }) {
          return { title: title ?? 'Snippet ref' }
        },
      },
    }),

    // ── hb.skillEmbed ───────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.skillEmbed',
      type: 'object',
      title: 'Skill embed',
      fields: [
        defineField({
          name: 'skill',
          title: 'Skill',
          type: 'reference',
          to: [{ type: 'hb.aiSkill' }],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'displayMode',
          title: 'Display mode',
          type: 'string',
          options: {
            list: [
              { title: 'Card — compact', value: 'card' },
              { title: 'Full — full artifact inline', value: 'full' },
            ],
          },
          initialValue: 'card',
        }),
      ],
      preview: {
        select: { title: 'skill.title', subtitle: 'displayMode' },
        prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
          return { title: title ?? 'Skill embed', subtitle }
        },
      },
    }),

    // ── hb.decisionRecord ───────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.decisionRecord',
      type: 'object',
      title: 'Decision record',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', description: 'Short heading for this decision record' }),
        defineField({ name: 'context', title: 'Context', type: 'text', rows: 3 }),
        defineField({ name: 'decision', title: 'Decision', type: 'text', rows: 3 }),
        defineField({ name: 'consequences', title: 'Consequences', type: 'text', rows: 3 }),
      ],
      preview: {
        select: { title: 'title', decision: 'decision' },
        prepare({ title, decision }: { title?: string; decision?: string }) {
          const label = title ?? (decision ? decision.slice(0, 60) : undefined)
          return { title: label ? `ADR: ${label}` : 'Decision record' }
        },
      },
    }),

    // ── hb.checklist ────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.checklist',
      type: 'object',
      title: 'Checklist',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({ name: 'optional', title: 'Optional', type: 'boolean', initialValue: false }),
              ],
              preview: { select: { title: 'text' } },
            },
          ],
        }),
      ],
      preview: {
        select: { title: 'title', items: 'items' },
        prepare({ title, items }: { title?: string; items?: unknown[] }) {
          return { title: title ?? 'Checklist', subtitle: `${items?.length ?? 0} items` }
        },
      },
    }),

    // ── hb.stepList ─────────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.stepList',
      type: 'object',
      title: 'Step list',
      fields: [
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({
                  name: 'description',
                  title: 'Description',
                  type: 'array',
                  of: [{ type: 'block' }],
                }),
                defineField({
                  name: 'roles',
                  title: 'Roles',
                  type: 'array',
                  of: [{ type: 'reference', to: [{ type: 'hb.role' }] }],
                }),
                defineField({ name: 'duration', title: 'Duration', type: 'string' }),
              ],
              preview: { select: { title: 'title' } },
            },
          ],
        }),
      ],
      preview: {
        select: { steps: 'steps' },
        prepare({ steps }: { steps?: unknown[] }) {
          return { title: `Step list (${steps?.length ?? 0} steps)` }
        },
      },
    }),

    // ── hb.diagramBlock ─────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.diagramBlock',
      type: 'object',
      title: 'Diagram',
      components: { input: DiagramBlockInput },
      fields: [
        defineField({
          name: 'diagramType',
          title: 'Diagram type',
          type: 'string',
          options: {
            list: [
              { title: 'Flowchart', value: 'flowchart' },
              { title: 'Sequence', value: 'sequence' },
              { title: 'ER diagram', value: 'er' },
              { title: 'Architecture', value: 'architecture' },
              { title: 'Mindmap', value: 'mindmap' },
            ],
          },
        }),
        defineField({
          name: 'code',
          title: 'Mermaid code',
          type: 'code',
          options: { language: 'mermaid', withFilename: false },
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
      ],
      preview: {
        select: { title: 'caption', subtitle: 'diagramType' },
        prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
          return { title: title ?? 'Diagram', subtitle }
        },
      },
    }),

    // ── hb.hotspotFigure ────────────────────────────────────────────────────
    defineArrayMember({
      name: 'hb.hotspotFigure',
      type: 'object',
      title: 'Hotspot figure',
      components: { input: HotspotFigureInput },
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
        defineField({
          name: 'hotspots',
          title: 'Hotspots',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'key', title: 'Key', type: 'string' }),
                defineField({
                  name: 'x',
                  title: 'X position (%)',
                  type: 'number',
                  validation: (Rule) => Rule.min(0).max(100),
                }),
                defineField({
                  name: 'y',
                  title: 'Y position (%)',
                  type: 'number',
                  validation: (Rule) => Rule.min(0).max(100),
                }),
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({ name: 'content', title: 'Content', type: 'text' }),
              ],
              preview: { select: { title: 'label' } },
            },
          ],
        }),
      ],
      preview: {
        select: { title: 'alt', media: 'image' },
        prepare({ title, media }: { title?: string; media?: React.ReactNode }) {
          return { title: title ?? 'Hotspot figure', media }
        },
      },
    }),

]

// ── hb.conceptModel ─────────────────────────────────────────────────────────
// Defined separately so items[] can reference coreMembers for their content
const conceptModelMember = defineArrayMember({
  name: 'hb.conceptModel',
  type: 'object',
  title: 'Concept model',
  fields: [
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      components: { input: ConceptModelVariantInput },
      options: {
        list: [
          { title: 'Double diamond', value: 'double-diamond' },
          { title: 'Two-by-two', value: 'two-by-two' },
          { title: 'Phases', value: 'phases' },
          { title: 'Comparison', value: 'comparison' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'sublabel', title: 'Sublabel', type: 'string' }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'array',
              of: coreMembers,
            }),
            defineField({ name: 'color', title: 'Color', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'sublabel' } },
        },
      ],
      validation: (Rule) => Rule.min(2),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'variant' },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      return { title: title ?? 'Concept model', subtitle }
    },
  },
})

export const body = defineField({
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [...coreMembers, conceptModelMember],
})
