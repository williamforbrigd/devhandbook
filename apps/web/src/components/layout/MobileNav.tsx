'use client'

import { useState } from 'react'
import { MobileMenuButton, MobileDrawer } from './Sidebar'
import type { NavigationData, Expertise } from '../../lib/queries'

export function MobileNav({
  navigation,
  expertises,
}: {
  navigation: NavigationData | null
  expertises: Expertise[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <MobileMenuButton onClick={() => setOpen(true)} />
      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        navigation={navigation}
        expertises={expertises}
      />
    </>
  )
}
