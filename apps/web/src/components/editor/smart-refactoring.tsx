'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WrenchScrewdriverIcon,
  BugAntIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import * as monaco from 'monaco-editor'
import { aiService } from '@/lib/ai'

interface SmartRefactoringProps {
  editor: monaco.editor.IStandaloneCodeEditor | null
  model: monaco.editor.ITextModel | null
}

interface RefactoringSuggestion {
  id: string
  type: 'bug-fix' | 'performance' | 'readability' | 'security' | 'modernization'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  originalCode: string
  refactoredCode: string
  range: monaco.Range
  confidence: number
  reasoning: string
}

interface BugDetection {
  id: string
  type: 'syntax' | 'logic' | 'runtime' | 'memory' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  line: number
  column: number
  suggestion: string
  autoFixable: boolean
}

export function useSmartRefactoring({ editor, model }: SmartRefactoringProps) {
  const [suggestions, setSuggestions] = useState<RefactoringSuggestion[]>([])
  const [bugs, setBugs] = useState<BugDetection[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<RefactoringSuggestion | null>(null)
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout>()

  // Analyze code for refactoring opportunities
  const analyzeCode = useCallback(async () => {
    if (!model || !editor) return

    const code = model.getValue()
    if (code.length < 50) return

    setIsAnalyzing(true)
    
    try {
      const language = model.getLanguageId()
      const analysisPrompt = `Analyze this ${language} code for refactoring opportunities and potential bugs. Provide detailed suggestions for improvement.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Look for:
1. Potential bugs (syntax, logic, runtime, memory leaks, security issues)
2. Performance improvements
3. Code readability enhancements
4. Security vulnerabilities
5. Modernization opportunities
6. Best practice violations

For each issue found, provide:
- The problematic code snippet
- A refactored version
- Explanation of why it's better
- Confidence level (1-100)

Return your analysis as JSON:
{
  "suggestions": [
    {
      "type": "bug-fix|performance|readability|security|modernization",
      "severity": "low|medium|high|critical",
      "title": "Brief title of the issue",
      "description": "Detailed description",
      "originalCode": "The problematic code",
      "refactoredCode": "The improved code",
      "lineStart": 1,
      "lineEnd": 5,
      "confidence": 85,
      "reasoning": "Why this change is beneficial"
    }
  ],
  "bugs": [
    {
      "type": "syntax|logic|runtime|memory|security",
      "severity": "low|medium|high|critical",
      "message": "Description of the bug",
      "line": 10,
      "column": 5,
      "suggestion": "How to fix it",
      "autoFixable": true
    }
  ]
}

Only return the JSON, no other text.`

      const response = await aiService.generateCompletion(analysisPrompt, 'claude-4')
      
      try {
        const analysis = JSON.parse(response)
        
        // Process suggestions
        const processedSuggestions: RefactoringSuggestion[] = (analysis.suggestions || []).map((s: any, index: number) => ({
          id: `suggestion-${index}`,
          type: s.type || 'readability',
          severity: s.severity || 'medium',
          title: s.title || 'Code improvement',
          description: s.description || '',
          originalCode: s.originalCode || '',
          refactoredCode: s.refactoredCode || '',
          range: new monaco.Range(
            s.lineStart || 1,
            1,
            s.lineEnd || 1,
            model.getLineMaxColumn(s.lineEnd || 1)
          ),
          confidence: s.confidence || 70,
          reasoning: s.reasoning || ''
        }))

        // Process bugs
        const processedBugs: BugDetection[] = (analysis.bugs || []).map((b: any, index: number) => ({
          id: `bug-${index}`,
          type: b.type || 'logic',
          severity: b.severity || 'medium',
          message: b.message || 'Potential issue detected',
          line: b.line || 1,
          column: b.column || 1,
          suggestion: b.suggestion || '',
          autoFixable: b.autoFixable || false
        }))

        setSuggestions(processedSuggestions)
        setBugs(processedBugs)

        // Add decorations for issues
        addIssueDecorations(processedSuggestions, processedBugs)
        
      } catch (parseError) {
        console.error('Failed to parse refactoring analysis:', parseError)
      }
    } catch (error) {
      console.error('Refactoring analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [model, editor])

  // Add visual decorations for issues
  const addIssueDecorations = useCallback((
    suggestions: RefactoringSuggestion[],
    bugs: BugDetection[]
  ) => {
    if (!editor) return

    const decorations: monaco.editor.IModelDeltaDecoration[] = []

    // Add decorations for suggestions
    suggestions.forEach(suggestion => {
      const className = getSuggestionDecorationClass(suggestion.type, suggestion.severity)
      decorations.push({
        range: suggestion.range,
        options: {
          className,
          hoverMessage: {
            value: `**${suggestion.title}**\n\n${suggestion.description}\n\n*Confidence: ${suggestion.confidence}%*`
          },
          minimap: {
            color: getSuggestionMinimapColor(suggestion.severity),
            position: monaco.editor.MinimapPosition.Inline
          }
        }
      })
    })

    // Add decorations for bugs
    bugs.forEach(bug => {
      const range = new monaco.Range(bug.line, bug.column, bug.line, bug.column + 10)
      decorations.push({
        range,
        options: {
          className: getBugDecorationClass(bug.severity),
          hoverMessage: {
            value: `**${bug.type.toUpperCase()} BUG**\n\n${bug.message}\n\n${bug.suggestion}`
          },
          minimap: {
            color: getBugMinimapColor(bug.severity),
            position: monaco.editor.MinimapPosition.Inline
          }
        }
      })
    })

    editor.createDecorationsCollection(decorations)
  }, [editor])

  // Apply refactoring suggestion
  const applySuggestion = useCallback((suggestion: RefactoringSuggestion) => {
    if (!editor || !model) return

    editor.executeEdits('smart-refactoring', [{
      range: suggestion.range,
      text: suggestion.refactoredCode
    }])

    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    setSelectedSuggestion(null)
  }, [editor, model])

  // Auto-fix bugs
  const autoFixBug = useCallback(async (bug: BugDetection) => {
    if (!bug.autoFixable || !editor || !model) return

    try {
      const fixPrompt = `Generate a fix for this ${bug.type} bug:

Bug: ${bug.message}
Location: Line ${bug.line}, Column ${bug.column}
Suggestion: ${bug.suggestion}

Current code around the bug:
\`\`\`
${model.getValueInRange(new monaco.Range(
  Math.max(1, bug.line - 2),
  1,
  Math.min(model.getLineCount(), bug.line + 2),
  model.getLineMaxColumn(Math.min(model.getLineCount(), bug.line + 2))
))}
\`\`\`

Return only the fixed code for the specific line, no explanations.`

      const fixedCode = await aiService.generateCompletion(fixPrompt, 'claude-4')
      
      const range = new monaco.Range(bug.line, 1, bug.line, model.getLineMaxColumn(bug.line))
      editor.executeEdits('auto-bug-fix', [{
        range,
        text: fixedCode.trim()
      }])

      // Remove fixed bug
      setBugs(prev => prev.filter(b => b.id !== bug.id))
    } catch (error) {
      console.error('Auto-fix error:', error)
    }
  }, [editor, model])

  // Debounced analysis on code changes
  useEffect(() => {
    if (!model) return

    const disposable = model.onDidChangeContent(() => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
      
      analysisTimeoutRef.current = setTimeout(analyzeCode, 3000) // 3 second delay
    })

    // Initial analysis
    analyzeCode()

    return () => {
      disposable.dispose()
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [model, analyzeCode])

  return {
    suggestions,
    bugs,
    isAnalyzing,
    selectedSuggestion,
    setSelectedSuggestion,
    applySuggestion,
    autoFixBug,
    analyzeCode
  }
}

// Helper functions for decorations
const getSuggestionDecorationClass = (type: string, severity: string) => {
  const base = 'smart-refactoring-suggestion'
  return `${base} ${base}-${type} ${base}-${severity}`
}

const getBugDecorationClass = (severity: string) => {
  const base = 'smart-refactoring-bug'
  return `${base} ${base}-${severity}`
}

const getSuggestionMinimapColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#dc2626'
    case 'high': return '#ea580c'
    case 'medium': return '#d97706'
    default: return '#0ea5e9'
  }
}

const getBugMinimapColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#991b1b'
    case 'high': return '#dc2626'
    case 'medium': return '#ea580c'
    default: return '#f59e0b'
  }
}

// Smart Refactoring Panel Component
interface SmartRefactoringPanelProps {
  suggestions: RefactoringSuggestion[]
  bugs: BugDetection[]
  isAnalyzing: boolean
  selectedSuggestion: RefactoringSuggestion | null
  onSelectSuggestion: (suggestion: RefactoringSuggestion) => void
  onApplySuggestion: (suggestion: RefactoringSuggestion) => void
  onAutoFixBug: (bug: BugDetection) => void
  onReanalyze: () => void
  isOpen: boolean
  onClose: () => void
}

export function SmartRefactoringPanel({
  suggestions,
  bugs,
  isAnalyzing,
  selectedSuggestion,
  onSelectSuggestion,
  onApplySuggestion,
  onAutoFixBug,
  onReanalyze,
  isOpen,
  onClose
}: SmartRefactoringPanelProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
      default:
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug-fix':
        return <BugAntIcon className="w-4 h-4" />
      case 'performance':
        return '⚡'
      case 'security':
        return '🔒'
      case 'modernization':
        return '🚀'
      default:
        return <WrenchScrewdriverIcon className="w-4 h-4" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-4 top-20 w-96 max-h-[80vh] bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Smart Refactoring
              </h3>
              {isAnalyzing && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onReanalyze}
                disabled={isAnalyzing}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
                title="Re-analyze code"
              >
                <SparklesIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Summary */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BugAntIcon className="w-4 h-4 text-red-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {bugs.length} bugs found
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {suggestions.length} improvements
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Bugs Section */}
              {bugs.length > 0 && (
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                    <BugAntIcon className="w-4 h-4 text-red-500" />
                    Bugs Detected
                  </h4>
                  <div className="space-y-2">
                    {bugs.map(bug => (
                      <div
                        key={bug.id}
                        className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(bug.severity)}
                              <span className="text-sm font-medium text-red-800 dark:text-red-300 capitalize">
                                {bug.type} Bug
                              </span>
                              <span className="text-xs text-red-600 dark:text-red-400">
                                Line {bug.line}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                              {bug.message}
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 italic">
                              {bug.suggestion}
                            </p>
                          </div>
                          {bug.autoFixable && (
                            <button
                              onClick={() => onAutoFixBug(bug)}
                              className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Auto Fix
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions Section */}
              {suggestions.length > 0 && (
                <div className="p-4">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-4 h-4 text-blue-500" />
                    Refactoring Suggestions
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map(suggestion => (
                      <div
                        key={suggestion.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedSuggestion?.id === suggestion.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                        onClick={() => onSelectSuggestion(suggestion)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {typeof getTypeIcon(suggestion.type) === 'string' ? (
                                <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                              ) : (
                                getTypeIcon(suggestion.type)
                              )}
                              {getSeverityIcon(suggestion.severity)}
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {suggestion.title}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <SparklesIcon className="w-3 h-3" />
                              <span>Confidence: {suggestion.confidence}%</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onApplySuggestion(suggestion)
                            }}
                            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-3 h-3" />
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isAnalyzing && suggestions.length === 0 && bugs.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No issues found in your code!</p>
                  <p className="text-xs mt-1">Your code looks great.</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Suggestion Details */}
          {selectedSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800/50"
            >
              <h5 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Code Comparison
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">
                    Before:
                  </label>
                  <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 overflow-x-auto">
                    <code>{selectedSuggestion.originalCode}</code>
                  </pre>
                </div>
                <div className="flex justify-center">
                  <ArrowRightIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">
                    After:
                  </label>
                  <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 overflow-x-auto">
                    <code>{selectedSuggestion.refactoredCode}</code>
                  </pre>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    <strong>Why:</strong> {selectedSuggestion.reasoning}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
