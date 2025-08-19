'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface SettingCategory {
  id: string
  name: string
  icon: React.ComponentType<any>
  settings: Setting[]
}

interface Setting {
  id: string
  name: string
  description: string
  type: 'boolean' | 'select' | 'number' | 'text' | 'color'
  value: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeCategory, setActiveCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<Record<string, any>>({
    'editor.fontSize': 14,
    'editor.fontFamily': 'JetBrains Mono',
    'editor.tabSize': 2,
    'editor.wordWrap': 'on',
    'editor.minimap.enabled': true,
    'editor.lineNumbers': 'on',
    'workbench.colorTheme': 'vibe-dark',
    'workbench.iconTheme': 'vs-seti',
    'terminal.integrated.fontSize': 12,
    'files.autoSave': 'afterDelay',
    'git.enableSmartCommit': true,
    'extensions.autoUpdate': true
  })

  const categories: SettingCategory[] = [
    {
      id: 'general',
      name: 'General',
      icon: Cog6ToothIcon,
      settings: [
        {
          id: 'files.autoSave',
          name: 'Auto Save',
          description: 'Controls auto save of dirty files',
          type: 'select',
          value: settings['files.autoSave'],
          options: [
            { label: 'Off', value: 'off' },
            { label: 'After Delay', value: 'afterDelay' },
            { label: 'On Focus Change', value: 'onFocusChange' },
            { label: 'On Window Change', value: 'onWindowChange' }
          ]
        },
        {
          id: 'extensions.autoUpdate',
          name: 'Auto Update Extensions',
          description: 'Automatically update extensions',
          type: 'boolean',
          value: settings['extensions.autoUpdate']
        }
      ]
    },
    {
      id: 'editor',
      name: 'Editor',
      icon: CodeBracketIcon,
      settings: [
        {
          id: 'editor.fontSize',
          name: 'Font Size',
          description: 'Controls the font size in pixels',
          type: 'number',
          value: settings['editor.fontSize'],
          min: 8,
          max: 40
        },
        {
          id: 'editor.fontFamily',
          name: 'Font Family',
          description: 'Controls the font family',
          type: 'select',
          value: settings['editor.fontFamily'],
          options: [
            { label: 'JetBrains Mono', value: 'JetBrains Mono' },
            { label: 'Fira Code', value: 'Fira Code' },
            { label: 'SF Mono', value: 'SF Mono' },
            { label: 'Monaco', value: 'Monaco' },
            { label: 'Consolas', value: 'Consolas' }
          ]
        },
        {
          id: 'editor.tabSize',
          name: 'Tab Size',
          description: 'The number of spaces a tab is equal to',
          type: 'number',
          value: settings['editor.tabSize'],
          min: 1,
          max: 8
        },
        {
          id: 'editor.wordWrap',
          name: 'Word Wrap',
          description: 'Controls how lines should wrap',
          type: 'select',
          value: settings['editor.wordWrap'],
          options: [
            { label: 'Off', value: 'off' },
            { label: 'On', value: 'on' },
            { label: 'Word Wrap Column', value: 'wordWrapColumn' },
            { label: 'Bounded', value: 'bounded' }
          ]
        },
        {
          id: 'editor.minimap.enabled',
          name: 'Minimap',
          description: 'Controls whether the minimap is shown',
          type: 'boolean',
          value: settings['editor.minimap.enabled']
        },
        {
          id: 'editor.lineNumbers',
          name: 'Line Numbers',
          description: 'Controls the display of line numbers',
          type: 'select',
          value: settings['editor.lineNumbers'],
          options: [
            { label: 'Off', value: 'off' },
            { label: 'On', value: 'on' },
            { label: 'Relative', value: 'relative' },
            { label: 'Interval', value: 'interval' }
          ]
        }
      ]
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: PaintBrushIcon,
      settings: [
        {
          id: 'workbench.colorTheme',
          name: 'Color Theme',
          description: 'Specifies the color theme used in the workbench',
          type: 'select',
          value: settings['workbench.colorTheme'],
          options: [
            { label: 'Vibe Dark', value: 'vibe-dark' },
            { label: 'Vibe Light', value: 'vibe-light' },
            { label: 'VS Code Dark+', value: 'vs-dark' },
            { label: 'VS Code Light+', value: 'vs-light' },
            { label: 'GitHub Dark', value: 'github-dark' },
            { label: 'GitHub Light', value: 'github-light' }
          ]
        },
        {
          id: 'workbench.iconTheme',
          name: 'File Icon Theme',
          description: 'Specifies the file icon theme used in the workbench',
          type: 'select',
          value: settings['workbench.iconTheme'],
          options: [
            { label: 'Seti (VS Code)', value: 'vs-seti' },
            { label: 'Minimal', value: 'vs-minimal' },
            { label: 'None', value: null }
          ]
        }
      ]
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: CodeBracketIcon,
      settings: [
        {
          id: 'terminal.integrated.fontSize',
          name: 'Font Size',
          description: 'Controls the font size in pixels of the terminal',
          type: 'number',
          value: settings['terminal.integrated.fontSize'],
          min: 8,
          max: 40
        }
      ]
    }
  ]

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }))
  }

  const renderSettingControl = (setting: Setting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600"></div>
          </label>
        )
      
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            min={setting.min}
            max={setting.max}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
            className="px-3 py-2 w-20 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
          />
        )
      
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
          />
        )
      
      default:
        return null
    }
  }

  const filteredCategories = categories.map(category => ({
    ...category,
    settings: category.settings.filter(setting =>
      setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.settings.length > 0)

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
          Settings
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-32 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  w-full p-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
                  ${activeCategory === category.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500 text-primary-700 dark:text-primary-300' 
                    : 'text-neutral-700 dark:text-neutral-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs text-center">{category.name}</div>
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredCategories.map(category => {
            if (searchQuery || category.id === activeCategory) {
              return (
                <div key={category.id} className="space-y-6">
                  {searchQuery && (
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                      {category.name}
                    </h3>
                  )}
                  
                  {category.settings.map(setting => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {setting.name}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {setting.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {renderSettingControl(setting)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </motion.div>
  )
}