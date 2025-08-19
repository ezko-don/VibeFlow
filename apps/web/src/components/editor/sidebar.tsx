'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  path: string
  isOpen?: boolean
}

interface SidebarProps {
  fileTree: FileNode[]
  onFileSelect: (filePath: string) => void
}

export function Sidebar({ fileTree, onFileSelect }: SidebarProps) {
  const [localFileTree, setLocalFileTree] = useState<FileNode[]>(fileTree)
  const [searchQuery, setSearchQuery] = useState('')

  // Update local tree when prop changes
  useEffect(() => {
    setLocalFileTree(fileTree)
  }, [fileTree])

  const toggleFolder = (path: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen }
        }
        
        if (node.children) {
          return { ...node, children: updateTree(node.children) }
        }
        
        return node
      })
    }
    
    setLocalFileTree(updateTree(localFileTree))
  }

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isFolder = node.type === 'folder'
    
    return (
      <div key={node.path}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer
            hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
            ${depth > 0 ? `ml-${depth * 4}` : ''}
          `}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
        >
          {isFolder ? (
            node.isOpen ? (
              <FolderOpenIcon className="w-4 h-4 text-primary-600" />
            ) : (
              <FolderIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            )
          ) : (
            <DocumentIcon className="w-4 h-4 text-accent-600" />
          )}
          
          <span className="text-sm text-neutral-900 dark:text-neutral-100 select-none">
            {node.name}
          </span>
        </motion.div>
        
        {isFolder && node.isOpen && node.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map(child => 
              renderFileNode(child, depth + 1)
            )}
          </motion.div>
        )}
      </div>
    )
  }

  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    return nodes.filter(node => {
      const matchesName = node.name.toLowerCase().includes(query.toLowerCase())
      
      if (node.children) {
        const filteredChildren = filterTree(node.children, query)
        if (filteredChildren.length > 0) {
          return true
        }
      }
      
      return matchesName
    }).map(node => {
      if (node.children) {
        return {
          ...node,
          children: filterTree(node.children, query),
          isOpen: query ? true : node.isOpen // Auto-expand when searching
        }
      }
      return node
    })
  }

  const filteredTree = filterTree(localFileTree, searchQuery)

  return (
    <div className="flex-1 flex flex-col">
      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* File Tree Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
          Explorer
        </span>
        <button 
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          onClick={() => setLocalFileTree(fileTree)} // Reset file tree
        >
          <ArrowPathIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No matching files' : 'No files in workspace'}
            </p>
          </div>
        ) : (
          filteredTree.map(node => renderFileNode(node))
        )}
      </div>
    </div>
  )
} 