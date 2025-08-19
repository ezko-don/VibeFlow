'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  DocumentIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface Tab {
  id: string
  name: string
  path: string
  isDirty: boolean
  language: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export function TabBar({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabClose, 
  onNewTab 
}: TabBarProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null)

  const getFileIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'typescript':
        return '🔷'
      case 'javascript':
        return '🟨'
      case 'python':
        return '🐍'
      case 'rust':
        return '🦀'
      case 'json':
        return '📄'
      case 'markdown':
        return '📝'
      case 'css':
        return '🎨'
      case 'html':
        return '🌐'
      default:
        return '📄'
    }
  }

  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTabDragEnd = () => {
    setDraggedTab(null)
  }

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleTabDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()
    if (draggedTab && draggedTab !== targetTabId) {
      // Handle tab reordering logic here
      console.log(`Move tab ${draggedTab} to position of ${targetTabId}`)
    }
    setDraggedTab(null)
  }

  return (
    <div className="h-10 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center overflow-x-auto">
      <AnimatePresence mode="popLayout">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => handleTabDragStart(e, tab.id)}
            onDragEnd={handleTabDragEnd}
            onDragOver={handleTabDragOver}
            onDrop={(e) => handleTabDrop(e, tab.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 min-w-0 max-w-48 cursor-pointer
              border-r border-neutral-200 dark:border-neutral-700 transition-all duration-200
              ${activeTabId === tab.id
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }
              ${draggedTab === tab.id ? 'opacity-50' : ''}
            `}
            onClick={() => onTabSelect(tab.id)}
          >
            {/* File Icon */}
            <span className="text-sm flex-shrink-0">
              {getFileIcon(tab.language)}
            </span>

            {/* File Name */}
            <span className="text-sm truncate flex-1 min-w-0">
              {tab.name}
              {tab.isDirty && (
                <span className="ml-1 text-primary-500">●</span>
              )}
            </span>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className={`
                flex-shrink-0 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 
                transition-colors opacity-0 group-hover:opacity-100
                ${activeTabId === tab.id ? 'opacity-100' : ''}
              `}
            >
              <XMarkIcon className="w-3 h-3" />
            </button>

            {/* Active Tab Indicator */}
            {activeTabId === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="flex-shrink-0 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        title="New Tab"
      >
        <PlusIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      </button>

      {/* Tab Actions */}
      <div className="flex-1" />
      
      {/* Tab Overflow Menu (if needed) */}
      {tabs.length > 8 && (
        <button className="flex-shrink-0 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            +{tabs.length - 8}
          </span>
        </button>
      )}
    </div>
  )
}