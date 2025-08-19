'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  FolderIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

import { MonacoEditor } from './monaco-editor'
import { EnhancedAIChat } from './enhanced-ai-chat'
import { Sidebar } from './sidebar'
import { TabBar } from './tab-bar'
import { StatusBar } from './status-bar'
import { MenuBar } from './menu-bar'
import { Terminal } from './terminal'
import { SearchPanel } from './search-panel'
import { SettingsPanel } from './settings-panel'
import { CommandPalette } from './command-palette'
import { ComposerMode } from './composer-mode'
import { fileSystemService } from '@/lib/file-system'

interface Tab {
  id: string
  name: string
  path: string
  content: string
  isDirty: boolean
  language: string
}

interface EditorLayoutProps {
  className?: string
}

export function EditorLayout({ className = '' }: EditorLayoutProps) {
  // File and tab management
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'App.tsx',
      path: 'App.tsx',
      content: '',
      isDirty: false,
      language: 'typescript'
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  const [availableFiles, setAvailableFiles] = useState<string[]>([])

  // Panel states
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [chatWidth, setChatWidth] = useState(400)

  // Load available files on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await fileSystemService.getAvailableFiles()
        setAvailableFiles(files)
        
        // Load content for initial tab
        if (tabs.length > 0) {
          const content = await fileSystemService.getFileContent(tabs[0].path)
          setTabs(prev => prev.map(tab => 
            tab.id === tabs[0].id ? { ...tab, content } : tab
          ))
        }
      } catch (error) {
        console.error('Failed to load files:', error)
      }
    }
    
    loadFiles()
  }, [])

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Handle file selection from sidebar
  const handleFileSelect = useCallback(async (fileName: string) => {
    // Check if file is already open
    const existingTab = tabs.find(tab => tab.path === fileName)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    try {
      // Load file content
      const content = await fileSystemService.getFileContent(fileName)
      const language = getFileLanguage(fileName)
      
      // Create new tab
      const newTab: Tab = {
        id: Date.now().toString(),
        name: fileName.split('/').pop() || fileName,
        path: fileName,
        content,
        isDirty: false,
        language
      }
      
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  }, [tabs])

  // Handle tab close
  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      
      // If closing active tab, switch to another tab
      if (tabId === activeTabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id)
      }
      
      return newTabs
    })
  }, [activeTabId])

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    if (!activeTab) return
    
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, content, isDirty: tab.content !== content }
        : tab
    ))
  }, [activeTab, activeTabId])

  // Handle AI code application
  const handleApplyCode = useCallback(async (code: string, fileName?: string) => {
    const targetFile = fileName || activeTab?.path
    if (!targetFile) return

    try {
      // Save to file system
      await fileSystemService.saveFileContent(targetFile, code)
      
      // Update tab if it's open
      const targetTab = tabs.find(tab => tab.path === targetFile)
      if (targetTab) {
        setTabs(prev => prev.map(tab =>
          tab.path === targetFile
            ? { ...tab, content: code, isDirty: false }
            : tab
        ))
      }
    } catch (error) {
      console.error('Failed to apply code:', error)
    }
  }, [activeTab, tabs])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      
      // Ctrl/Cmd + ` - Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        setIsTerminalOpen(prev => !prev)
      }
      
      // Ctrl/Cmd + Shift + F - Toggle Search
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
      
      // Ctrl/Cmd + Shift + C - Toggle AI Chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Helper function to get file language
  const getFileLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown'
    }
    return languageMap[extension || ''] || 'plaintext'
  }

  return (
    <div className={`h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 ${className}`}>
      {/* Menu Bar */}
      <MenuBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div 
          className="flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700"
          style={{ width: sidebarWidth }}
        >
          <Sidebar 
            onFileSelect={handleFileSelect}
            fileTree={availableFiles.map(file => ({
              name: file,
              path: file,
              type: 'file' as const,
              children: []
            }))}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={handleTabClose}
            onNewTab={() => {
              const newTabId = `untitled-${Date.now()}`
              const newTab: Tab = {
                id: newTabId,
                name: 'Untitled',
                path: newTabId,
                content: '',
                isDirty: false,
                language: 'plaintext'
              }
              setTabs(prev => [...prev, newTab])
              setActiveTabId(newTabId)
            }}
          />

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <MonacoEditor
                activeFile={activeTab?.path ?? null}
                fileContent={activeTab?.content ?? ''}
                onFileChange={handleFileSelect}
                onContentChange={handleContentChange}
                onOpenComposer={() => setIsComposerOpen(true)}
              />
              
              {/* AI Features Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg"
                >
                  <SparklesIcon className="w-3 h-3" />
                  AI-Powered
                </motion.div>
              </div>
            </div>

            {/* AI Chat Panel */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: chatWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex-shrink-0 overflow-hidden"
                >
                  <EnhancedAIChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    currentFile={activeTab?.path ?? null}
                    fileContent={activeTab?.content ?? ''}
                    onApplyCode={(code: string, fileName?: string) => {
                      if (fileName && activeTab) {
                        handleContentChange(code)
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Panels */}
          <AnimatePresence>
            {(isTerminalOpen || isSearchOpen) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 300 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="border-t border-neutral-200 dark:border-neutral-700 overflow-hidden"
              >
                {isTerminalOpen && (
                  <Terminal onClose={() => setIsTerminalOpen(false)} />
                )}
                {isSearchOpen && (
                  <SearchPanel onClose={() => setIsSearchOpen(false)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        activeFile={activeTab?.name}
        language={activeTab?.language}
        isDirty={activeTab?.isDirty}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        onToggleTerminal={() => setIsTerminalOpen(prev => !prev)}
        isChatOpen={isChatOpen}
        isTerminalOpen={isTerminalOpen}
      />

      {/* Floating Action Button for AI Chat */}
      {!isChatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </motion.button>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onFileSelect={handleFileSelect}
        availableFiles={availableFiles}
      />

      {/* Composer Mode Modal */}
      <ComposerMode
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onFileChange={handleFileSelect}
        onContentChange={handleContentChange}
      />

      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}