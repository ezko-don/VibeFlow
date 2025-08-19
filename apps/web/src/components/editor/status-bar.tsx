'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CodeBracketIcon,
  CursorArrowRaysIcon,
  ChatBubbleLeftRightIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

interface StatusBarProps {
  activeFile: string | null
  cursorPosition: { line: number; column: number }
  language: string
  encoding: string
  lineEnding: string
  errors: number
  warnings: number
  isConnected: boolean
  isChatOpen?: boolean
  isTerminalOpen?: boolean
  onToggleChat?: () => void
  onToggleTerminal?: () => void
}

export function StatusBar({
  activeFile,
  cursorPosition,
  language,
  encoding = 'UTF-8',
  lineEnding = 'LF',
  errors = 0,
  warnings = 0,
  isConnected = true,
  isChatOpen = false,
  isTerminalOpen = false,
  onToggleChat,
  onToggleTerminal
}: StatusBarProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        return '⚡'
      case 'python':
        return '🐍'
      case 'rust':
        return '🦀'
      case 'json':
        return '📄'
      case 'markdown':
        return '📝'
      default:
        return '📄'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-6 bg-primary-600 dark:bg-primary-700 text-white text-xs flex items-center justify-between px-3 select-none"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="opacity-90">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Problems */}
        {(errors > 0 || warnings > 0) && (
          <div className="flex items-center gap-3">
            {errors > 0 && (
              <div className="flex items-center gap-1">
                <XCircleIcon className="w-3 h-3 text-red-300" />
                <span>{errors}</span>
              </div>
            )}
            {warnings > 0 && (
              <div className="flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3 h-3 text-yellow-300" />
                <span>{warnings}</span>
              </div>
            )}
          </div>
        )}

        {/* Git Branch (Mock) */}
        <div className="flex items-center gap-1 opacity-90">
          <span>🌿</span>
          <span>main</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* AI Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
            isChatOpen 
              ? 'bg-primary-500 dark:bg-primary-600 text-white' 
              : 'hover:bg-primary-500 dark:hover:bg-primary-600 opacity-90'
          }`}
          title="Toggle AI Chat (Ctrl+Shift+C)"
        >
          <ChatBubbleLeftRightIcon className="w-3 h-3" />
          <span className="text-xs">AI</span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={onToggleTerminal}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
            isTerminalOpen 
              ? 'bg-primary-500 dark:bg-primary-600 text-white' 
              : 'hover:bg-primary-500 dark:hover:bg-primary-600 opacity-90'
          }`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <CommandLineIcon className="w-3 h-3" />
          <span className="text-xs">Terminal</span>
        </button>

        {/* Cursor Position */}
        {activeFile && (
          <div className="flex items-center gap-1 opacity-90">
            <CursorArrowRaysIcon className="w-3 h-3" />
            <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          </div>
        )}

        {/* Language */}
        {activeFile && (
          <button className="flex items-center gap-1 hover:bg-primary-500 dark:hover:bg-primary-600 px-2 py-0.5 rounded transition-colors">
            <span>{getLanguageIcon(language)}</span>
            <span className="capitalize">{language}</span>
          </button>
        )}

        {/* Encoding */}
        <button className="hover:bg-primary-500 dark:hover:bg-primary-600 px-2 py-0.5 rounded transition-colors opacity-90">
          {encoding}
        </button>

        {/* Line Ending */}
        <button className="hover:bg-primary-500 dark:hover:bg-primary-600 px-2 py-0.5 rounded transition-colors opacity-90">
          {lineEnding}
        </button>

        {/* Time */}
        <div className="opacity-90 font-mono">
          {formatTime(time)}
        </div>
      </div>
    </motion.div>
  )
}