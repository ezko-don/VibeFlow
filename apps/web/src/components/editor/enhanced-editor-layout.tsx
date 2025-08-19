'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/theme-provider'
import { useEnhancedKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

// Import all the enhanced components
import { TabBar } from './tab-bar'
import { StatusBar } from './status-bar'
import { Breadcrumb } from './breadcrumb'
import { CommandPalette } from './command-palette'
import { SettingsPanel } from './settings-panel'
import { ExtensionsPanel } from './extensions-panel'
import { EnhancedSidebar } from './enhanced-sidebar'
import { MonacoEditor } from './monaco-editor'
import { ChatPanel } from './chat-panel'
import { Terminal } from './terminal'
import { MenuBar } from './menu-bar'

interface Tab {
  id: string
  name: string
  path: string
  isDirty: boolean
  language: string
  content: string
}

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  path: string
  isOpen?: boolean
  size?: number
  modified?: Date
}

interface BreadcrumbItem {
  name: string
  path: string
  type: 'workspace' | 'folder' | 'file'
}

export function EnhancedEditorLayout() {
  // State management
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [workspaceRoot, setWorkspaceRoot] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  
  // Panel states
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isExtensionsOpen, setIsExtensionsOpen] = useState(false)
  
  const { theme, setTheme } = useTheme()

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) 
 // Keyboard shortcuts
  useEnhancedKeyboardShortcuts({
    onNewFile: () => handleNewFile(),
    onSave: () => handleSave(),
    onToggleTerminal: () => setIsTerminalOpen(!isTerminalOpen),
    onToggleChat: () => setIsChatOpen(!isChatOpen),
    onToggleSidebar: () => setIsSidebarVisible(!isSidebarVisible),
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onSettings: () => setIsSettingsOpen(true),
    onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    onCloseTab: () => activeTabId && handleTabClose(activeTabId),
    onNextTab: () => handleNextTab(),
    onPrevTab: () => handlePrevTab(),
  })

  // Tab management
  const handleNewFile = useCallback(() => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: 'Untitled-1',
      path: '',
      isDirty: false,
      language: 'plaintext',
      content: ''
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTabId(tabId)
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      updateBreadcrumbs(tab.path)
    }
  }, [tabs])

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      if (activeTabId === tabId) {
        const closedIndex = prev.findIndex(tab => tab.id === tabId)
        const nextTab = newTabs[closedIndex] || newTabs[closedIndex - 1]
        setActiveTabId(nextTab?.id || null)
      }
      return newTabs
    })
  }, [activeTabId])

  const handleNextTab = useCallback(() => {
    if (tabs.length === 0) return
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId)
    const nextIndex = (currentIndex + 1) % tabs.length
    setActiveTabId(tabs[nextIndex].id)
  }, [tabs, activeTabId])

  const handlePrevTab = useCallback(() => {
    if (tabs.length === 0) return
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId)
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
    setActiveTabId(tabs[prevIndex].id)
  }, [tabs, activeTabId])

  const handleSave = useCallback(() => {
    if (activeTab) {
      // Mock save functionality
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab.id ? { ...tab, isDirty: false } : tab
      ))
      console.log('File saved:', activeTab.name)
    }
  }, [activeTab])

  const updateBreadcrumbs = useCallback((filePath: string) => {
    if (!filePath) {
      setBreadcrumbs([])
      return
    }

    const parts = filePath.split('/')
    const breadcrumbs: BreadcrumbItem[] = []
    
    if (workspaceRoot) {
      breadcrumbs.push({
        name: workspaceRoot.split('/').pop() || 'Workspace',
        path: workspaceRoot,
        type: 'workspace'
      })
    }

    let currentPath = workspaceRoot || ''
    parts.forEach((part, index) => {
      if (part) {
        currentPath += `/${part}`
        breadcrumbs.push({
          name: part,
          path: currentPath,
          type: index === parts.length - 1 ? 'file' : 'folder'
        })
      }
    })

    setBreadcrumbs(breadcrumbs)
  }, [workspaceRoot])

  const handleFileSelect = useCallback((filePath: string) => {
    const fileName = filePath.split('/').pop() || 'Unknown'
    const existingTab = tabs.find(tab => tab.path === filePath)
    
    if (existingTab) {
      setActiveTabId(existingTab.id)
    } else {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: fileName,
        path: filePath,
        isDirty: false,
        language: getLanguageFromPath(filePath),
        content: `// Content of ${fileName}\n// This would be loaded from the file system\n\n`
      }
      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
    }
    updateBreadcrumbs(filePath)
  }, [tabs, updateBreadcrumbs])

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx': case 'ts': return 'typescript'
      case 'jsx': case 'js': return 'javascript'
      case 'py': return 'python'
      case 'rs': return 'rust'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'css': return 'css'
      case 'html': return 'html'
      default: return 'plaintext'
    }
  }

  const handleContentChange = useCallback((content: string) => {
    if (activeTab) {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab.id 
          ? { ...tab, content, isDirty: tab.content !== content }
          : tab
      ))
    }
  }, [activeTab])

  // Mock file tree data
  const mockFileTree: FileNode[] = [
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      isOpen: true,
      children: [
        {
          name: 'components',
          type: 'folder',
          path: '/src/components',
          isOpen: false,
          children: [
            { name: 'App.tsx', type: 'file', path: '/src/components/App.tsx', size: 1024, modified: new Date() },
            { name: 'Header.tsx', type: 'file', path: '/src/components/Header.tsx', size: 512, modified: new Date() }
          ]
        },
        { name: 'main.tsx', type: 'file', path: '/src/main.tsx', size: 256, modified: new Date() },
        { name: 'index.css', type: 'file', path: '/src/index.css', size: 2048, modified: new Date() }
      ]
    },
    { name: 'package.json', type: 'file', path: '/package.json', size: 1536, modified: new Date() },
    { name: 'README.md', type: 'file', path: '/README.md', size: 4096, modified: new Date() }
  ]

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Menu Bar */}
      <MenuBar 
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onSave={handleSave}
        onNewFile={handleNewFile}
        onOpenFile={() => console.log('Open file')}
        onOpenFolder={() => console.log('Open folder')}
        onSaveAs={() => console.log('Save as')}
        onCloseEditor={() => activeTabId && handleTabClose(activeTabId)}
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
            <EnhancedSidebar 
              fileTree={mockFileTree}
              onFileSelect={handleFileSelect}
              onFileCreate={(parentPath, name, type) => console.log('Create:', type, name, 'in', parentPath)}
              onFileDelete={(path) => console.log('Delete:', path)}
              onFileRename={(path, newName) => console.log('Rename:', path, 'to', newName)}
              onFileCopy={(path) => console.log('Copy:', path)}
              onFileCut={(path) => console.log('Cut:', path)}
              onFilePaste={(targetPath) => console.log('Paste to:', targetPath)}
            />
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {tabs.length > 0 && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              onNewTab={handleNewFile}
            />
          )}

          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <Breadcrumb
              items={breadcrumbs}
              onItemClick={(item) => console.log('Navigate to:', item.path)}
            />
          )}

          {/* Editor Area */}
          <div className="flex-1 flex relative overflow-hidden">
            <div className={`
              flex-1 transition-all duration-300
              ${isChatOpen ? 'w-[calc(100%-320px)]' : 'w-full'}
            `}>
              <MonacoEditor 
                activeFile={activeTab?.name || null}
                fileContent={activeTab?.content || ''}
                onFileChange={() => {}}
                onContentChange={handleContentChange}
              />
            </div>

            {/* Right Panels */}
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

          {/* Status Bar */}
          <StatusBar
            activeFile={activeTab?.name || null}
            cursorPosition={cursorPosition}
            language={activeTab?.language || 'plaintext'}
            encoding="UTF-8"
            lineEnding="LF"
            errors={0}
            warnings={0}
            isConnected={true}
            isChatOpen={isChatOpen}
            isTerminalOpen={isTerminalOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          />
        </div>
      </div>

      {/* Overlays */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCommand={(command) => {
          command.action()
          console.log('Execute command:', command.title)
        }}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ExtensionsPanel
        isOpen={isExtensionsOpen}
        onClose={() => setIsExtensionsOpen(false)}
      />
    </div>
  )
}