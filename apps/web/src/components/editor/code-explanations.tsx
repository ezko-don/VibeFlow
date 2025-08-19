'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  InformationCircleIcon,
  XMarkIcon,
  LightBulbIcon,
  CodeBracketIcon,
  BugAntIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import * as monaco from 'monaco-editor'
import { aiService } from '@/lib/ai'

interface CodeExplanationsProps {
  editor: monaco.editor.IStandaloneCodeEditor | null
  model: monaco.editor.ITextModel | null
}

interface ExplanationData {
  text: string
  type: 'explanation' | 'suggestion' | 'warning' | 'error'
  position: { x: number; y: number }
  selectedCode: string
  confidence: number
}

interface CodeInsight {
  type: 'complexity' | 'performance' | 'security' | 'best-practice' | 'bug-risk'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion?: string
}

export function useCodeExplanations({ editor, model }: CodeExplanationsProps) {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<CodeInsight[]>([])
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const explanationTimeoutRef = useRef<NodeJS.Timeout>()

  // Get AI explanation for selected code
  const getCodeExplanation = useCallback(async (
    code: string,
    language: string,
    context: string
  ): Promise<ExplanationData> => {
    try {
      const prompt = `Explain this ${language} code in a clear, concise way. Focus on what it does, how it works, and any important details:

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Context (surrounding code):
\`\`\`${language}
${context}
\`\`\`

Provide:
1. A brief explanation of what this code does
2. Any potential issues or improvements
3. Rate your confidence (1-100)

Format your response as JSON:
{
  "explanation": "Clear explanation of the code",
  "type": "explanation|suggestion|warning|error",
  "confidence": 85,
  "insights": [
    {
      "type": "performance|security|best-practice|bug-risk|complexity",
      "severity": "low|medium|high",
      "message": "Specific insight about the code",
      "suggestion": "Optional suggestion for improvement"
    }
  ]
}

Only return the JSON, no other text.`

      const response = await aiService.generateCompletion(prompt, 'claude-4')
      
      try {
        const parsed = JSON.parse(response)
        return {
          text: parsed.explanation,
          type: parsed.type || 'explanation',
          position: { x: 0, y: 0 }, // Will be set by caller
          selectedCode: code,
          confidence: parsed.confidence || 75
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          text: response.slice(0, 200) + (response.length > 200 ? '...' : ''),
          type: 'explanation',
          position: { x: 0, y: 0 },
          selectedCode: code,
          confidence: 60
        }
      }
    } catch (error) {
      console.error('Code explanation error:', error)
      return {
        text: 'Unable to explain this code at the moment.',
        type: 'error',
        position: { x: 0, y: 0 },
        selectedCode: code,
        confidence: 0
      }
    }
  }, [])

  // Handle mouse hover
  const handleMouseHover = useCallback(async (e: monaco.editor.IEditorMouseEvent) => {
    if (!editor || !model) return

    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    const position = e.target.position
    if (!position) return

    // Only show explanations for code tokens, not whitespace
    const wordAtPosition = model.getWordAtPosition(position)
    if (!wordAtPosition) return

    // Debounce hover explanations
    hoverTimeoutRef.current = setTimeout(async () => {
      const range = new monaco.Range(
        position.lineNumber,
        wordAtPosition.startColumn,
        position.lineNumber,
        wordAtPosition.endColumn
      )

      const selectedText = model.getValueInRange(range)
      if (selectedText.trim().length < 3) return // Skip very short selections

      // Get surrounding context
      const contextRange = new monaco.Range(
        Math.max(1, position.lineNumber - 3),
        1,
        Math.min(model.getLineCount(), position.lineNumber + 3),
        model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + 3))
      )
      const context = model.getValueInRange(contextRange)

      setIsLoading(true)
      const explanationData = await getCodeExplanation(
        selectedText,
        model.getLanguageId(),
        context
      )

      // Calculate position for tooltip
      const domNode = editor.getDomNode()
      if (domNode) {
        const rect = domNode.getBoundingClientRect()
        explanationData.position = {
          x: e.event.posx - rect.left,
          y: e.event.posy - rect.top
        }
      }

      setExplanation(explanationData)
      setIsLoading(false)

      // Auto-hide after 10 seconds
      explanationTimeoutRef.current = setTimeout(() => {
        setExplanation(null)
      }, 10000)
    }, 1000) // 1 second delay
  }, [editor, model, getCodeExplanation])

  // Handle text selection
  const handleSelectionChange = useCallback(async () => {
    if (!editor || !model) return

    const selection = editor.getSelection()
    if (!selection || selection.isEmpty()) {
      return
    }

    const selectedText = model.getValueInRange(selection)
    if (selectedText.trim().length < 10) return // Skip very short selections

    // Get surrounding context
    const contextRange = new monaco.Range(
      Math.max(1, selection.startLineNumber - 5),
      1,
      Math.min(model.getLineCount(), selection.endLineNumber + 5),
      model.getLineMaxColumn(Math.min(model.getLineCount(), selection.endLineNumber + 5))
    )
    const context = model.getValueInRange(contextRange)

    setIsLoading(true)
    const explanationData = await getCodeExplanation(
      selectedText,
      model.getLanguageId(),
      context
    )

    // Position tooltip near selection
    const domNode = editor.getDomNode()
    if (domNode) {
      const rect = domNode.getBoundingClientRect()
      const selectionCoords = editor.getScrolledVisiblePosition(selection.getStartPosition())
      
      if (selectionCoords) {
        explanationData.position = {
          x: selectionCoords.left,
          y: selectionCoords.top - 10
        }
      }
    }

    setExplanation(explanationData)
    setIsLoading(false)

    // Auto-hide after 15 seconds for selections
    explanationTimeoutRef.current = setTimeout(() => {
      setExplanation(null)
    }, 15000)
  }, [editor, model, getCodeExplanation])

  // Set up event listeners
  useEffect(() => {
    if (!editor) return

    const hoverDisposable = editor.onMouseMove(handleMouseHover)
    const selectionDisposable = editor.onDidChangeCursorSelection(handleSelectionChange)

    // Clear explanation when clicking elsewhere
    const clickDisposable = editor.onMouseDown(() => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setExplanation(null)
    })

    return () => {
      hoverDisposable.dispose()
      selectionDisposable.dispose()
      clickDisposable.dispose()
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (explanationTimeoutRef.current) {
        clearTimeout(explanationTimeoutRef.current)
      }
    }
  }, [editor, handleMouseHover, handleSelectionChange])

  // Analyze entire file for insights
  const analyzeFile = useCallback(async () => {
    if (!model) return

    const code = model.getValue()
    if (code.length < 100) return // Skip very small files

    try {
      const analysisPrompt = `Analyze this ${model.getLanguageId()} code for potential issues, improvements, and insights:

\`\`\`${model.getLanguageId()}
${code}
\`\`\`

Look for:
1. Performance issues
2. Security vulnerabilities
3. Code complexity problems
4. Best practice violations
5. Potential bugs

Return insights as JSON array:
[
  {
    "type": "performance|security|best-practice|bug-risk|complexity",
    "severity": "low|medium|high",
    "message": "Description of the issue",
    "suggestion": "How to fix or improve it"
  }
]

Only return the JSON array, no other text.`

      const response = await aiService.generateCompletion(analysisPrompt, 'claude-4')
      
      try {
        const insights = JSON.parse(response)
        setInsights(Array.isArray(insights) ? insights : [])
      } catch (parseError) {
        console.error('Failed to parse insights:', parseError)
      }
    } catch (error) {
      console.error('File analysis error:', error)
    }
  }, [model])

  // Run file analysis when model changes
  useEffect(() => {
    if (model) {
      const timeout = setTimeout(analyzeFile, 2000) // Debounce
      return () => clearTimeout(timeout)
    }
  }, [model, analyzeFile])

  const hideExplanation = useCallback(() => {
    setExplanation(null)
    if (explanationTimeoutRef.current) {
      clearTimeout(explanationTimeoutRef.current)
    }
  }, [])

  return {
    explanation,
    isLoading,
    insights,
    hideExplanation
  }
}

