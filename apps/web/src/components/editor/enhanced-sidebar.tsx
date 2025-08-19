'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  path: string
  isOpen?: boolean
  size?: number
  modified?: Date
}

interface ContextMenu {
  x: number
  y: number
  target: FileNode | null
}

interface EnhancedSidebarProps {
  fileTree: FileNode[]
  onFileSelect: (filePath: string) => void
  onFileCreate?: (parentPath: string, name: string, type: 'file' | 'folder') => void
  onFileDelete?: (filePath: string) => void
  onFileRename?: (filePath: string, newName: string) => void
  onFileCopy?: (filePath: string) => void
  onFileCut?: (filePath: string) => void
  onFilePaste?: (targetPath: string) => void
}

export function EnhancedSidebar({ 
  fileTree, 
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileCopy,
  onFileCut,
  onFilePaste
}: EnhancedSidebarProps) {
  const [localFileTree, setLocalFileTree] = useState<FileNode[]>(fileTree)
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [draggedItem, setDraggedItem] = useState<FileNode | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Update local tree when prop changes
  useEffect(() => {
    setLocalFileTree(fileTree)
  }, [fileTree])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: node
    })
  }

  const handleRename = (node: FileNode) => {
    setRenamingFile(node.path)
    setNewFileName(node.name)
    setContextMenu(null)
  }

  const confirmRename = () => {
    if (renamingFile && newFileName.trim() && onFileRename) {
      onFileRename(renamingFile, newFileName.trim())
    }
    setRenamingFile(null)
    setNewFileName('')
  }

  const cancelRename = () => {
    setRenamingFile(null)
    setNewFileName('')
  }

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    setDraggedItem(node)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', node.path)
  }

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    if (node.type === 'folder' && draggedItem && draggedItem.path !== node.path) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDropTarget(node.path)
    }
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault()
    if (draggedItem && targetNode.type === 'folder' && draggedItem.path !== targetNode.path) {
      // Handle file move logic here
      console.log(`Move ${draggedItem.path} to ${targetNode.path}`)
    }
    setDraggedItem(null)
    setDropTarget(null)
  }

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return node.isOpen ? (
        <FolderOpenIcon className="w-4 h-4 text-primary-600" />
      ) : (
        <FolderIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      )
    }

    const ext = node.name.split('.').pop()?.toLowerCase()
    const iconClass = "w-4 h-4"
    
    switch (ext) {
      case 'tsx':
      case 'ts':
        return <span className="text-blue-500 text-sm">🔷</span>
      case 'jsx':
      case 'js':
        return <span className="text-yellow-500 text-sm">🟨</span>
      case 'py':
        return <span className="text-green-500 text-sm">🐍</span>
      case 'rs':
        return <span className="text-orange-500 text-sm">🦀</span>
      case 'json':
        return <span className="text-gray-500 text-sm">📄</span>
      case 'md':
        return <span className="text-blue-400 text-sm">📝</span>
      case 'css':
        return <span className="text-pink-500 text-sm">🎨</span>
      case 'html':
        return <span className="text-orange-400 text-sm">🌐</span>
      default:
        return <DocumentIcon className={`${iconClass} text-accent-600`} />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isFolder = node.type === 'folder'
    const isRenaming = renamingFile === node.path
    const isDragTarget = dropTarget === node.path
    
    return (
      <div key={node.path}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`
            group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer relative
            hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
            ${isDragTarget ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-600' : ''}
          `}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          draggable={!isRenaming}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onClick={() => {
            if (isRenaming) return
            if (isFolder) {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {getFileIcon(node)}
          
          {isRenaming ? (
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRename()
                if (e.key === 'Escape') cancelRename()
              }}
              className="flex-1 px-1 py-0.5 text-sm bg-white dark:bg-neutral-700 border border-primary-500 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="text-sm text-neutral-900 dark:text-neutral-100 select-none flex-1">
              {node.name}
            </span>
          )}

          {/* File metadata */}
          {!isFolder && !isRenaming && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              {node.size && <span>{formatFileSize(node.size)}</span>}
              {node.modified && <span>{formatDate(node.modified)}</span>}
            </div>
          )}

          {/* Context menu trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleContextMenu(e, node)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all"
          >
            <EllipsisVerticalIcon className="w-3 h-3" />
          </button>
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
          isOpen: query ? true : node.isOpen
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
        <div className="flex items-center gap-1">
          <button 
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => onFileCreate?.('', 'New File', 'file')}
            title="New File"
          >
            <DocumentPlusIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <button 
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => onFileCreate?.('', 'New Folder', 'folder')}
            title="New Folder"
          >
            <FolderPlusIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <button 
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => setLocalFileTree(fileTree)}
            title="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
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

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-50 min-w-48"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            {contextMenu.target?.type === 'folder' && (
              <>
                <button
                  onClick={() => {
                    onFileCreate?.(contextMenu.target!.path, 'New File', 'file')
                    setContextMenu(null)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <DocumentPlusIcon className="w-4 h-4" />
                  New File
                </button>
                <button
                  onClick={() => {
                    onFileCreate?.(contextMenu.target!.path, 'New Folder', 'folder')
                    setContextMenu(null)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <FolderPlusIcon className="w-4 h-4" />
                  New Folder
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
              </>
            )}
            
            <button
              onClick={() => handleRename(contextMenu.target!)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Rename
            </button>
            
            <button
              onClick={() => {
                onFileCopy?.(contextMenu.target!.path)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Copy
            </button>
            
            <button
              onClick={() => {
                onFileCut?.(contextMenu.target!.path)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <ScissorsIcon className="w-4 h-4" />
              Cut
            </button>
            
            <button
              onClick={() => {
                onFilePaste?.(contextMenu.target!.path)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Paste
            </button>
            
            <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
            
            <button
              onClick={() => {
                onFileDelete?.(contextMenu.target!.path)
                setContextMenu(null)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}