'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { aiService, type Message } from '@/lib/ai'

interface ChatPanelProps {
  onClose: () => void
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '👋 Hello! I\'m Claude, your AI coding assistant powered by Puter.js. I can help you write code, debug issues, explain concepts, and more. What would you like to work on?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    model: 'claude-3.5-sonnet'
  }
]

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'claude-3.5-sonnet' | 'gpt-4o'>('claude-3.5-sonnet')
  const [aiStatus, setAiStatus] = useState(aiService.getStatus())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Check AI service status on component mount
    const checkStatus = () => {
      setAiStatus(aiService.getStatus())
    }
    
    checkStatus()
    
    // Check status periodically in case Puter.js loads after component mount
    const interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!aiStatus.available) {
      alert('AI service is not available. Please make sure Puter.js is loaded and try again.')
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
      console.log('🚀 Sending message to AI service:', userMessage.content)

      const response = await aiService.sendMessage(
        [...messages, userMessage],
        selectedModel,
        {
          temperature: 0.7,
          maxTokens: 4000
        }
      )

      console.log('✅ AI response received:', response)

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
      console.error('❌ AI request failed:', error)
      
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content: string) => {
    // Simple code block highlighting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = content.split(codeBlockRegex)
    
    return parts.map((part, index) => {
      if (index % 3 === 2) { // Code content
        return (
          <pre key={index} className="bg-neutral-800 text-neutral-100 p-3 rounded-lg my-2 overflow-x-auto text-sm">
            <code>{part}</code>
          </pre>
        )
      } else if (index % 3 === 1) { // Language identifier
        return null
      } else { // Regular text
        // Handle markdown-style formatting
        const boldRegex = /\*\*(.*?)\*\*/g
        const formattedText = part.replace(boldRegex, '<strong>$1</strong>')
        
        return (
          <span 
            key={index} 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        )
      }
    }).filter(Boolean)
  }

  const availableModels = aiService.getAvailableModels()

  return (
    <div className="h-full bg-white dark:bg-neutral-800 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            AI Assistant
          </span>
          <div className="flex items-center gap-1">
            {aiStatus.available ? (
              <CheckCircleIcon className="w-4 h-4 text-green-500" title="AI service is available" />
            ) : (
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" title="AI service loading..." />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as 'claude-3.5-sonnet' | 'gpt-4o')}
            disabled={!aiStatus.available}
            className="text-xs bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded px-2 py-1 disabled:opacity-50"
          >
            {availableModels.length > 0 ? (
              availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))
            ) : (
              <option value="">Loading models...</option>
            )}
          </select>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* AI Status Banner */}
      {!aiStatus.available && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>AI service is loading... Please wait for Puter.js to initialize.</span>
          </div>
        </div>
      )}

      {aiStatus.available && aiStatus.rateLimits && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
            <CheckCircleIcon className="w-4 h-4" />
            <span>✨ Free unlimited Claude API ready! ({aiStatus.rateLimits.note})</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${message.role === 'user' 
                ? 'bg-primary-500 text-white' 
                : selectedModel === 'claude-3.5-sonnet'
                  ? 'bg-accent-500 text-white'
                  : 'bg-secondary-500 text-white'
              }
            `}>
              {message.role === 'user' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <CpuChipIcon className="w-4 h-4" />
              )}
            </div>
            
            <div className={`
              flex-1 max-w-[85%]
              ${message.role === 'user' ? 'text-right' : ''}
            `}>
              <div className={`
                chat-bubble text-sm
                ${message.role === 'user' ? 'user' : 'assistant'}
              `}>
                {formatMessage(message.content)}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {message.model && (
                  <span className="ml-2 capitalize">• {message.model.replace('-', ' ')}</span>
                )}
                {message.tokens && (
                  <span className="ml-2">• {message.tokens} tokens</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
              <CpuChipIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="chat-bubble assistant">
                <div className="flex items-center gap-2">
                  <div className="spinner" />
                  <span>Claude is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiStatus.available ? "Ask Claude to help with your code..." : "Waiting for AI service to load..."}
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
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          Press Enter to send, Shift+Enter for new line
          {aiStatus.available && (
            <span className="ml-2">• Powered by Puter.js free API</span>
          )}
        </div>
      </div>
    </div>
  )
} 