// Explanation Tooltip Component
interface ExplanationTooltipProps {
  explanation: ExplanationData
  onClose: () => void
}

export function ExplanationTooltip({ explanation, onClose }: ExplanationTooltipProps) {
  const getIcon = () => {
    switch (explanation.type) {
      case 'suggestion':
        return <LightBulbIcon className="w-4 h-4 text-yellow-500" />
      case 'warning':
        return <InformationCircleIcon className="w-4 h-4 text-orange-500" />
      case 'error':
        return <BugAntIcon className="w-4 h-4 text-red-500" />
      default:
        return <CodeBracketIcon className="w-4 h-4 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (explanation.type) {
      case 'suggestion':
        return 'border-yellow-200 dark:border-yellow-800'
      case 'warning':
        return 'border-orange-200 dark:border-orange-800'
      case 'error':
        return 'border-red-200 dark:border-red-800'
      default:
        return 'border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className={`absolute z-50 max-w-sm p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border-2 ${getBorderColor()}`}
      style={{
        left: explanation.position.x,
        top: explanation.position.y - 10,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
            {explanation.text}
          </p>
          
          {explanation.confidence > 0 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <SparklesIcon className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-500">
                Confidence: {explanation.confidence}%
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-400" />
        </button>
      </div>
      
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className={`w-3 h-3 border-r-2 border-b-2 ${getBorderColor()} bg-white dark:bg-neutral-900 transform rotate-45 -mt-1.5`} />
      </div>
    </motion.div>
  )
}

// Code Insights Panel Component
interface CodeInsightsPanelProps {
  insights: CodeInsight[]
  isOpen: boolean
  onClose: () => void
}

export function CodeInsightsPanel({ insights, isOpen, onClose }: CodeInsightsPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return '⚡'
      case 'security':
        return '🔒'
      case 'bug-risk':
        return '🐛'
      case 'complexity':
        return '🧩'
      default:
        return '💡'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-4 top-20 w-80 max-h-96 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-40"
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Code Insights
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insights available</p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${getSeverityColor(insight.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {insight.type.replace('-', ' ')} • {insight.severity}
                      </p>
                      <p className="text-sm mt-1 opacity-90">
                        {insight.message}
                      </p>
                      {insight.suggestion && (
                        <p className="text-xs mt-2 opacity-75 italic">
                          💡 {insight.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
