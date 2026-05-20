import { defineField, defineType } from 'sanity'
import { body } from './body'
import { MaturityInput } from '../../components/Handbook/MaturityInput'
import { PromptArtifactInput } from '../../components/Handbook/PromptArtifactInput'
import { TestedWithInput } from '../../components/Handbook/TestedWithInput'

export const aiSkill = defineType({
  name: 'hb.aiSkill',
  title: 'AI Skill',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'artifact', title: 'Artifact' },
    { name: 'classification', title: 'Classification' },
    { name: 'testing', title: 'Testing' },
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
      name: 'useCase',
      title: 'Use case',
      type: 'string',
      group: 'content',
      description: 'One sentence: what is this used for?',
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    { ...body, group: 'content' },
    defineField({
      name: 'skillType',
      title: 'Skill type',
      type: 'string',
      group: 'classification',
      options: {
        list: [
          { title: 'Prompt', value: 'prompt' },
          { title: 'Workflow', value: 'workflow' },
          { title: 'Evaluation', value: 'evaluation' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetModel',
      title: 'Target model',
      type: 'array',
      group: 'classification',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'Claude', value: 'claude' },
              { title: 'GPT-4', value: 'gpt-4' },
              { title: 'Gemini', value: 'gemini' },
              { title: 'Model-agnostic', value: 'model-agnostic' },
            ],
          },
        },
      ],
    }),
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
          { title: 'Established', value: 'established' },
          { title: 'Recommended', value: 'recommended' },
          { title: 'Exploratory', value: 'exploratory' },
          { title: 'Deprecated', value: 'deprecated' },
        ],
      },
    }),
    defineField({
      name: 'promptArtifact',
      title: 'Prompt artifact',
      type: 'object',
      group: 'artifact',
      hidden: ({ document }) => document?.skillType !== 'prompt',
      components: { input: PromptArtifactInput },
      fields: [
        defineField({
          name: 'systemPrompt',
          title: 'System prompt',
          type: 'code',
          options: { language: 'markdown' },
        }),
        defineField({
          name: 'userPromptTemplate',
          title: 'User prompt template',
          type: 'code',
          options: { language: 'markdown' },
        }),
        defineField({
          name: 'variables',
          title: 'Variables',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'name', title: 'Name', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'string' }),
                defineField({ name: 'example', title: 'Example', type: 'string' }),
              ],
              preview: { select: { title: 'name', subtitle: 'description' } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'workflowArtifact',
      title: 'Workflow artifact',
      type: 'object',
      group: 'artifact',
      hidden: ({ document }) => document?.skillType !== 'workflow',
      fields: [
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'prompt', title: 'Prompt', type: 'text' }),
                defineField({ name: 'expectedOutput', title: 'Expected output', type: 'text' }),
                defineField({ name: 'notes', title: 'Notes', type: 'text' }),
              ],
              preview: { select: { title: 'title' } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'evaluationArtifact',
      title: 'Evaluation artifact',
      type: 'object',
      group: 'artifact',
      hidden: ({ document }) => document?.skillType !== 'evaluation',
      fields: [
        defineField({
          name: 'criteria',
          title: 'Criteria',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'string' }),
                defineField({ name: 'scoringGuide', title: 'Scoring guide', type: 'text' }),
              ],
              preview: { select: { title: 'label' } },
            },
          ],
        }),
        defineField({ name: 'rubric', title: 'Rubric', type: 'text' }),
      ],
    }),
    defineField({
      name: 'testedWith',
      title: 'Tested with',
      type: 'array',
      group: 'testing',
      validation: (rule) => rule.required().warning('The skill does not have a test result'),
      components: { input: TestedWithInput },
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'model', title: 'Model', type: 'string' }),
            defineField({ name: 'date', title: 'Date', type: 'datetime' }),
            defineField({ name: 'outcome', title: 'Outcome', type: 'string' }),
            defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'model', subtitle: 'outcome' },
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
    defineField({
      name: 'relatedSkills',
      title: 'Related skills',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'hb.aiSkill' }] }],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      skillType: 'skillType',
      maturity: 'maturity',
      testedWith: 'testedWith',
    },
    prepare({ title, skillType, maturity, testedWith }: { title?: string; skillType?: string; maturity?: string; testedWith?: Array<{ date?: string }> }) {
      const lastTested = testedWith
        ?.map((t) => t.date)
        .filter(Boolean)
        .sort()
        .at(-1)
      const testedBadge = lastTested
        ? `tested ${new Date(lastTested).toLocaleDateString('no-NO', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : 'not tested'
      return {
        title: title ?? 'Untitled skill',
        subtitle: [skillType, maturity, testedBadge].filter(Boolean).join(' · '),
      }
    },
  },
})
