'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon, 
  XMarkIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import * as monaco from 'monaco-editor'
import { aiService } from '@/lib/ai'

interface AICodeGeneratorProps {
  editor: monaco.editor.IStandaloneCodeEditor | null
  model: monaco.editor.ITextModel | null
  isOpen: boolean
  onClose: () => void
}

interface GenerationState {
  isGenerating: boolean
  generatedCode: string
  originalRange: monaco.Range | null
  previewDecorations: string[]
}

export function AICodeGenerator({ editor, model, isOpen, onClose }: AICodeGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    generatedCode: '',
    originalRange: null,
    previewDecorations: []
  })
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const cursorPositionRef = useRef<monaco.Position | null>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      // Store cursor position when modal opens
      cursorPositionRef.current = editor?.getPosition() || null
    }
  }, [isOpen, editor])

  // Generate code with AI
  const generateCode = useCallback(async () => {
    if (!editor || !model || !prompt.trim()) return

    setGenerationState(prev => ({ ...prev, isGenerating: true }))

    try {
      const position = cursorPositionRef.current || editor.getPosition()
      if (!position) return

      // Get context around cursor
      const contextBefore = model.getValueInRange({
        startLineNumber: Math.max(1, position.lineNumber - 20),
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      const contextAfter = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: Math.min(model.getLineCount(), position.lineNumber + 10),
        endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + 10))
      })

      const language = model.getLanguageId()
      const fileName = model.uri.path.split('/').pop() || 'file'

      const aiPrompt = `You are an expert ${language} developer. Generate code based on the user's request.

File: ${fileName}
Language: ${language}

Context before cursor:
\`\`\`${language}
${contextBefore}
\`\`\`

Context after cursor:
\`\`\`${language}
${contextAfter}
\`\`\`

User request: ${prompt}

Generate the code that should be inserted at the cursor position. Return only the code, no explanations or markdown formatting.`

      const generatedCode = await aiService.generateCompletion(aiPrompt, 'claude-4')
      
      if (generatedCode) {
        // Show preview of generated code
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        )

        const decorations = editor.createDecorationsCollection([
          {
            range,
            options: {
              after: {
                content: generatedCode,
                inlineClassName: 'ai-generated-preview'
              },
              className: 'ai-generation-line'
            }
          }
        ])

        setGenerationState({
          isGenerating: false,
          generatedCode,
          originalRange: range,
          previewDecorations: [decorations.getDecorations()[0]?.id || '']
        })
      }
    } catch (error) {
      console.error('Code generation error:', error)
      setGenerationState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [editor, model, prompt])

  // Accept generated code
  const acceptCode = useCallback(() => {
    if (!editor || !generationState.generatedCode || !generationState.originalRange) return

    // Clear preview decorations
    if (generationState.previewDecorations.length > 0) {
      editor.removeDecorations(generationState.previewDecorations)
    }

    // Insert generated code
    editor.executeEdits('ai-code-generation', [{
      range: generationState.originalRange,
      text: generationState.generatedCode
    }])

    // Reset state and close modal
    setPrompt('')
    setGenerationState({
      isGenerating: false,
      generatedCode: '',
      originalRange: null,
      previewDecorations: []
    })
    onClose()
  }, [editor, generationState, onClose])

  // Reject generated code
  const rejectCode = useCallback(() => {
    if (!editor) return

    // Clear preview decorations
    if (generationState.previewDecorations.length > 0) {
      editor.removeDecorations(generationState.previewDecorations)
    }

    setGenerationState({
      isGenerating: false,
      generatedCode: '',
      originalRange: null,
      previewDecorations: []
    })
  }, [editor, generationState.previewDecorations])

  // Handle modal close
  const handleClose = useCallback(() => {
    rejectCode()
    setPrompt('')
    onClose()
  }, [rejectCode, onClose])

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (!generationState.isGenerating && prompt.trim()) {
        generateCode()
      }
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 ai-generation-modal flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="ai-generation-input w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Generate Code with AI
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Input */}
            <div className="mb-4">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what code you want to generate... (Ctrl+Enter to generate)"
                className="w-full h-32 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">Ctrl+Enter</kbd> to generate
              </div>
              
              <div className="flex items-center gap-2">
                {generationState.generatedCode && (
                  <>
                    <button
                      onClick={rejectCode}
                      className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      Reject
                    </button>
                    <button
                      onClick={acceptCode}
                      className="px-4 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center gap-1.5 text-sm"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Accept
                    </button>
                  </>
                )}
                
                {!generationState.generatedCode && (
                  <button
                    onClick={generateCode}
                    disabled={generationState.isGenerating || !prompt.trim()}
                    className="px-4 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                  >
                    {generationState.isGenerating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                    Generate
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
