import { defineField, defineType, type SanityDocument, type ValidationContext } from 'sanity'
import { body } from './body'

type MethodReference = {
  _ref?: string
}

type MethodHierarchyDocument = {
  _id: string
  subMethods?: MethodReference[]
}

const normalizeDocumentId = (id?: string) => id?.replace(/^drafts\./, '')

const hasCircularSubMethodReference = (
  startId: string,
  targetId: string,
  methodsById: Map<string, string[]>,
  visited = new Set<string>(),
): boolean => {
  const normalizedStartId = normalizeDocumentId(startId)

  if (!normalizedStartId) return false
  if (normalizedStartId === targetId) return true
  if (visited.has(normalizedStartId)) return false

  visited.add(normalizedStartId)

  return (methodsById.get(normalizedStartId) ?? []).some((subMethodId) =>
    hasCircularSubMethodReference(subMethodId, targetId, methodsById, visited),
  )
}

const getReferenceIds = (references?: MethodReference[]) =>
  references
    ?.map((reference) => normalizeDocumentId(reference._ref))
    .filter((id): id is string => Boolean(id)) ?? []

const validateSubMethods = async (
  subMethods: MethodReference[] | undefined,
  context: ValidationContext,
) => {
  const currentId = normalizeDocumentId((context.document as SanityDocument | undefined)?._id)
  const selectedSubMethodIds = getReferenceIds(subMethods)

  if (!currentId || selectedSubMethodIds.length === 0) return true

  if (selectedSubMethodIds.includes(currentId)) {
    return 'A method cannot list itself as a sub-method.'
  }

  const client = context.getClient({ apiVersion: '2024-01-01' })
  const methodHierarchy = await client.fetch<MethodHierarchyDocument[]>(
    `*[_type == "hb.method"] { _id, subMethods[] { _ref } }`,
  )

  const methodsById = new Map<string, string[]>()

  for (const method of methodHierarchy) {
    const methodId = normalizeDocumentId(method._id)

    if (methodId && (!methodsById.has(methodId) || method._id.startsWith('drafts.'))) {
      methodsById.set(methodId, getReferenceIds(method.subMethods))
    }
  }

  methodsById.set(currentId, selectedSubMethodIds)

  const hasCircularReference = selectedSubMethodIds.some((subMethodId) =>
    hasCircularSubMethodReference(subMethodId, currentId, methodsById),
  )

  return hasCircularReference ? 'Sub-method hierarchy cannot contain circular references.' : true
}

export const method = defineType({
  name: 'hb.method',
  title: 'Method',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content' },
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
      validation: (Rule) => Rule.required().max(100),
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
      name: 'domain',
      title: 'Domain',
      type: 'reference',
      group: 'classification',
      to: [{ type: 'hb.domain' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    { ...body, group: 'content' },
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      group: 'classification',
      initialValue: 'method',
      options: {
        list: [
          { title: 'Method', value: 'method' },
          { title: 'Practice', value: 'practice' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'expertises',
      title: 'Expertises',
      type: 'array',
      group: 'classification',
      of: [{ type: 'reference', to: [{ type: 'hb.expertise' }] }],
    }),
    defineField({
      name: 'subMethodsTitle',
      title: 'Sub-methods title',
      type: 'string',
      group: 'structure',
      description: 'Optional heading shown above the sub-method list on the web page.',
    }),
    defineField({
      name: 'subMethods',
      title: 'Sub-methods',
      type: 'array',
      group: 'structure',
      description: 'Ordered child methods that are part of this method.',
      of: [{ type: 'reference', to: [{ type: 'hb.method' }] }],
      validation: (Rule) => Rule.custom(validateSubMethods),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      group: 'relations',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'documentType',
              title: 'Document type',
              type: 'string',
              initialValue: 'link',
              options: {
                list: [
                  { title: 'PDF', value: 'pdf' },
                  { title: 'Word document', value: 'docx' },
                  { title: 'Excel workbook', value: 'xlsx' },
                  { title: 'PowerPoint presentation', value: 'pptx' },
                  { title: 'Link', value: 'link' },
                  { title: 'Other', value: 'other' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'documentType' },
          },
        },
      ],
    }),
    defineField({
      name: 'relatedMethods',
      title: 'Related methods',
      type: 'array',
      group: 'relations',
      description: 'Peer or adjacent methods. These are not part of this method hierarchy.',
      of: [{ type: 'reference', to: [{ type: 'hb.method' }] }],
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      domain: 'domain.title',
      type: 'type',
    },
    prepare({ title, domain, type }: { title?: string; domain?: string; type?: string }) {
      return {
        title: title ?? 'Untitled method',
        subtitle: [domain, type].filter(Boolean).join(' · '),
      }
    },
  },
})
