'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CodeBracketIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import { useTheme } from '@/components/providers/theme-provider'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditorComponent = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-white dark:bg-neutral-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Loading Monaco Editor...</p>
      </motion.div>
    </div>
  )
})

interface MonacoEditorProps {
  activeFile: string | null
  onFileChange: (fileName: string) => void
}

// Mock file content for demo
const mockFileContent: Record<string, string> = {
  'App.tsx': `import React from 'react'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>VibeFlow Demo</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}

export default App`,
  'main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  'package.json': `{
  "name": "vibe-flow-demo",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}`,
  'README.md': `# VibeFlow Demo

Welcome to VibeFlow! This is a demo project to showcase the AI-powered coding editor.

## Features

- 🎨 Monaco Editor with VS Code quality
- 🤖 AI assistance with Claude & GPT
- 🚀 One-click deployment
- 🔄 Real-time collaboration

## Getting Started

1. Ask AI to help you code
2. Use natural language to describe what you want
3. Watch the magic happen!

Happy coding! ✨`
}

export function MonacoEditor({ activeFile, onFileChange }: MonacoEditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [editor, setEditor] = useState<any>(null)
  const [monaco, setMonaco] = useState<any>(null)
  const { theme, resolvedTheme } = useTheme()

  const getFileLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts': return 'typescript'
      case 'jsx':
      case 'js': return 'javascript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'css': return 'css'
      case 'html': return 'html'
      case 'py': return 'python'
      case 'rs': return 'rust'
      default: return 'plaintext'
    }
  }

  const getFileContent = (fileName: string): string => {
    return mockFileContent[fileName] || `// Welcome to ${fileName}\n// Start coding here!\n\n`
  }

  const setupThemes = (monaco: any) => {
    // Define light theme
    monaco.editor.defineTheme('vibe-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F97316', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: '2563EB' },
        { token: 'function', foreground: '7C3AED' },
        { token: 'variable', foreground: '374151' },
        { token: 'type', foreground: '7C2D12' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#374151',
        'editor.lineHighlightBackground': '#f9fafb',
        'editor.selectionBackground': '#22c55e33',
        'editor.inactiveSelectionBackground': '#22c55e22',
        'editorCursor.foreground': '#22c55e',
        'editorWhitespace.foreground': '#d1d5db',
        'editorLineNumber.foreground': '#9ca3af',
        'editorLineNumber.activeForeground': '#22c55e',
        'editorIndentGuide.background': '#e5e7eb',
        'editorIndentGuide.activeBackground': '#22c55e',
      }
    })

    // Define dark theme
    monaco.editor.defineTheme('vibe-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F97316', fontStyle: 'bold' },
        { token: 'string', foreground: '22C55E' },
        { token: 'number', foreground: '3B82F6' },
        { token: 'function', foreground: '2563EB' },
        { token: 'variable', foreground: 'E5E7EB' },
        { token: 'type', foreground: 'A78BFA' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#fafafa',
        'editor.lineHighlightBackground': '#171717',
        'editor.selectionBackground': '#22c55e33',
        'editor.inactiveSelectionBackground': '#22c55e22',
        'editorCursor.foreground': '#22c55e',
        'editorWhitespace.foreground': '#404040',
        'editorLineNumber.foreground': '#525252',
        'editorLineNumber.activeForeground': '#22c55e',
        'editorIndentGuide.background': '#262626',
        'editorIndentGuide.activeBackground': '#22c55e',
      }
    })
  }

  const getCurrentTheme = () => {
    return resolvedTheme === 'dark' ? 'vibe-dark' : 'vibe-light'
  }

  // Update theme when global theme changes
  useEffect(() => {
    if (monaco && editor) {
      const currentTheme = getCurrentTheme()
      monaco.editor.setTheme(currentTheme)
    }
  }, [resolvedTheme, monaco, editor])

  if (editorError) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Editor Loading Failed
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {editorError}
          </p>
          <button
            onClick={() => {
              setEditorError(null)
              window.location.reload()
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <CodeBracketIcon className="w-16 h-16 text-primary-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome to VibeFlow
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Select a file from the sidebar to start coding, or chat with AI to create new files.
          </p>
          <button
            onClick={() => onFileChange('App.tsx')}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Open App.tsx
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-neutral-900">
      <MonacoEditorComponent
        height="100%"
        language={getFileLanguage(activeFile)}
        value={getFileContent(activeFile)}
        theme={getCurrentTheme()}
        options={{
          automaticLayout: true,
          fontSize: 14,
          lineHeight: 21,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
          minimap: { enabled: true, size: 'proportional' },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'mouseover',
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
        }}
        onMount={(editorInstance, monacoInstance) => {
          console.log('✅ Monaco Editor mounted successfully')
          setEditor(editorInstance)
          setMonaco(monacoInstance)
          setIsEditorReady(true)
          
          try {
            // Setup both light and dark themes
            setupThemes(monacoInstance)
            
            // Set initial theme
            const initialTheme = getCurrentTheme()
            monacoInstance.editor.setTheme(initialTheme)
            
            // Add custom key bindings
            editorInstance.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
              console.log('💾 File saved (mock)')
            })
            
          } catch (error) {
            console.warn('⚠️ Monaco theme setup failed:', error)
          }
        }}
        onValidate={(markers) => {
          // Handle validation markers (errors, warnings)
          if (markers.length > 0) {
            console.log('📝 Validation markers:', markers)
          }
        }}
        loading={
          <div className="h-full flex items-center justify-center bg-white dark:bg-neutral-900">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Initializing editor...</p>
            </motion.div>
          </div>
        }
      />
    </div>
  )
} 