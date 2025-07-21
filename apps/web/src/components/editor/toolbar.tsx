import { 
  DocumentDuplicateIcon, 
  MagnifyingGlassIcon,
  CodeBracketIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToolbarProps {
  onCopy?: () => void
  onSearch?: () => void
  onSourceControl?: () => void
  onRefresh?: () => void
}

export function Toolbar({ 
  onCopy, 
  onSearch, 
  onSourceControl,
  onRefresh 
}: ToolbarProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  const toolbarItems = [
    {
      icon: DocumentDuplicateIcon,
      label: 'Copy',
      action: onCopy,
      tooltip: 'Copy (Ctrl+C)'
    },
    {
      icon: MagnifyingGlassIcon,
      label: 'Search',
      action: onSearch,
      tooltip: 'Search in Files (Ctrl+Shift+F)'
    },
    {
      icon: CodeBracketIcon,
      label: 'Source Control',
      action: onSourceControl,
      tooltip: 'Source Control (Ctrl+Shift+G)'
    }
  ]

  const moreMenuItems = [
    {
      icon: ArrowPathIcon,
      label: 'Refresh',
      action: onRefresh,
      tooltip: 'Refresh Editor'
    }
    // Add more menu items here
  ]

  return (
    <div className="flex items-center gap-1 px-2">
      {toolbarItems.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors relative group"
          title={item.tooltip}
        >
          <item.icon className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-neutral-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.tooltip}
          </div>
        </button>
      ))}

      {/* More Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors relative group ${
            isMoreMenuOpen ? 'bg-neutral-700 text-neutral-100' : ''
          }`}
          title="More Actions"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isMoreMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg min-w-[160px] py-1 z-50"
            >
              {moreMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action?.()
                    setIsMoreMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2 group"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.tooltip && (
                    <span className="ml-auto text-xs text-neutral-500 group-hover:text-neutral-400">
                      {item.tooltip}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 