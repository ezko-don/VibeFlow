'use client'

import { useEffect, useCallback } from 'react'

export interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

interface KeyboardShortcuts {
  onNewFile?: () => void
  onOpenFile?: () => void
  onSave?: () => void
  onSaveAs?: () => void
  onToggleTerminal?: () => void
  onToggleChat?: () => void
  onToggleSidebar?: () => void
  onCommandPalette?: () => void
  onSettings?: () => void
  onToggleTheme?: () => void
  onCloseTab?: () => void
  onNextTab?: () => void
  onPrevTab?: () => void
  onFind?: () => void
  onReplace?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
}

// Legacy function for backward compatibility
export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrl === event.ctrlKey
        const shiftMatch = !!shortcut.shift === event.shiftKey
        const altMatch = !!shortcut.alt === event.altKey

        return keyMatch && ctrlMatch && shiftMatch && altMatch
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Enhanced keyboard shortcuts hook
export function useEnhancedKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true') {
      return
    }

    const { ctrlKey, metaKey, shiftKey, altKey, key } = event
    const isCtrlOrCmd = ctrlKey || metaKey

    // Prevent default browser shortcuts when our shortcuts match
    let preventDefault = false

    // File operations
    if (isCtrlOrCmd && key === 'n' && !shiftKey && !altKey) {
      shortcuts.onNewFile?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === 'o' && !shiftKey && !altKey) {
      shortcuts.onOpenFile?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === 's' && !shiftKey && !altKey) {
      shortcuts.onSave?.()
      preventDefault = true
    } else if (isCtrlOrCmd && shiftKey && key === 'S') {
      shortcuts.onSaveAs?.()
      preventDefault = true
    }

    // View toggles
    else if (isCtrlOrCmd && key === '`') {
      shortcuts.onToggleTerminal?.()
      preventDefault = true
    } else if (isCtrlOrCmd && shiftKey && key === 'C') {
      shortcuts.onToggleChat?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === 'b' && !shiftKey && !altKey) {
      shortcuts.onToggleSidebar?.()
      preventDefault = true
    }

    // Command palette
    else if (isCtrlOrCmd && shiftKey && key === 'P') {
      shortcuts.onCommandPalette?.()
      preventDefault = true
    }

    // Settings
    else if (isCtrlOrCmd && key === ',' && !shiftKey && !altKey) {
      shortcuts.onSettings?.()
      preventDefault = true
    }

    // Theme toggle (Ctrl+K, T sequence)
    else if (isCtrlOrCmd && key === 'k' && !shiftKey && !altKey) {
      // Wait for next key for Ctrl+K combinations
      const handleSecondKey = (secondEvent: KeyboardEvent) => {
        if (secondEvent.key === 't') {
          shortcuts.onToggleTheme?.()
          secondEvent.preventDefault()
        }
        document.removeEventListener('keydown', handleSecondKey)
      }
      document.addEventListener('keydown', handleSecondKey)
      preventDefault = true
    }

    // Tab operations
    else if (isCtrlOrCmd && key === 'w' && !shiftKey && !altKey) {
      shortcuts.onCloseTab?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === 'Tab' && !shiftKey) {
      shortcuts.onNextTab?.()
      preventDefault = true
    } else if (isCtrlOrCmd && shiftKey && key === 'Tab') {
      shortcuts.onPrevTab?.()
      preventDefault = true
    }

    // Search operations
    else if (isCtrlOrCmd && key === 'f' && !shiftKey && !altKey) {
      shortcuts.onFind?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === 'h' && !shiftKey && !altKey) {
      shortcuts.onReplace?.()
      preventDefault = true
    }

    // Zoom operations
    else if (isCtrlOrCmd && (key === '=' || key === '+') && !shiftKey && !altKey) {
      shortcuts.onZoomIn?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === '-' && !shiftKey && !altKey) {
      shortcuts.onZoomOut?.()
      preventDefault = true
    } else if (isCtrlOrCmd && key === '0' && !shiftKey && !altKey) {
      shortcuts.onZoomReset?.()
      preventDefault = true
    }

    if (preventDefault) {
      event.preventDefault()
      event.stopPropagation()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Helper function to format keyboard shortcuts for display
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  return shortcut
    .replace(/Ctrl/g, isMac ? '⌘' : 'Ctrl')
    .replace(/Alt/g, isMac ? '⌥' : 'Alt')
    .replace(/Shift/g, isMac ? '⇧' : 'Shift')
    .replace(/\+/g, isMac ? '' : '+')
} 