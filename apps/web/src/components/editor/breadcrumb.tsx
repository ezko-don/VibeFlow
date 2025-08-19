'use client'

import { motion } from 'framer-motion'
import { 
  ChevronRightIcon,
  HomeIcon,
  FolderIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  name: string
  path: string
  type: 'workspace' | 'folder' | 'file'
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onItemClick: (item: BreadcrumbItem) => void
}

export function Breadcrumb({ items, onItemClick }: BreadcrumbProps) {
  const getIcon = (type: string, isLast: boolean) => {
    switch (type) {
      case 'workspace':
        return <HomeIcon className="w-4 h-4" />
      case 'folder':
        return <FolderIcon className="w-4 h-4" />
      case 'file':
        return <DocumentIcon className="w-4 h-4" />
      default:
        return <DocumentIcon className="w-4 h-4" />
    }
  }

  if (items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-8 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-3 text-sm overflow-x-auto"
    >
      <div className="flex items-center gap-1 min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <div key={item.path} className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => onItemClick(item)}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 
                  transition-colors min-w-0 max-w-32
                  ${isLast 
                    ? 'text-neutral-900 dark:text-neutral-100 font-medium' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }
                `}
              >
                {getIcon(item.type, isLast)}
                <span className="truncate">
                  {item.name}
                </span>
              </button>
              
              {!isLast && (
                <ChevronRightIcon className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}