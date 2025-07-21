'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  CommandLineIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface TerminalProps {
  onClose: () => void
}

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: Date
}

const mockHistory: TerminalLine[] = [
  {
    id: '1',
    type: 'command',
    content: 'npm --version',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '2',
    type: 'output',
    content: '10.2.4',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: '3',
    type: 'command',
    content: 'ls -la',
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: '4',
    type: 'output',
    content: `total 24
drwxr-xr-x  6 user user  192 Jul 18 10:30 .
drwxr-xr-x  3 user user   96 Jul 18 10:25 ..
-rw-r--r--  1 user user  893 Jul 18 10:30 package.json
drwxr-xr-x  3 user user   96 Jul 18 10:30 src
-rw-r--r--  1 user user  449 Jul 18 10:30 turbo.json
-rw-r--r--  1 user user 4096 Jul 18 10:25 README.md`,
    timestamp: new Date(Date.now() - 1000 * 60 * 3)
  }
]

export function Terminal({ onClose }: TerminalProps) {
  const [history, setHistory] = useState<TerminalLine[]>(mockHistory)
  const [currentCommand, setCurrentCommand] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentDirectory] = useState('/workspace/vibe-flow')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    // Focus input when terminal opens
    inputRef.current?.focus()
  }, [])

  const executeCommand = async (command: string) => {
    if (!command.trim() || isRunning) return

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: command,
      timestamp: new Date()
    }

    setHistory(prev => [...prev, commandLine])
    setCurrentCommand('')
    setIsRunning(true)

    // Simulate command execution
    setTimeout(() => {
      let output = ''
      let type: 'output' | 'error' = 'output'

      // Mock command responses
      switch (command.toLowerCase().trim()) {
        case 'help':
          output = `Available commands:
  help         - Show this help message
  clear        - Clear terminal history
  ls           - List directory contents
  pwd          - Show current directory
  whoami       - Show current user
  date         - Show current date and time
  npm --version - Show npm version
  git status   - Show git repository status
  node --version - Show Node.js version`
          break
        
        case 'clear':
          setHistory([])
          setIsRunning(false)
          return
        
        case 'ls':
        case 'dir':
          output = `package.json  src/  turbo.json  README.md  tsconfig.json`
          break
        
        case 'pwd':
          output = currentDirectory
          break
        
        case 'whoami':
          output = 'developer'
          break
        
        case 'date':
          output = new Date().toString()
          break
        
        case 'npm --version':
          output = '10.2.4'
          break
        
        case 'node --version':
          output = 'v20.9.0'
          break
        
        case 'git status':
          output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/editor/terminal.tsx

no changes added to commit (use "git add ." or "git commit -a")`
          break
        
        default:
          if (command.startsWith('echo ')) {
            output = command.substring(5)
          } else {
            output = `Command not found: ${command}\nType 'help' for available commands.`
            type = 'error'
          }
      }

      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type,
        content: output,
        timestamp: new Date()
      }

      setHistory(prev => [...prev, outputLine])
      setIsRunning(false)
    }, Math.random() * 1000 + 500) // Random delay to simulate real execution
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(currentCommand)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getPrompt = () => {
    return `developer@vibeflow:${currentDirectory}$ `
  }

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm flex flex-col">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 bg-neutral-800 border-b border-neutral-600">
        <div className="flex items-center gap-2">
          <CommandLineIcon className="w-4 h-4" />
          <span className="text-neutral-300 font-semibold">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
            title="Clear terminal"
          >
            <TrashIcon className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neutral-500"
          >
            <p>Welcome to VibeFlow Terminal</p>
            <p>Type 'help' for available commands</p>
            <br />
          </motion.div>
        )}

        {history.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              ${line.type === 'command' ? 'text-green-400' : 
                line.type === 'error' ? 'text-red-400' : 
                'text-neutral-300'}
            `}
          >
            {line.type === 'command' ? (
              <div className="flex">
                <span className="text-yellow-400">{getPrompt()}</span>
                <span>{line.content}</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono">
                {line.content}
              </pre>
            )}
          </motion.div>
        ))}

        {/* Current Input Line */}
        <div className="flex items-center">
          <span className="text-yellow-400">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRunning}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
          {isRunning && (
            <ArrowPathIcon className="w-4 h-4 text-yellow-400 animate-spin ml-2" />
          )}
        </div>

        <div ref={terminalEndRef} />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-neutral-800 border-t border-neutral-600 px-4 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>{currentDirectory}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press Enter to execute</span>
        </div>
      </div>
    </div>
  )
} 