'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BeakerIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface TestCase {
  id: string
  name: string
  description: string
  code: string
  type: 'unit' | 'integration' | 'e2e'
  status: 'pending' | 'running' | 'passed' | 'failed'
  coverage?: number
  executionTime?: number
}

interface TestSuite {
  id: string
  name: string
  framework: string
  testCases: TestCase[]
  totalCoverage: number
  status: 'idle' | 'generating' | 'running' | 'completed'
}

interface TestGenerationProps {
  editor: any
  monaco: any
  activeFile: string | null
  fileContent: string
  onContentChange: (content: string) => void
}

const mockAITestGeneration = async (code: string, fileName: string): Promise<TestCase[]> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const language = fileName.split('.').pop()?.toLowerCase()
  const isReact = fileName.includes('.tsx') || fileName.includes('.jsx')
  const isFunction = code.includes('function ') || code.includes('const ') || code.includes('export')
  
  const testCases: TestCase[] = []
  
  if (isReact) {
    testCases.push({
      id: '1',
      name: 'Component Rendering Test',
      description: 'Tests if the component renders without crashing',
      type: 'unit',
      status: 'pending',
      code: `import { render, screen } from '@testing-library/react'
import { Component } from './component'

describe('Component', () => {
  test('renders without crashing', () => {
    render(<Component />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})`
    })
    
    testCases.push({
      id: '2',
      name: 'Props Handling Test',
      description: 'Tests component behavior with different props',
      type: 'unit',
      status: 'pending',
      code: `import { render, screen } from '@testing-library/react'
import { Component } from './component'

describe('Component Props', () => {
  test('handles props correctly', () => {
    const props = { title: 'Test Title', active: true }
    render(<Component {...props} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})`
    })
  }
  
  if (isFunction) {
    testCases.push({
      id: '3',
      name: 'Function Logic Test',
      description: 'Tests core function logic and edge cases',
      type: 'unit',
      status: 'pending',
      code: `import { functionName } from './module'

describe('functionName', () => {
  test('returns expected result for valid input', () => {
    const result = functionName('valid input')
    expect(result).toBe('expected output')
  })
  
  test('handles edge cases', () => {
    expect(() => functionName(null)).toThrow()
    expect(functionName('')).toBe('')
  })
})`
    })
  }
  
  // Add integration test
  testCases.push({
    id: '4',
    name: 'Integration Test',
    description: 'Tests integration with other modules',
    type: 'integration',
    status: 'pending',
    code: `import { integrationTest } from './integration-utils'

describe('Module Integration', () => {
  test('integrates with external services', async () => {
    const result = await integrationTest()
    expect(result.status).toBe('success')
  })
})`
  })
  
  return testCases
}

