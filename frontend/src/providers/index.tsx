import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { UnitsProvider } from './Units'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <UnitsProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </UnitsProvider>
    </ThemeProvider>
  )
}
