import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface SearchPanelProps {
  onClose: () => void
}

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isRegex, setIsRegex] = useState(false)
  const [matchCase, setMatchCase] = useState(false)
  const [matchWholeWord, setMatchWholeWord] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<{
    file: string
    matches: Array<{
      line: number
      content: string
      start: number
      end: number
    }>
  }>>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    // TODO: Implement actual search functionality
    // This is just a mock result
    setResults([
      {
        file: 'src/components/editor/editor-layout.tsx',
        matches: [
          {
            line: 42,
            content: 'const searchQuery = "example"',
            start: 18,
            end: 27
          }
        ]
      }
    ])
    setIsLoading(false)
  }

  return (
    <div className="h-full bg-neutral-800 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
          <span className="font-semibold text-neutral-100">Search</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-neutral-700">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search in files..."
            className="w-full bg-neutral-900 text-neutral-100 px-4 py-2 rounded-lg pl-10 pr-4"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Search Options */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded border-neutral-600"
            />
            Match Case
          </label>
          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={matchWholeWord}
              onChange={(e) => setMatchWholeWord(e.target.checked)}
              className="rounded border-neutral-600"
            />
            Whole Word
          </label>
          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="rounded border-neutral-600"
            />
            Use Regex
          </label>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-neutral-400">
            <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
            Searching...
          </div>
        ) : results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="mb-4">
              <div className="text-sm text-neutral-400 mb-1">{result.file}</div>
              {result.matches.map((match, matchIndex) => (
                <div
                  key={matchIndex}
                  className="pl-4 py-1 text-sm hover:bg-neutral-700 rounded cursor-pointer group"
                >
                  <div className="flex items-center text-neutral-500">
                    <span className="w-8 text-right mr-2">
                      {match.line}
                    </span>
                    <span className="text-neutral-100">
                      {match.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : searchQuery ? (
          <div className="flex items-center justify-center h-full text-neutral-400">
            No results found
          </div>
        ) : null}
      </div>
    </div>
  )
} 