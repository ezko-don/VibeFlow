'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EditorLayout } from '@/components/editor/editor-layout'
import { WelcomeScreen } from '@/components/welcome/welcome-screen'

export default function HomePage() {
  const [isReady, setIsReady] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Simulate loading time for editor initialization
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (showWelcome) {
    return (
      <WelcomeScreen 
        onGetStarted={() => setShowWelcome(false)}
        isReady={isReady}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col"
    >
      <EditorLayout />
    </motion.div>
  )
} 