'use client'

import { useEffect } from 'react'
import { setupDebugAI } from '@/lib/debug-ai'

export function DebugLoader() {
  useEffect(() => {
    // Only load debug utilities in development
    if (process.env.NODE_ENV === 'development') {
      // Wait for Puter.js to load
      const loadDebug = () => {
        if (typeof window !== 'undefined' && window.puter) {
          setupDebugAI()
        } else {
          setTimeout(loadDebug, 1000)
        }
      }
      
      loadDebug()
    }
  }, [])

  return null // This component doesn't render anything
} 