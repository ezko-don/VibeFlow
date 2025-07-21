import { useState } from 'react'
import { 
  XMarkIcon,
  CodeBracketIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface SourceControlPanelProps {
  onClose: () => void
}

interface Change {
  file: string
  status: 'modified' | 'added' | 'deleted' | 'untracked'
  staged: boolean
}

export function SourceControlPanel({ onClose }: SourceControlPanelProps) {
  const [commitMessage, setCommitMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [changes, setChanges] = useState<Change[]>([
    // Mock data - replace with actual git status
    { file: 'src/components/editor/editor-layout.tsx', status: 'modified', staged: false },
    { file: 'src/components/editor/toolbar.tsx', status: 'added', staged: true },
    { file: 'src/styles/main.css', status: 'deleted', staged: false }
  ])

  const handleStageChange = (file: string) => {
    setChanges(changes.map(change => 
      change.file === file 
        ? { ...change, staged: !change.staged }
        : change
    ))
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) return
    setIsLoading(true)
    // TODO: Implement actual git commit
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setCommitMessage('')
  }

  const getStatusIcon = (status: Change['status']) => {
    switch (status) {
      case 'modified':
        return <ArrowPathIcon className="w-4 h-4 text-yellow-500" />
      case 'added':
        return <PlusIcon className="w-4 h-4 text-green-500" />
      case 'deleted':
        return <MinusIcon className="w-4 h-4 text-red-500" />
      case 'untracked':
        return <PlusIcon className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="h-full bg-neutral-800 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <CodeBracketIcon className="w-5 h-5 text-neutral-400" />
          <span className="font-semibold text-neutral-100">Source Control</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Changes */}
      <div className="flex-1 overflow-y-auto p-2">
        {changes.map((change) => (
          <div
            key={change.file}
            className={`
              flex items-center gap-2 p-2 rounded cursor-pointer
              ${change.staged ? 'bg-neutral-700' : 'hover:bg-neutral-700'}
            `}
            onClick={() => handleStageChange(change.file)}
          >
            <input
              type="checkbox"
              checked={change.staged}
              onChange={() => handleStageChange(change.file)}
              className="rounded border-neutral-600"
            />
            {getStatusIcon(change.status)}
            <span className="text-sm text-neutral-300 flex-1 truncate">
              {change.file}
            </span>
          </div>
        ))}
      </div>

      {/* Commit Section */}
      <div className="p-4 border-t border-neutral-700">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message"
          className="w-full bg-neutral-900 text-neutral-100 px-3 py-2 rounded-lg mb-2 resize-none h-20"
        />
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim() || isLoading}
          className={`
            w-full py-2 rounded-lg flex items-center justify-center gap-2
            ${
              commitMessage.trim() && !isLoading
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-neutral-700 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <CheckIcon className="w-5 h-5" />
          )}
          Commit Changes
        </button>
      </div>
    </div>
  )
} 