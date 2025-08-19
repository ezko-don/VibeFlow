import { AgentTask, AgentTaskType } from '@vibeflow/shared'

export class TaskManager {
  private tasks: Map<string, AgentTask> = new Map()
  private taskQueue: string[] = []
  private isProcessing = false

  createTask(type: AgentTaskType, description: string, context?: any): AgentTask {
    const task: AgentTask = {
      id: this.generateTaskId(),
      type,
      description,
      status: 'pending',
      createdAt: new Date(),
      context
    }

    this.tasks.set(task.id, task)
    this.taskQueue.push(task.id)
    
    return task
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }

    task.status = 'running'
    task.startedAt = new Date()

    try {
      switch (task.type) {
        case 'code_generation':
          await this.executeCodeGeneration(task)
          break
        case 'code_review':
          await this.executeCodeReview(task)
          break
        case 'refactoring':
          await this.executeRefactoring(task)
          break
        case 'testing':
          await this.executeTesting(task)
          break
        case 'documentation':
          await this.executeDocumentation(task)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      task.status = 'completed'
      task.completedAt = new Date()
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.completedAt = new Date()
    }
  }

  private async executeCodeGeneration(task: AgentTask): Promise<void> {
    // Implementation for code generation
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  private async executeCodeReview(task: AgentTask): Promise<void> {
    // Implementation for code review
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  private async executeRefactoring(task: AgentTask): Promise<void> {
    // Implementation for refactoring
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  private async executeTesting(task: AgentTask): Promise<void> {
    // Implementation for testing
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  private async executeDocumentation(task: AgentTask): Promise<void> {
    // Implementation for documentation
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.taskQueue.length > 0) {
      const taskId = this.taskQueue.shift()
      if (taskId) {
        await this.executeTask(taskId)
      }
    }

    this.isProcessing = false
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId)
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
  }

  getTasksByStatus(status: AgentTask['status']): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status)
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
