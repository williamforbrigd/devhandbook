import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

export const DuplicateAsNewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { published, draft, id, type } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const doc = draft ?? published

  if (!doc) return null

  return {
    label: 'Duplicate as new',
    title: 'Copy content, reset slug and maturity',
    onHandle() {
      const { _id, _rev, _createdAt, _updatedAt, slug, maturity, ...rest } = doc as Record<string, unknown>
      void client
        .create({
          ...rest,
          _type: type,
          slug: undefined,
          maturity: 'recommended',
          lastVerifiedAt: undefined,
          hidden: true,
        })
        .then((created) => {
          window.location.href = `/structure/${type};${created._id}`
        })
      props.onComplete()
    },
  }
}
