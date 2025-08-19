'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  CommandLineIcon,
  DocumentIcon,
  FolderIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Command {
  id: string
  title: string
  description?: string
  category: string
  icon: React.ComponentType<any>
  action: () => void
  keybinding?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: Command) => void
}

export function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    {
      id: 'file.new',
      title: 'New File',
      description: 'Create a new file',
      category: 'File',
      icon: DocumentIcon,
      action: () => console.log('New file'),
      keybinding: 'Ctrl+N'
    },
    {
      id: 'file.open',
      title: 'Open File',
      description: 'Open an existing file',
      category: 'File',
      icon: FolderIcon,
      action: () => console.log('Open file'),
      keybinding: 'Ctrl+O'
    },
    {
      id: 'file.save',
      title: 'Save File',
      description: 'Save the current file',
      category: 'File',
      icon: DocumentIcon,
      action: () => console.log('Save file'),
      keybinding: 'Ctrl+S'
    },
    {
      id: 'view.terminal',
      title: 'Toggle Terminal',
      description: 'Show or hide the terminal',
      category: 'View',
      icon: CommandLineIcon,
      action: () => console.log('Toggle terminal'),
      keybinding: 'Ctrl+`'
    },
    {
      id: 'view.theme',
      title: 'Change Theme',
      description: 'Switch between light and dark themes',
      category: 'View',
      icon: PaintBrushIcon,
      action: () => console.log('Change theme'),
      keybinding: 'Ctrl+K Ctrl+T'
    },
    {
      id: 'preferences.settings',
      title: 'Open Settings',
      description: 'Open user settings',
      category: 'Preferences',
      icon: Cog6ToothIcon,
      action: () => console.log('Open settings'),
      keybinding: 'Ctrl+,'
    }
  ]

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description?.toLowerCase().includes(query.toLowerCase()) ||
    command.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          onCommand(filteredCommands[selectedIndex])
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl mx-4 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none text-lg"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                <CommandLineIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon
                  return (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`
                        flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                        ${index === selectedIndex 
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' 
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                        }
                      `}
                      onClick={() => {
                        onCommand(command)
                        onClose()
                      }}
                    >
                      <Icon className={`
                        w-5 h-5 
                        ${index === selectedIndex 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-neutral-400'
                        }
                      `} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`
                            font-medium truncate
                            ${index === selectedIndex 
                              ? 'text-primary-900 dark:text-primary-100' 
                              : 'text-neutral-900 dark:text-neutral-100'
                            }
                          `}>
                            {command.title}
                          </h3>
                          {command.keybinding && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded">
                              {command.keybinding}
                            </span>
                          )}
                        </div>
                        {command.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                            {command.description}
                          </p>
                        )}
                        <span className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
                          {command.category}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}