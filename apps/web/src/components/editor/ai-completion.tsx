'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { aiService } from '@/lib/ai'

interface AICompletionProps {
  editor: monaco.editor.IStandaloneCodeEditor | null
  model: monaco.editor.ITextModel | null
}

interface CompletionState {
  suggestion: string
  position: monaco.Position
  isVisible: boolean
}

export function useAICompletion({ editor, model }: AICompletionProps) {
  const [completionState, setCompletionState] = useState<CompletionState>({
    suggestion: '',
    position: new monaco.Position(1, 1),
    isVisible: false
  })
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const ghostTextDecorationRef = useRef<string[]>([])

  // Get AI completion suggestion
  const getAICompletion = useCallback(async (
    code: string, 
    position: monaco.Position,
    language: string
  ): Promise<string> => {
    try {
      const contextBefore = model?.getValueInRange({
        startLineNumber: Math.max(1, position.lineNumber - 10),
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      }) || ''

      const contextAfter = model?.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: Math.min(model?.getLineCount() || 1, position.lineNumber + 5),
        endColumn: model?.getLineMaxColumn(Math.min(model?.getLineCount() || 1, position.lineNumber + 5)) || 1
      }) || ''

      const prompt = `Complete this ${language} code. Only return the completion text, no explanations:

Context before cursor:
\`\`\`${language}
${contextBefore}
\`\`\`

Context after cursor:
\`\`\`${language}
${contextAfter}
\`\`\`

Complete the code at the cursor position. Return only the completion text that should be inserted.`

      const response = await aiService.generateCompletion(prompt, 'claude-4')
      return response.trim()
    } catch (error) {
      console.error('AI completion error:', error)
      return ''
    }
  }, [model])

  // Show ghost text in editor
  const showGhostText = useCallback((suggestion: string, position: monaco.Position) => {
    if (!editor || !suggestion) return

    // Clear previous decorations
    if (ghostTextDecorationRef.current.length > 0) {
      editor.removeDecorations(ghostTextDecorationRef.current)
    }

    // Create ghost text decoration
    const decorations = editor.createDecorationsCollection([
      {
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: {
          after: {
            content: suggestion,
            inlineClassName: 'ghost-text-suggestion'
          }
        }
      }
    ])

    ghostTextDecorationRef.current = [decorations.getDecorations()[0]?.id || '']
  }, [editor])

  // Clear ghost text
  const clearGhostText = useCallback(() => {
    if (editor && ghostTextDecorationRef.current.length > 0) {
      editor.removeDecorations(ghostTextDecorationRef.current)
      ghostTextDecorationRef.current = []
    }
    setCompletionState(prev => ({ ...prev, isVisible: false, suggestion: '' }))
  }, [editor])

  // Accept completion (Tab key)
  const acceptCompletion = useCallback(() => {
    if (!editor || !completionState.isVisible || !completionState.suggestion) return

    const position = editor.getPosition()
    if (!position) return

    editor.executeEdits('ai-completion', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: completionState.suggestion
    }])

    clearGhostText()
  }, [editor, completionState, clearGhostText])

  // Handle cursor position changes and trigger completions
  useEffect(() => {
    if (!editor || !model) return

    const handleCursorChange = () => {
      const position = editor.getPosition()
      if (!position) return

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Clear ghost text on cursor move
      clearGhostText()

      // Debounce AI completion requests
      debounceTimeoutRef.current = setTimeout(async () => {
        const currentLine = model.getLineContent(position.lineNumber)
        const linePrefix = currentLine.substring(0, position.column - 1)
        
        // Only trigger completion if we're at end of line and have some content
        if (linePrefix.trim().length > 2 && position.column === currentLine.length + 1) {
          const language = model.getLanguageId()
          const fullCode = model.getValue()
          
          const suggestion = await getAICompletion(fullCode, position, language)
          
          if (suggestion && suggestion.length > 0) {
            setCompletionState({
              suggestion,
              position,
              isVisible: true
            })
            showGhostText(suggestion, position)
          }
        }
      }, 1000) // 1 second debounce
    }

    const disposable = editor.onDidChangeCursorPosition(handleCursorChange)
    return () => disposable.dispose()
  }, [editor, model, getAICompletion, showGhostText, clearGhostText])

  // Handle Tab key for accepting completions
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: monaco.IKeyboardEvent) => {
      if (e.keyCode === monaco.KeyCode.Tab && completionState.isVisible) {
        e.preventDefault()
        e.stopPropagation()
        acceptCompletion()
      } else if (e.keyCode === monaco.KeyCode.Escape) {
        clearGhostText()
      }
    }

    const disposable = editor.onKeyDown(handleKeyDown)
    return () => disposable.dispose()
  }, [editor, completionState.isVisible, acceptCompletion, clearGhostText])

  return {
    completionState,
    acceptCompletion,
    clearGhostText
  }
}
