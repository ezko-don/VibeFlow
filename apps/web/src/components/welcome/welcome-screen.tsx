'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  CodeBracketIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface WelcomeScreenProps {
  onGetStarted: () => void
  isReady: boolean
}

const features = [
  {
    icon: CodeBracketIcon,
    title: 'Monaco Editor',
    description: 'VS Code-quality editing with syntax highlighting and IntelliSense',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered',
    description: 'Free Claude & GPT integration for natural language coding',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Deploy Ready',
    description: 'One-click deployment to Vercel, Netlify, and Supabase',
  },
]

export function WelcomeScreen({ onGetStarted, isReady }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    setTimeout(() => {
      onGetStarted()
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            VibeFlow
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            AI-powered code editor that lets you program in natural language. 
            Chat with Claude & GPT to build, test, and deploy your ideas instantly.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-neutral-200/50 dark:border-neutral-700/50"
            >
              <feature.icon className="w-8 h-8 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <button
            onClick={handleGetStarted}
            disabled={!isReady || isLoading}
            className={`
              group relative inline-flex items-center gap-3 px-8 py-4 
              bg-gradient-to-r from-primary-600 to-secondary-600 
              text-white font-semibold rounded-2xl shadow-lg 
              hover:shadow-xl transition-all duration-300 
              hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:scale-100 disabled:hover:shadow-lg
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Loading Editor...</span>
              </>
            ) : !isReady ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <span>Start Coding</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span>{isReady ? 'Ready to code' : 'Loading dependencies...'}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 