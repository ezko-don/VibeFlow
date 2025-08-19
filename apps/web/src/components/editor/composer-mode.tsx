'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  XCircleIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { aiService } from '@/lib/ai'
import { fileSystemService } from '@/lib/file-system'

interface ComposerModeProps {
  isOpen: boolean
  onClose: () => void
  availableFiles: string[]
  onApplyChanges: (changes: FileChange[]) => void
}

interface FileChange {
  filePath: string
  content: string
  action: 'create' | 'modify' | 'delete'
  description: string
}

interface ExecutionStep {
  id: string
  description: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  fileChanges: FileChange[]
  error?: string
}

interface ComposerPlan {
  id: string
  title: string
  description: string
  steps: ExecutionStep[]
  estimatedTime: string
}

export function ComposerMode({ isOpen, onClose, availableFiles, onApplyChanges }: ComposerModeProps) {
  const [prompt, setPrompt] = useState('')
  const [plan, setPlan] = useState<ComposerPlan | null>(null)
  const [isPlanning, setIsPlanning] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [executionMode, setExecutionMode] = useState<'manual' | 'auto'>('manual')
  
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Generate execution plan
  const generatePlan = useCallback(async () => {
    if (!prompt.trim()) return

    setIsPlanning(true)
    try {
      const planningPrompt = `You are an expert software architect. Create a detailed execution plan for the following request:

"${prompt}"

Available files in the project:
${availableFiles.map(file => `- ${file}`).join('\n')}

Create a step-by-step plan that:
1. Analyzes what needs to be done
2. Identifies which files need to be created/modified/deleted
3. Breaks down the work into logical steps
4. Estimates time for each step

Return your response in this JSON format:
{
  "title": "Brief title for the plan",
  "description": "Detailed description of what will be accomplished",
  "estimatedTime": "Total estimated time (e.g., '5-10 minutes')",
  "steps": [
    {
      "id": "step1",
      "description": "What this step accomplishes",
      "fileChanges": [
        {
          "filePath": "path/to/file.tsx",
          "action": "create|modify|delete",
          "description": "What changes will be made to this file"
        }
      ]
    }
  ]
}

Only return the JSON, no other text.`

      const response = await aiService.generateCompletion(planningPrompt, 'claude-4')
      
      try {
        const planData = JSON.parse(response)
        const newPlan: ComposerPlan = {
          id: Date.now().toString(),
          title: planData.title,
          description: planData.description,
          estimatedTime: planData.estimatedTime,
          steps: planData.steps.map((step: any) => ({
            ...step,
            status: 'pending' as const,
            fileChanges: step.fileChanges || []
          }))
        }
        setPlan(newPlan)
      } catch (parseError) {
        console.error('Failed to parse plan JSON:', parseError)
        // Fallback to simple plan
        setPlan({
          id: Date.now().toString(),
          title: 'Custom Implementation',
          description: prompt,
          estimatedTime: '5-10 minutes',
          steps: [{
            id: 'step1',
            description: 'Implement the requested changes',
            status: 'pending',
            fileChanges: []
          }]
        })
      }
    } catch (error) {
      console.error('Planning error:', error)
    } finally {
      setIsPlanning(false)
    }
  }, [prompt, availableFiles])

  // Execute a single step
  const executeStep = useCallback(async (stepIndex: number) => {
    if (!plan || stepIndex >= plan.steps.length) return

    const step = plan.steps[stepIndex]
    
    // Update step status to executing
    setPlan(prev => prev ? {
      ...prev,
      steps: prev.steps.map((s, i) => 
        i === stepIndex ? { ...s, status: 'executing' } : s
      )
    } : null)

    try {
      // Generate actual file changes for this step
      const fileChanges: FileChange[] = []
      
      for (const plannedChange of step.fileChanges) {
        const generatePrompt = `Generate the complete file content for: ${plannedChange.filePath}

Context: ${step.description}
Action: ${plannedChange.action}
Description: ${plannedChange.description}

Original request: "${prompt}"

${plannedChange.action === 'modify' ? `
Current file content:
\`\`\`
${await fileSystemService.getFileContent(plannedChange.filePath).catch(() => '// File not found')}
\`\`\`
` : ''}

Generate the complete ${plannedChange.action === 'delete' ? 'empty' : 'file'} content. Return only the code, no explanations.`

        const content = await aiService.generateCompletion(generatePrompt, 'claude-4')
        
        fileChanges.push({
          filePath: plannedChange.filePath,
          content: content.trim(),
          action: plannedChange.action,
          description: plannedChange.description
        })
      }

      // Update step with generated changes
      setPlan(prev => prev ? {
        ...prev,
        steps: prev.steps.map((s, i) => 
          i === stepIndex ? { 
            ...s, 
            status: 'completed',
            fileChanges 
          } : s
        )
      } : null)

    } catch (error) {
      console.error('Step execution error:', error)
      setPlan(prev => prev ? {
        ...prev,
        steps: prev.steps.map((s, i) => 
          i === stepIndex ? { 
            ...s, 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : s
        )
      } : null)
    }
  }, [plan, prompt])

  // Execute all steps
  const executeAllSteps = useCallback(async () => {
    if (!plan) return

    setIsExecuting(true)
    setCurrentStepIndex(0)

    for (let i = 0; i < plan.steps.length; i++) {
      setCurrentStepIndex(i)
      await executeStep(i)
      
      // If in manual mode, wait for user approval
      if (executionMode === 'manual' && i < plan.steps.length - 1) {
        // In a real implementation, this would pause and wait for user input
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setIsExecuting(false)
  }, [plan, executionMode, executeStep])

  // Apply all changes
  const applyAllChanges = useCallback(() => {
    if (!plan) return

    const allChanges: FileChange[] = []
    plan.steps.forEach(step => {
      if (step.status === 'completed') {
        allChanges.push(...step.fileChanges)
      }
    })

    onApplyChanges(allChanges)
    onClose()
  }, [plan, onApplyChanges, onClose])

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (!plan && !isPlanning) {
        generatePlan()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Composer Mode
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Multi-file AI agent for complex changes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Panel - Input & Plan */}
              <div className="w-1/2 p-6 border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
                {!plan ? (
                  <>
                    <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                      Describe your changes
                    </h3>
                    <textarea
                      ref={inputRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe what you want to build or change across multiple files..."
                      className="flex-1 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-neutral-500">
                        <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">Ctrl+Enter</kbd> to generate plan
                      </div>
                      <button
                        onClick={generatePlan}
                        disabled={!prompt.trim() || isPlanning}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isPlanning ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CogIcon className="w-4 h-4" />
                        )}
                        {isPlanning ? 'Planning...' : 'Generate Plan'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                        Execution Plan
                      </h3>
                      <button
                        onClick={() => setPlan(null)}
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      >
                        Edit Request
                      </button>
                    </div>
                    
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        {plan.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {plan.description}
                      </p>
                      <div className="text-xs text-neutral-500">
                        Estimated time: {plan.estimatedTime}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                      {plan.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`p-3 rounded-lg border ${
                            step.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                            step.status === 'executing' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                            step.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                            'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'executing' ? 'bg-blue-500 text-white' :
                              step.status === 'failed' ? 'bg-red-500 text-white' :
                              'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                            }`}>
                              {step.status === 'completed' ? <CheckIcon className="w-3 h-3" /> :
                               step.status === 'failed' ? <XCircleIcon className="w-3 h-3" /> :
                               index + 1}
                            </div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {step.description}
                            </span>
                          </div>
                          
                          {step.fileChanges.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {step.fileChanges.map((change, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                  <DocumentTextIcon className="w-3 h-3" />
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    change.action === 'create' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                    change.action === 'modify' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                                    'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  }`}>
                                    {change.action}
                                  </span>
                                  <span>{change.filePath}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.error && (
                            <div className="ml-8 mt-2 text-xs text-red-600 dark:text-red-400">
                              Error: {step.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={executeAllSteps}
                        disabled={isExecuting}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isExecuting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            Execute Plan
                          </>
                        )}
                      </button>
                      
                      {plan.steps.some(s => s.status === 'completed') && (
                        <button
                          onClick={applyAllChanges}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Apply Changes
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right Panel - Preview */}
              <div className="w-1/2 p-6 bg-neutral-50 dark:bg-neutral-800/50">
                <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                  Preview Changes
                </h3>
                
                {plan && plan.steps.some(s => s.status === 'completed') ? (
                  <div className="space-y-4">
                    {plan.steps
                      .filter(s => s.status === 'completed')
                      .flatMap(s => s.fileChanges)
                      .map((change, index) => (
                        <div key={index} className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                          <div className="flex items-center gap-2 mb-3">
                            <DocumentTextIcon className="w-4 h-4 text-neutral-500" />
                            <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                              {change.filePath}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              change.action === 'create' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              change.action === 'modify' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                              'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            }`}>
                              {change.action}
                            </span>
                          </div>
                          <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-x-auto">
                            <code>{change.content.slice(0, 500)}{change.content.length > 500 ? '...' : ''}</code>
                          </pre>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
                    <div className="text-center">
                      <CogIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Execute the plan to see file changes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
