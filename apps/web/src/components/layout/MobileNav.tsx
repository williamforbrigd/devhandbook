'use client'

import { useState } from 'react'
import { MobileMenuButton, MobileDrawer } from './Sidebar'
import type { NavigationData, Expertise, SidebarGuide, MethodNavigationData } from '../../lib/queries'

export function MobileNav({
  navigation,
  expertises,
  guides,
  methodNavigation,
}: {
  navigation: NavigationData | null
  expertises: Expertise[]
  guides: SidebarGuide[]
  methodNavigation: MethodNavigationData
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
        methodNavigation={methodNavigation}
      />
    </>
  )
}
