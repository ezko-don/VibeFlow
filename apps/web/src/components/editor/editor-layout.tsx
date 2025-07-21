'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderIcon,
  
  ChatBubbleLeftIcon,
  CommandLineIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { Sidebar } from './sidebar'
import { MonacoEditor } from './monaco-editor'
import { ChatPanel } from './chat-panel'
import { Terminal } from './terminal'
import { MenuBar } from './menu-bar'
import { Toolbar } from './toolbar'
import { SearchPanel } from './search-panel'
import { SourceControlPanel } from './source-control-panel'
import { useTheme } from '@/components/providers/theme-provider'

export function EditorLayout() {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSourceControlOpen, setIsSourceControlOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSave = useCallback(() => {
    // TODO: Implement save functionality
    console.log('Save file')
  }, [])

  const handleNewFile = useCallback(() => {
    // TODO: Implement new file functionality
    console.log('New file')
  }, [])

  const handleOpenFile = useCallback(() => {
    // TODO: Implement open file functionality
    console.log('Open file')
  }, [])

  const handleCopy = useCallback(() => {
    document.execCommand('copy')
  }, [])

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      <MenuBar 
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onSave={handleSave}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarVisible && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col z-10"
          >
            {/* Sidebar Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
                VibeFlow
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <MoonIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>
                <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                  <Cog6ToothIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <Sidebar onFileSelect={setActiveFile} />
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-12 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-4 px-4">
              {activeFile && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {activeFile}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <Toolbar 
                onCopy={handleCopy}
                onSearch={() => setIsSearchOpen(true)}
                onSourceControl={() => setIsSourceControlOpen(true)}
                onRefresh={handleRefresh}
              />
              <div className="flex items-center gap-2 px-4">
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isChatOpen 
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }
                  `}
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isTerminalOpen 
                      ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400' 
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }
                  `}
                >
                  <CommandLineIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor and Panels Area */}
          <div className="flex-1 flex relative overflow-hidden">
            {/* Monaco Editor */}
            <div className={`
              flex-1 transition-all duration-300
              ${isChatOpen ? 'w-[calc(100%-320px)]' : 'w-full'}
              ${isSearchOpen || isSourceControlOpen ? 'w-[calc(100%-320px)]' : ''}
            `}>
              <MonacoEditor 
                activeFile={activeFile}
                onFileChange={setActiveFile}
              />
            </div>

            {/* Search Panel */}
            {isSearchOpen && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.3 }}
                className="w-80 absolute right-0 top-0 bottom-0 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 z-20"
              >
                <SearchPanel onClose={() => setIsSearchOpen(false)} />
              </motion.div>
            )}

            {/* Source Control Panel */}
            {isSourceControlOpen && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.3 }}
                className="w-80 absolute right-0 top-0 bottom-0 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 z-20"
              >
                <SourceControlPanel onClose={() => setIsSourceControlOpen(false)} />
              </motion.div>
            )}

            {/* Chat Panel */}
            {isChatOpen && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.3 }}
                className="w-80 absolute right-0 top-0 bottom-0 border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 z-20"
              >
                <ChatPanel onClose={() => setIsChatOpen(false)} />
              </motion.div>
            )}
          </div>

          {/* Terminal */}
          {isTerminalOpen && (
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ duration: 0.3 }}
              className="h-48 border-t border-neutral-200 dark:border-neutral-700 z-30"
            >
              <Terminal onClose={() => setIsTerminalOpen(false)} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 