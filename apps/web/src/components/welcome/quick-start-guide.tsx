'use client'

import { motion } from 'framer-motion'
import { 
  CommandLineIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface QuickStartGuideProps {
  onClose: () => void
}

export function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  const features = [
    {
      icon: CommandLineIcon,
      title: 'Command Palette',
      shortcut: 'Ctrl+Shift+P',
      description: 'Access all commands quickly with the command palette'
    },
    {
      icon: ChatBubbleLeftIcon,
      title: 'AI Chat',
      shortcut: 'Ctrl+Shift+C',
      description: 'Chat with Claude or GPT for coding assistance'
    },
    {
      icon: DocumentIcon,
      title: 'Multi-Tab Editor',
      shortcut: 'Ctrl+W to close',
      description: 'Work with multiple files using tabs'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Quick Search',
      shortcut: 'Ctrl+F',
      description: 'Find and replace text in your files'
    },
    {
      icon: Cog6ToothIcon,
      title: 'Settings',
      shortcut: 'Ctrl+,',
      description: 'Customize editor settings and preferences'
    },
    {
      icon: PuzzlePieceIcon,
      title: 'Extensions',
      shortcut: 'Click sidebar',
      description: 'Install and manage VS Code-compatible extensions'
    }
  ]

  const shortcuts = [
    { keys: 'Ctrl+N', action: 'New File' },
    { keys: 'Ctrl+S', action: 'Save File' },
    { keys: 'Ctrl+B', action: 'Toggle Sidebar' },
    { keys: 'Ctrl+`', action: 'Toggle Terminal' },
    { keys: 'Ctrl+K, T', action: 'Change Theme' },
    { keys: 'Ctrl+Tab', action: 'Switch Tabs' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome to Enhanced VibeFlow! 🚀
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your VS Code-like AI-powered editor is ready. Here's what's new:
          </p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              New Features
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {feature.title}
                        </h4>
                        <span className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono text-neutral-600 dark:text-neutral-400">
                          {feature.shortcut}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.keys}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {shortcut.action}
                  </span>
                  <span className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono text-neutral-600 dark:text-neutral-400">
                    {shortcut.keys}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                💡 Pro Tip
              </h4>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Press <kbd className="px-1 py-0.5 bg-white dark:bg-neutral-700 rounded text-xs">Ctrl+Shift+P</kbd> to 
                open the command palette and discover all available commands!
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              🎉 Ready to code with AI assistance!
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}