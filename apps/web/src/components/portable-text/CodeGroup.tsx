import React from 'react'
import { CodeGroupTabs } from './CodeGroupTabs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CodeGroup({ value }: { value: any }): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabs: any[] = value?.__tabs ?? []
  if (tabs.length === 0) return <></>
  return <CodeGroupTabs tabs={tabs} />
}
