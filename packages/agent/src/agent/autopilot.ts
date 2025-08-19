import { TaskManager } from './task-manager'
import { ContextEngine } from '../context/engine'
import { AgentTask, AgentTaskType } from '@vibeflow/shared'

export class AutopilotAgent {
  private taskManager: TaskManager
  private contextEngine: ContextEngine
  private isRunning = false

  constructor() {
    this.taskManager = new TaskManager()
    this.contextEngine = new ContextEngine()
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Autopilot agent started')

    // Main autopilot loop
    while (this.isRunning) {
      await this.processNextTask()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    }
  }

  stop(): void {
    this.isRunning = false
    console.log('Autopilot agent stopped')
  }

  async analyzeCodebase(files: { path: string; content: string }[]): Promise<void> {
    for (const file of files) {
      await this.contextEngine.analyzeCode(file.path, file.content)
    }
  }

  async suggestTasks(context: any): Promise<AgentTask[]> {
    const suggestions: AgentTask[] = []

    // Analyze context and suggest appropriate tasks
    if (context.hasErrors) {
      suggestions.push(
        this.taskManager.createTask('code_review', 'Fix compilation errors', context)
      )
    }

    if (context.hasUntested) {
      suggestions.push(
        this.taskManager.createTask('testing', 'Generate missing tests', context)
      )
    }

    if (context.hasUndocumented) {
      suggestions.push(
        this.taskManager.createTask('documentation', 'Add missing documentation', context)
      )
    }

    if (context.hasCodeSmells) {
      suggestions.push(
        this.taskManager.createTask('refactoring', 'Refactor code smells', context)
      )
    }

    return suggestions
  }

  async executeTaskSequence(tasks: AgentTask[]): Promise<void> {
    for (const task of tasks) {
      await this.taskManager.executeTask(task.id)
    }
  }

  private async processNextTask(): Promise<void> {
    const pendingTasks = this.taskManager.getTasksByStatus('pending')
    
    if (pendingTasks.length > 0) {
      await this.taskManager.processQueue()
    }
  }

  getTaskManager(): TaskManager {
    return this.taskManager
  }

  getContextEngine(): ContextEngine {
    return this.contextEngine
  }

  isActive(): boolean {
    return this.isRunning
  }
}
