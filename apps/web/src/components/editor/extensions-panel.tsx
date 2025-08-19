'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  StarIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface Extension {
  id: string
  name: string
  displayName: string
  description: string
  version: string
  publisher: string
  rating: number
  downloads: number
  category: string
  isInstalled: boolean
  isEnabled: boolean
  icon?: string
}

interface ExtensionsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ExtensionsPanel({ isOpen, onClose }: ExtensionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: 'ms-python.python',
      name: 'python',
      displayName: 'Python',
      description: 'IntelliSense, linting, debugging, code navigation, code formatting, refactoring, variable explorer, test explorer',
      version: '2024.0.1',
      publisher: 'Microsoft',
      rating: 4.5,
      downloads: 50000000,
      category: 'Programming Languages',
      isInstalled: true,
      isEnabled: true,
      icon: '🐍'
    },
    {
      id: 'ms-vscode.vscode-typescript-next',
      name: 'typescript',
      displayName: 'TypeScript',
      description: 'Rich TypeScript support for Visual Studio Code',
      version: '5.3.2',
      publisher: 'Microsoft',
      rating: 4.8,
      downloads: 30000000,
      category: 'Programming Languages',
      isInstalled: true,
      isEnabled: true,
      icon: '🔷'
    },
    {
      id: 'rust-lang.rust-analyzer',
      name: 'rust-analyzer',
      displayName: 'Rust Analyzer',
      description: 'Rust language support for Visual Studio Code',
      version: '0.4.1',
      publisher: 'rust-lang',
      rating: 4.7,
      downloads: 5000000,
      category: 'Programming Languages',
      isInstalled: false,
      isEnabled: false,
      icon: '🦀'
    },
    {
      id: 'esbenp.prettier-vscode',
      name: 'prettier',
      displayName: 'Prettier - Code formatter',
      description: 'Code formatter using prettier',
      version: '10.1.0',
      publisher: 'Prettier',
      rating: 4.6,
      downloads: 25000000,
      category: 'Formatters',
      isInstalled: true,
      isEnabled: true,
      icon: '💅'
    },
    {
      id: 'ms-vscode.vscode-json',
      name: 'json',
      displayName: 'JSON Language Features',
      description: 'Provides rich language support for JSON files',
      version: '1.0.0',
      publisher: 'Microsoft',
      rating: 4.3,
      downloads: 40000000,
      category: 'Programming Languages',
      isInstalled: true,
      isEnabled: true,
      icon: '📄'
    },
    {
      id: 'github.copilot',
      name: 'copilot',
      displayName: 'GitHub Copilot',
      description: 'Your AI pair programmer',
      version: '1.156.0',
      publisher: 'GitHub',
      rating: 4.4,
      downloads: 15000000,
      category: 'AI Tools',
      isInstalled: false,
      isEnabled: false,
      icon: '🤖'
    }
  ])

  const categories = [
    'all',
    'Programming Languages',
    'Formatters',
    'AI Tools',
    'Themes',
    'Debuggers',
    'Linters',
    'Snippets'
  ]

  const toggleExtension = (extensionId: string) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extensionId 
        ? { ...ext, isInstalled: !ext.isInstalled, isEnabled: !ext.isInstalled }
        : ext
    ))
  }

  const toggleExtensionEnabled = (extensionId: string) => {
    setExtensions(prev => prev.map(ext => 
      ext.id === extensionId 
        ? { ...ext, isEnabled: !ext.isEnabled }
        : ext
    ))
  }

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ext.publisher.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory
    
    const matchesTab = activeTab === 'installed' ? ext.isInstalled : true
    
    return matchesSearch && matchesCategory && matchesTab
  })

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`
    }
    return downloads.toString()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Extensions
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab('installed')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'installed'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }
          `}
        >
          Installed ({extensions.filter(e => e.isInstalled).length})
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === 'marketplace'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }
          `}
        >
          Marketplace
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredExtensions.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            <PuzzlePieceIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No extensions found</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredExtensions.map(extension => (
              <motion.div
                key={extension.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {extension.icon || '🧩'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {extension.displayName}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          by {extension.publisher}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {extension.isInstalled ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExtensionEnabled(extension.id)}
                              className={`
                                px-3 py-1 text-xs rounded-full transition-colors
                                ${extension.isEnabled
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                }
                              `}
                            >
                              {extension.isEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => toggleExtension(extension.id)}
                              className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            >
                              Uninstall
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleExtension(extension.id)}
                            className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors flex items-center gap-1"
                          >
                            <CloudArrowDownIcon className="w-3 h-3" />
                            Install
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
                      {extension.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{extension.rating}</span>
                        </div>
                        <span>{formatDownloads(extension.downloads)} downloads</span>
                      </div>
                      <span>v{extension.version}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}