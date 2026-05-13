import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

export const MarkAsVerifiedAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, published } = props
  const { patch } = useDocumentOperation(id, type)

  if (!published) return null

  return {
    label: 'Mark as verified',
    title: 'Set lastVerifiedAt to now',
    onHandle() {
      patch.execute([{ set: { lastVerifiedAt: new Date().toISOString() } }])
      props.onComplete()
    },
  }
}
