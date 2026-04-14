'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useAICompletion } from './ai-completion'

const MonacoEditorComponent = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading Monaco Editor...</div>
})

interface MonacoEditorProps {
  activeFile: string | null
  fileContent: string
  onFileChange: (fileName: string) => void
  onContentChange: (content: string) => void
  onOpenComposer?: () => void
}

export function MonacoEditor({ 
  activeFile, 
  fileContent, 
  onFileChange, 
  onContentChange,
  onOpenComposer 
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)
  const [generatorPosition, setGeneratorPosition] = useState<{ line: number; column: number } | null>(null)

  // Initialize AI completion hook
  const { 
    completionState, 
    acceptCompletion, 
    clearGhostText 
  } = useAICompletion({ editor: editorRef.current, model: editorRef.current?.getModel() || null })

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setIsEditorReady(true)

    // Define Gruvbox Dark theme
    monaco.editor.defineTheme('gruvbox-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '928374', fontStyle: 'italic' },
        { token: 'string', foreground: 'b8bb26' },
        { token: 'keyword', foreground: 'fb4934' },
        { token: 'number', foreground: 'd3869b' },
        { token: 'type', foreground: 'fabd2f' },
        { token: 'class', foreground: 'fabd2f' },
        { token: 'function', foreground: '8ec07c' },
        { token: 'variable', foreground: 'ebdbb2' },
        { token: 'constant', foreground: 'd3869b' },
        { token: 'parameter', foreground: 'fe8019' },
        { token: 'identifier', foreground: 'ebdbb2' },
        { token: 'operator', foreground: 'fb4934' },
        { token: 'delimiter', foreground: 'ebdbb2' },
        { token: 'tag', foreground: 'fb4934' },
        { token: 'attribute.name', foreground: 'fabd2f' },
        { token: 'attribute.value', foreground: 'b8bb26' }
      ],
      colors: {
        'editor.background': '#282828',
        'editor.foreground': '#ebdbb2',
        'editor.lineHighlightBackground': '#3c3836',
        'editorCursor.foreground': '#ebdbb2',
        'editor.selectionBackground': '#665c54',
        'editor.inactiveSelectionBackground': '#665c5480',
        'minimap.background': '#282828',
        'scrollbarSlider.background': '#665c5480',
        'scrollbarSlider.hoverBackground': '#665c54a0',
        'scrollbarSlider.activeBackground': '#665c54c0'
      }
    })

    // Configure editor options for better AI integration
    editor.updateOptions({
      minimap: {
        enabled: true,
        maxColumn: 100,
        scale: 1
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
      renderWhitespace: 'selection',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      }
    })

    // Set the Gruvbox theme
    monaco.editor.setTheme('gruvbox-dark')

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const position = editor.getPosition()
      if (position) {
        setGeneratorPosition({ line: position.lineNumber, column: position.column })
        setShowCodeGenerator(true)
      }
    })

    // Ctrl+I for Composer Mode
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      onOpenComposer?.()
    })

    // Tab to accept AI completion
    editor.addCommand(monaco.KeyCode.Tab, () => {
      if (completionState && completionState.isVisible && completionState.suggestion) {
        acceptCompletion()
        return null // Prevent default tab behavior
      }
      return undefined // Allow default tab behavior
    })

    // Escape to reject AI completion
    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (completionState) {
        clearGhostText()
        return null
      }
      return undefined
    })

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue()
      onContentChange(value)
    })

    // Focus the editor
    editor.focus()
  }

  const handleCodeGeneration = (code: string) => {
    if (editorRef.current && generatorPosition) {
      const editor = editorRef.current
      const model = editor.getModel()
      
      if (model) {
        const range = {
          startLineNumber: generatorPosition.line,
          startColumn: generatorPosition.column,
          endLineNumber: generatorPosition.line,
          endColumn: generatorPosition.column
        }
        
        editor.executeEdits('ai-generation', [{
          range,
          text: code
        }])
        
        // Move cursor to end of inserted code
        const lines = code.split('\n')
        const endLine = generatorPosition.line + lines.length - 1
        const endColumn = lines.length === 1 
          ? generatorPosition.column + code.length 
          : lines[lines.length - 1].length + 1
        
        editor.setPosition({ lineNumber: endLine, column: endColumn })
        editor.focus()
      }
    }
    setShowCodeGenerator(false)
    setGeneratorPosition(null)
  }

  const getLanguageFromFileName = (fileName: string | null): string => {
    if (!fileName) return 'plaintext'
    
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'r': 'r',
      'matlab': 'matlab',
      'lua': 'lua',
      'perl': 'perl',
      'vim': 'vim'
    }
    
    return languageMap[extension || ''] || 'plaintext'
  }

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to VibeFlow
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your AI-powered code editor with Cursor-like features
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-400 dark:text-gray-500">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">Ctrl+K: AI Generation</span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded">Ctrl+I: Composer Mode</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">Tab: Accept AI</span>
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded">Hover: Explanations</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <MonacoEditorComponent
        height="100%"
        language={getLanguageFromFileName(activeFile)}
        value={fileContent}
        theme="gruvbox-dark"
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: true, maxColumn: 100, scale: 1 },
          fontSize: 14,
          lineHeight: 22,
          fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: true,
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          }
        }}
      />

      {/* AI Features Indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="ai-features-badge px-3 py-1 rounded-full text-white text-xs font-medium">
          AI Enhanced
        </div>
        {completionState && (
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs animate-pulse">
            AI Suggesting
          </div>
        )}
      </div>
    </div>
  )
}