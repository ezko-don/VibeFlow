export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  content?: string
  size?: number
  lastModified?: Date
}

export interface FileSystemService {
  getFileTree(): Promise<FileNode[]>
  getFileContent(path: string): Promise<string>
  saveFileContent(path: string, content: string): Promise<void>
  createFile(path: string, content?: string): Promise<void>
  deleteFile(path: string): Promise<void>
  searchFiles(query: string): Promise<FileNode[]>
  getAvailableFiles(): Promise<string[]>
}

// Mock file system for demo purposes
const mockFileSystem: Record<string, string> = {
  'App.tsx': `import React from 'react'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>VibeFlow Demo</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}

export default App`,

  'components/Button.tsx': `import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variantClasses[variant]} \${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }\`}
    >
      {children}
    </button>
  )
}`,

  'utils/helpers.ts': `export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}`,

  'styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

.code-block {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
}`,

  'package.json': `{
  "name": "vibeflow-demo",
  "version": "1.0.0",
  "description": "AI-powered code editor",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.3.0"
  }
}`,

  'README.md': `# VibeFlow Demo Project

This is a demo project showcasing VibeFlow's AI-powered coding capabilities.

## Features

- React components with TypeScript
- Tailwind CSS styling
- Utility functions
- Modern development setup

## Getting Started

1. Install dependencies: \`npm install\`
2. Run development server: \`npm run dev\`
3. Open http://localhost:3000

## AI Integration

Use the AI assistant to:
- Generate new components
- Refactor existing code
- Add documentation
- Fix bugs and issues
`
}

class MockFileSystemService implements FileSystemService {
  async getFileTree(): Promise<FileNode[]> {
    const files = Object.keys(mockFileSystem)
    const tree: FileNode[] = []
    
    files.forEach(filePath => {
      const parts = filePath.split('/')
      let currentLevel = tree
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isFile = i === parts.length - 1
        const fullPath = parts.slice(0, i + 1).join('/')
        
        let existing = currentLevel.find(node => node.name === part)
        
        if (!existing) {
          existing = {
            name: part,
            path: fullPath,
            type: isFile ? 'file' : 'directory',
            children: isFile ? undefined : [],
            content: isFile ? mockFileSystem[filePath] : undefined,
            size: isFile ? mockFileSystem[filePath].length : undefined,
            lastModified: new Date()
          }
          currentLevel.push(existing)
        }
        
        if (!isFile && existing.children) {
          currentLevel = existing.children
        }
      }
    })
    
    return tree
  }

  async getFileContent(path: string): Promise<string> {
    const content = mockFileSystem[path]
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  async saveFileContent(path: string, content: string): Promise<void> {
    mockFileSystem[path] = content
  }

  async createFile(path: string, content: string = ''): Promise<void> {
    mockFileSystem[path] = content
  }

  async deleteFile(path: string): Promise<void> {
    delete mockFileSystem[path]
  }

  async searchFiles(query: string): Promise<FileNode[]> {
    const allFiles = Object.keys(mockFileSystem)
    const matchingFiles = allFiles.filter(path => 
      path.toLowerCase().includes(query.toLowerCase()) ||
      mockFileSystem[path].toLowerCase().includes(query.toLowerCase())
    )
    
    return matchingFiles.map(path => ({
      name: path.split('/').pop() || path,
      path,
      type: 'file' as const,
      content: mockFileSystem[path],
      size: mockFileSystem[path].length,
      lastModified: new Date()
    }))
  }

  async getAvailableFiles(): Promise<string[]> {
    return Object.keys(mockFileSystem)
  }
}

// Export singleton instance
export const fileSystemService = new MockFileSystemService()

// Utility functions for file operations
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export function getFileLanguage(fileName: string): string {
  const extension = getFileExtension(fileName)
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'swift': 'swift',
    'kt': 'kotlin'
  }
  return languageMap[extension] || 'plaintext'
}

export function isImageFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(extension)
}

export function isCodeFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return [
    'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'scss', 'json', 'md',
    'yml', 'yaml', 'xml', 'sql', 'sh', 'bash', 'go', 'rs', 'php', 'rb',
    'java', 'c', 'cpp', 'cs', 'swift', 'kt'
  ].includes(extension)
}
