'use client'

import { useState } from 'react'
import { MobileMenuButton, MobileDrawer } from './Sidebar'
import type { NavigationData, Expertise, SidebarGuide } from '../../lib/queries'

export function MobileNav({
  navigation,
  expertises,
  guides,
}: {
  navigation: NavigationData | null
  expertises: Expertise[]
  guides: SidebarGuide[]
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <>
      <MobileMenuButton onClick={() => setOpen(true)} />
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        navigation={navigation}
        expertises={expertises}
        guides={guides}
      />
    </>
  )
}
