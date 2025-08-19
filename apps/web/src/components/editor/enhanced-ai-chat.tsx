'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { aiService, type Message } from '@/lib/ai'
import ReactMarkdown from 'react-markdown'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from '@/components/providers/theme-provider'
import type { AIModel } from '@vibeflow/shared'
import type { Components } from 'react-markdown'

interface EnhancedAIChatProps {
  onClose: () => void
  onApplyCode?: (code: string, fileName?: string) => void
  availableFiles?: string[]
  currentFile?: string
}

interface FileReference {
  name: string
  path: string
  content?: string
}

interface CodeBlock {
  language: string
  code: string
  fileName?: string
}

const CodeBlockComponent: Components['code'] = ({ className, children }) => {
  const { theme } = useTheme()
  const match = /language-(\w+)/.exec(className || '')
  const code = String(children).replace(/\n$/, '')

  if (match) {
    return (
      <div className="relative group">
        <SyntaxHighlighter
          style={theme === 'dark' ? oneDark : oneLight}
          language={match[1]}
          PreTag="div"
          className="rounded-lg"
        >
          {code}
        </SyntaxHighlighter>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="absolute top-2 right-2 p-1.5 bg-neutral-800 dark:bg-neutral-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <code className={`${className} bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm`}>
      {code}
    </code>
  )
}

export function EnhancedAIChat({ onClose, onApplyCode, availableFiles = [], currentFile }: EnhancedAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hello! I\'m your AI coding assistant. I can help you write code, debug issues, and explain concepts.\n\n**New features:**\n- Use `@filename` to reference specific files\n- I can apply code changes directly to your files\n- Ask me to generate, modify, or explain code\n\nWhat would you like to work on?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      model: 'claude-4'
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [referencedFiles, setReferencedFiles] = useState<FileReference[]>([])
  const [showFileSuggestions, setShowFileSuggestions] = useState(false)
  const [fileSuggestionQuery, setFileSuggestionQuery] = useState('')
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Parse @file mentions from input
  const parseFileMentions = useCallback((text: string): string[] => {
    const mentions = text.match(/@[\w\-\.\/]+/g) || []
    return mentions.map(mention => mention.substring(1)) // Remove @ symbol
  }, [])

  // Get file suggestions based on query
  const getFileSuggestions = useCallback((query: string) => {
    if (!query) return availableFiles.slice(0, 5)
    
    return availableFiles
      .filter(file => file.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
  }, [availableFiles])

  // Handle input changes and detect @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtSymbol !== -1) {
      const queryAfterAt = textBeforeCursor.substring(lastAtSymbol + 1)
      if (!queryAfterAt.includes(' ') && queryAfterAt.length >= 0) {
        setFileSuggestionQuery(queryAfterAt)
        setShowFileSuggestions(true)
        return
      }
    }
    
    setShowFileSuggestions(false)
  }

  // Insert file mention
  const insertFileMention = (fileName: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = input.substring(0, cursorPosition)
    const textAfterCursor = input.substring(cursorPosition)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtSymbol !== -1) {
      const newText = textBeforeCursor.substring(0, lastAtSymbol + 1) + fileName + ' ' + textAfterCursor
      setInput(newText)
      setShowFileSuggestions(false)
      
      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus()
        const newCursorPos = lastAtSymbol + fileName.length + 2
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      model: 'claude-4'
    }

    // Parse file mentions
    const mentions = parseFileMentions(input)
    const fileRefs: FileReference[] = mentions.map(fileName => ({
      name: fileName,
      path: fileName,
      content: `// Content of ${fileName} would be loaded here`
    }))

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setReferencedFiles(fileRefs)

    try {
      // Build context with file references
      let contextualPrompt = input.trim()
      
      if (fileRefs.length > 0) {
        contextualPrompt += '\n\n**Referenced files:**\n'
        fileRefs.forEach(file => {
          contextualPrompt += `\n### ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`
        })
      }

      if (currentFile) {
        contextualPrompt += `\n\n**Current file:** ${currentFile}`
      }

      const response = await aiService.sendMessage([
        { 
          id: Date.now().toString(), 
          role: 'user', 
          content: contextualPrompt, 
          timestamp: new Date() 
        }
      ])
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: 'claude-4'
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        model: 'claude-4'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Extract and apply code from message
  const extractAndApplyCode = (content: string, fileName?: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = [...content.matchAll(codeBlockRegex)]
    
    if (matches.length > 0) {
      const firstMatch = matches[0]
      const language = firstMatch[1] || 'text'
      const code = firstMatch[2].trim()
      
      if (onApplyCode) {
        onApplyCode(code, fileName || currentFile)
      }
    }
  }

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    } else if (e.key === 'Escape') {
      if (showFileSuggestions) {
        setShowFileSuggestions(false)
      } else {
        onClose()
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            AI Assistant
          </h3>
          {referencedFiles.length > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
              {referencedFiles.length} file{referencedFiles.length > 1 ? 's' : ''} referenced
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code: CodeBlockComponent
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  
                  {/* Apply Code Button */}
                  {message.content.includes('```') && onApplyCode && (
                    <button
                      onClick={() => extractAndApplyCode(message.content)}
                      className="mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm flex items-center gap-1.5"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Apply Code
                    </button>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="text-neutral-600 dark:text-neutral-400 text-sm ml-2">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative p-4 border-t border-neutral-200 dark:border-neutral-700">
        {/* File Suggestions */}
        <AnimatePresence>
          {showFileSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-40 overflow-y-auto"
            >
              {getFileSuggestions(fileSuggestionQuery).map((file) => (
                <button
                  key={file}
                  onClick={() => insertFileMention(file)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <DocumentTextIcon className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm">{file}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your code... Use @filename to reference files"
              className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-neutral-400">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded">Ctrl+Enter</kbd> to send
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