export function TestGeneration({ 
  editor, 
  monaco, 
  activeFile, 
  fileContent,
  onContentChange 
}: TestGenerationProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [testFramework, setTestFramework] = useState('jest')

  // Extract functions from code for test generation
  const extractFunctions = useCallback((code: string): string[] => {
    const functions: string[] = []
    
    // Simple regex patterns to find functions
    const patterns = [
      /export\s+function\s+(\w+)/g,
      /function\s+(\w+)/g,
      /const\s+(\w+)\s*=\s*\(/g,
      /(\w+)\s*:\s*\([^)]*\)\s*=>/g
    ]
    
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(code)) !== null) {
        if (match[1] && !functions.includes(match[1])) {
          functions.push(match[1])
        }
      }
    })
    
    return functions
  }, [])

  // Generate tests for selected function or entire file
  const generateTests = async (targetFunction?: string) => {
    if (!activeFile || !fileContent) return
    
    setIsGenerating(true)
    
    try {
      const testCases = await mockAITestGeneration(fileContent, activeFile)
      
      const newTestSuite: TestSuite = {
        id: Date.now().toString(),
        name: `${activeFile} Tests`,
        framework: testFramework,
        testCases,
        totalCoverage: 0,
        status: 'completed'
      }
      
      setTestSuites(prev => [...prev, newTestSuite])
      setShowPanel(true)
    } catch (error) {
      console.error('Test generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Run individual test case
  const runTest = async (suiteId: string, testId: string) => {
    setTestSuites(prev => prev.map(suite => {
      if (suite.id === suiteId) {
        return {
          ...suite,
          testCases: suite.testCases.map(test => {
            if (test.id === testId) {
              return { ...test, status: 'running' }
            }
            return test
          })
        }
      }
      return suite
    }))
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Random result for demo
    const passed = Math.random() > 0.3
    
    setTestSuites(prev => prev.map(suite => {
      if (suite.id === suiteId) {
        return {
          ...suite,
          testCases: suite.testCases.map(test => {
            if (test.id === testId) {
              return { 
                ...test, 
                status: passed ? 'passed' : 'failed',
                coverage: passed ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 20,
                executionTime: Math.floor(Math.random() * 100) + 10
              }
            }
            return test
          })
        }
      }
      return suite
    }))
  }

  // Apply test to file
  const applyTestToFile = (testCase: TestCase) => {
    if (!activeFile || !editor) return
    
    const testFileName = activeFile.replace(/\.(tsx?|jsx?)$/, '.test.$1')
    const testContent = testCase.code
    
    // In a real implementation, this would create a new file
    // For demo, we'll show the test content in a modal or new tab
    console.log(`Creating test file: ${testFileName}`)
    console.log(testContent)
    
    // You could integrate with the file system service here
    // fileSystemService.createFile(testFileName, testContent)
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor || !monaco) return
    
    const disposables = [
      // Ctrl+Shift+T for test generation
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT, () => {
        generateTests()
      }),
      
      // Ctrl+Alt+T for function-specific test generation
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyT, () => {
        const selection = editor.getSelection()
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection)
          if (selectedText) {
            setSelectedFunction(selectedText)
            generateTests(selectedText)
          }
        }
      })
    ]
    
    return () => {
      disposables.forEach(d => d?.dispose())
    }
  }, [editor, monaco, generateTests])

  // Auto-detect test opportunities
  useEffect(() => {
    if (!fileContent || !activeFile) return
    
    const functions = extractFunctions(fileContent)
    if (functions.length > 0 && !testSuites.some(suite => suite.name.includes(activeFile))) {
      // Show subtle indicator that tests can be generated
      const decoration = {
        range: new monaco.Range(1, 1, 1, 1),
        options: {
          isWholeLine: true,
          className: 'test-generation-highlight',
          glyphMarginClassName: 'test-generation-glyph',
          hoverMessage: { value: `💡 Generate tests for ${functions.length} function(s) - Press Ctrl+Shift+T` }
        }
      }
      
      if (editor) {
        editor.deltaDecorations([], [decoration])
      }
    }
  }, [fileContent, activeFile, editor, monaco, extractFunctions, testSuites])

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'running':
        return <ClockIcon className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'passed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <BeakerIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeColor = (type: TestCase['type']) => {
    switch (type) {
      case 'unit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'integration':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'e2e':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <>
      {/* Test Generation Trigger Button */}
      {activeFile && fileContent && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => generateTests()}
          disabled={isGenerating}
          className="fixed bottom-20 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-50 ai-interactive"
          title="Generate Tests (Ctrl+Shift+T)"
        >
          {isGenerating ? (
            <CogIcon className="w-5 h-5 animate-spin" />
          ) : (
            <BeakerIcon className="w-5 h-5" />
          )}
        </motion.button>
      )}

      {/* Test Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-40 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BeakerIcon className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Generation</h3>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Framework Selector */}
              <div className="mt-3">
                <select
                  value={testFramework}
                  onChange={(e) => setTestFramework(e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="jest">Jest</option>
                  <option value="vitest">Vitest</option>
                  <option value="mocha">Mocha</option>
                  <option value="cypress">Cypress</option>
                </select>
              </div>
            </div>

            {/* Test Suites */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {testSuites.map((suite) => (
                <div key={suite.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{suite.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{suite.framework}</span>
                  </div>
                  
                  {/* Test Cases */}
                  <div className="space-y-2">
                    {suite.testCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className="border border-gray-100 dark:border-gray-600 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(testCase.status)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {testCase.name}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(testCase.type)}`}>
                              {testCase.type}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => runTest(suite.id, testCase.id)}
                              disabled={testCase.status === 'running'}
                              className="p-1 text-gray-400 hover:text-green-500"
                              title="Run Test"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => applyTestToFile(testCase)}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Apply to File"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {testCase.description}
                        </p>
                        
                        {/* Test Results */}
                        {testCase.status !== 'pending' && (
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            {testCase.coverage && (
                              <span>Coverage: {testCase.coverage}%</span>
                            )}
                            {testCase.executionTime && (
                              <span>Time: {testCase.executionTime}ms</span>
                            )}
                          </div>
                        )}
                        
                        {/* Code Preview */}
                        <details className="mt-2">
                          <summary className="text-xs text-blue-500 cursor-pointer">View Code</summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                            <code>{testCase.code}</code>
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                  
                  {/* Suite Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <button
                      onClick={() => suite.testCases.forEach(test => runTest(suite.id, test.id))}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Run All Tests
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {suite.testCases.filter(t => t.status === 'passed').length}/{suite.testCases.length} passed
                    </span>
                  </div>
                </div>
              ))}
              
              {testSuites.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No tests generated yet</p>
                  <p className="text-xs mt-1">Press Ctrl+Shift+T to generate tests</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
