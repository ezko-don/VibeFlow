import { useState, useCallback, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useKeyboardShortcuts, type ShortcutHandler } from '@/hooks/use-keyboard-shortcuts'

interface MenuItem {
  label: string
  action?: () => void
  shortcut?: string
  submenu?: MenuItem[]
}

interface MenuBarProps {
  onToggleSidebar?: () => void
  onToggleTerminal?: () => void
  onSave?: () => void
  onNewFile?: () => void
  onOpenFile?: () => void
}

export function MenuBar({
  onToggleSidebar,
  onToggleTerminal,
  onSave,
  onNewFile,
  onOpenFile
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleMenuClick = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label)
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action()
    }
    setActiveMenu(null)
  }

  const menuItems: MenuItem[] = [
    {
      label: 'File',
      submenu: [
        { 
          label: 'New File', 
          shortcut: 'Ctrl+N',
          action: onNewFile
        },
        { 
          label: 'Open File...', 
          shortcut: 'Ctrl+O',
          action: onOpenFile
        },
        { 
          label: 'Save', 
          shortcut: 'Ctrl+S',
          action: onSave
        },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
        { label: 'Close Editor', shortcut: 'Ctrl+W' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { 
          label: 'Undo', 
          shortcut: 'Ctrl+Z',
          action: () => document.execCommand('undo')
        },
        { 
          label: 'Redo', 
          shortcut: 'Ctrl+Y',
          action: () => document.execCommand('redo')
        },
        { 
          label: 'Cut', 
          shortcut: 'Ctrl+X',
          action: () => document.execCommand('cut')
        },
        { 
          label: 'Copy', 
          shortcut: 'Ctrl+C',
          action: () => document.execCommand('copy')
        },
        { 
          label: 'Paste', 
          shortcut: 'Ctrl+V',
          action: () => document.execCommand('paste')
        },
        { label: 'Find', shortcut: 'Ctrl+F' },
        { label: 'Replace', shortcut: 'Ctrl+H' }
      ]
    },
    {
      label: 'Selection',
      submenu: [
        { 
          label: 'Select All', 
          shortcut: 'Ctrl+A',
          action: () => document.execCommand('selectAll')
        },
        { label: 'Expand Selection', shortcut: 'Alt+Shift+→' },
        { label: 'Shrink Selection', shortcut: 'Alt+Shift+←' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette', shortcut: 'Ctrl+Shift+P' },
        { 
          label: 'Toggle Sidebar', 
          shortcut: 'Ctrl+B',
          action: onToggleSidebar
        },
        { 
          label: 'Toggle Terminal', 
          shortcut: 'Ctrl+`',
          action: onToggleTerminal
        },
        { label: 'Toggle Full Screen', shortcut: 'F11' }
      ]
    },
    {
      label: 'Go',
      submenu: [
        { label: 'Go to File', shortcut: 'Ctrl+P' },
        { label: 'Go to Line', shortcut: 'Ctrl+G' },
        { label: 'Go Back', shortcut: 'Alt+←' },
        { label: 'Go Forward', shortcut: 'Alt+→' }
      ]
    },
    {
      label: 'Run',
      submenu: [
        { label: 'Start Debugging', shortcut: 'F5' },
        { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
        { label: 'Stop', shortcut: 'Shift+F5' },
        { label: 'Restart', shortcut: 'Ctrl+Shift+F5' }
      ]
    }
  ]

  // Setup keyboard shortcuts
  const shortcuts = menuItems.flatMap(menu => 
    menu.submenu?.map(item => {
      if (!item.shortcut || !item.action) return undefined

      const parts = item.shortcut.split('+')
      const key = parts[parts.length - 1]
      const ctrl = parts.includes('Ctrl')
      const shift = parts.includes('Shift')
      const alt = parts.includes('Alt')

      return {
        key,
        ctrl,
        shift,
        alt,
        handler: item.action
      }
    }).filter((x): x is ShortcutHandler => x !== undefined) ?? []
  )

  useKeyboardShortcuts(shortcuts)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeMenu && !(event.target as Element).closest('.menu-bar')) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeMenu])

  return (
    <div className="h-8 bg-neutral-800 dark:bg-neutral-900 border-b border-neutral-700 flex items-center px-2 menu-bar">
      {menuItems.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => handleMenuClick(menu.label)}
            className={`px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-700 rounded ${
              activeMenu === menu.label ? 'bg-neutral-700' : ''
            }`}
          >
            {menu.label}
          </button>
          
          {activeMenu === menu.label && menu.submenu && (
            <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
              {menu.submenu.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMenuItemClick(item)}
                  className="w-full px-4 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 flex justify-between items-center group"
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-neutral-500 group-hover:text-neutral-400 ml-4">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 