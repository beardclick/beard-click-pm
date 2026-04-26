'use client'

import React, { createContext, useContext, useState } from 'react'

interface LayoutContextType {
  isMobileDrawerOpen: boolean
  toggleMobileDrawer: (open?: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const toggleMobileDrawer = (open?: boolean) => {
    setIsMobileDrawerOpen(prev => open !== undefined ? open : !prev)
  }

  return (
    <LayoutContext.Provider value={{ isMobileDrawerOpen, toggleMobileDrawer }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
