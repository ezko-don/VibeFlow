'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { aiService, type Message } from '@/lib/ai'
import ReactMarkdown from 'react-markdown'
import remark from 'remark-gfm'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from '@/components/providers/theme-provider'
import type { AIModel } from '@vibeflow/shared'
import type { Components } from 'react-markdown'

interface ChatPanelProps {
  onClose: () => void
}

const CodeBlock: Components['code'] = ({ inline, className, children }) => {
  const { theme } = useTheme()
  const match = /language-(\w+)/.exec(className || '')
  const code = String(children).replace(/\n$/, '')

  return !inline && match ? (
    <SyntaxHighlighter
      style={theme === 'dark' ? oneDark : oneLight}
      language={match[1]}
      PreTag="div"
    >
      {code}
    </SyntaxHighlighter>
  ) : (
    <code className={className}>{code}</code>
  )
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '👋 Hello! I\'m Claude, your AI coding assistant. I can help you write code, debug issues, explain concepts, and more. What would you like to work on?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    model: 'claude-4'
  }
]

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-4')
  const [aiStatus, setAiStatus] = useState(aiService.getStatus())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Check AI service status on component mount
    const checkStatus = () => {
      const status = aiService.getStatus()
      setAiStatus(status)
      console.log('AI Service Status:', status)
    }

    checkStatus()

    // Check status more frequently initially, then less frequently
    let checkCount = 0
    const interval = setInterval(() => {
      checkStatus()
      checkCount++

      // After 10 checks (20 seconds), reduce frequency
      if (checkCount > 10) {
        clearInterval(interval)
        const slowInterval = setInterval(checkStatus, 10000) // Check every 10 seconds
        return () => clearInterval(slowInterval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const testConnection = async () => {
    console.log('Testing Puter.js connection...')
    console.log('Window puter:', window.puter)

    if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
      try {
        const response = await window.puter.ai.chat('Hello, can you respond with just "Hi"?', {
          model: 'claude-sonnet-4',
          temperature: 0.7,
          max_tokens: 100
        })
        console.log('Test response:', response)
        alert('Connection test successful! Check console for details.')
      } catch (error) {
        console.error('Test failed:', error)
        alert('Connection test failed. Check console for details.')
      }
    } else {
      alert('Puter.js not loaded yet. Please wait and try again.')
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!aiStatus.available) {
      // Try to test connection first
      console.log('AI not available, testing connection...')
      await testConnection()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      console.log('🚀 Sending message:', userMessage.content)

      const response = await aiService.sendMessage(
        [...messages, userMessage],
        selectedModel,
        {
          temperature: 0.7,
          maxTokens: 4000
        }
      )

      console.log('✅ Response received:', response)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        model: selectedModel,
        tokens: response.tokens?.total
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('❌ Request failed:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or check your connection.`,
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }



  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
            disabled={!aiStatus.available}
            className="text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded px-2 py-1.5 disabled:opacity-50"
          >
            <option value="claude-4">Claude 4</option>
            <option value="claude-3.5">Claude 3.5</option>
            <option value="claude-opus">Claude Opus</option>
            <option value="gpt-4.1-nano">GPT-4.1 Nano</option>
            <option value="gpt-4-vision">GPT-4 Vision</option>
            <option value="dalle-3">DALL·E 3</option>
          </select>
          {aiStatus.available ? (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              Loading...
            </span>
          )}
          <button
            onClick={() => {
              console.log('Puter available:', typeof window !== 'undefined' && 'puter' in window)
              console.log('Puter object:', window.puter)
              console.log('AI Service Status:', aiService.getStatus())
            }}
            className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-600 rounded hover:bg-neutral-300 dark:hover:bg-neutral-500"
            title="Debug AI Connection"
          >
            Debug
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'text-right' : ''
              }`}
          >
            <div
              className={`inline-block max-w-[85%] p-3 rounded-lg ${message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                }`}
            >
              <ReactMarkdown
                remarkPlugins={[remark]}
                components={{
                  code: CodeBlock
                }}
              >
                {message.content}
              </ReactMarkdown>
              <div className="mt-1 text-xs opacity-60">
                {message.role === 'assistant' && message.model && (
                  <span className="mr-2">{message.model}</span>
                )}
                <time>
                  {new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric'
                  }).format(message.timestamp)}
                </time>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={aiStatus.available ? "Ask me anything..." : "Waiting for AI service to load..."}
            disabled={!aiStatus.available || isLoading}
            className="flex-1 min-h-[40px] max-h-32 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !aiStatus.available}
            className="px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Press Enter to send, Shift+Enter for new line
          </div>
          {!aiStatus.available && (
            <button
              onClick={testConnection}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Connection
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 