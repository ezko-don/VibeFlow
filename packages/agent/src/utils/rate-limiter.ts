export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private limits: Map<string, { count: number; window: number }> = new Map()

  constructor() {
    // Default rate limits
    this.setLimit('default', 60, 60000) // 60 requests per minute
    this.setLimit('ai', 10, 60000) // 10 AI requests per minute
    this.setLimit('file', 100, 60000) // 100 file operations per minute
  }

  setLimit(key: string, count: number, windowMs: number): void {
    this.limits.set(key, { count, window: windowMs })
  }

  async checkLimit(key: string = 'default'): Promise<boolean> {
    const limit = this.limits.get(key)
    if (!limit) return true

    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < limit.window)
    
    if (validRequests.length >= limit.count) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }

  async waitForLimit(key: string = 'default'): Promise<void> {
    while (!(await this.checkLimit(key))) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  getRemainingRequests(key: string = 'default'): number {
    const limit = this.limits.get(key)
    if (!limit) return Infinity

    const now = Date.now()
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(timestamp => now - timestamp < limit.window)
    
    return Math.max(0, limit.count - validRequests.length)
  }

  getResetTime(key: string = 'default'): number {
    const limit = this.limits.get(key)
    if (!limit) return 0

    const requests = this.requests.get(key) || []
    if (requests.length === 0) return 0

    const oldestRequest = Math.min(...requests)
    return oldestRequest + limit.window
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key)
    } else {
      this.requests.clear()
    }
  }
}
