'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vibe-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing theme classes/attributes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')

    let effectiveTheme: 'dark' | 'light' = 'light'

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      effectiveTheme = systemTheme
    } else {
      effectiveTheme = theme as 'dark' | 'light'
    }

    // Apply the theme
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }

    // Also set data attribute for compatibility
    root.setAttribute('data-theme', effectiveTheme)
    
    // Update resolved theme state
    setResolvedTheme(effectiveTheme)

    // Handle transitions
    if (!disableTransitionOnChange) {
      // Add a small transition to prevent flickering
      const style = document.createElement('style')
      style.innerHTML = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
      
      setTimeout(() => {
        document.head.removeChild(style)
      }, 1)
    }

    // Listen for system theme changes
    if (theme === 'system' && enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newSystemTheme)
        
        root.classList.remove('light', 'dark')
        root.classList.add(newSystemTheme)
        root.setAttribute('data-theme', newSystemTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
} 