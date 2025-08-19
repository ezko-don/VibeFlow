import { ContextChunk } from '@vibeflow/shared'

export class ContextParser {
  parseFileContent(content: string, filePath: string): ContextChunk[] {
    const extension = this.getFileExtension(filePath)
    
    switch (extension) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return this.parseJavaScriptLike(content)
      case 'py':
        return this.parsePython(content)
      case 'java':
        return this.parseJava(content)
      case 'cpp':
      case 'c':
        return this.parseC(content)
      default:
        return this.parseGeneric(content)
    }
  }

  private getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || ''
  }

  private parseJavaScriptLike(content: string): ContextChunk[] {
    const chunks: ContextChunk[] = []
    const lines = content.split('\n')
    
    let currentChunk: string[] = []
    let chunkType: 'import' | 'function' | 'class' | 'code' = 'code'
    let chunkStart = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.startsWith('import') || line.startsWith('export')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'import'
        chunkStart = i
      } else if (line.startsWith('function') || line.includes('function') || line.includes('=>')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'function'
        chunkStart = i
      } else if (line.startsWith('class')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'class'
        chunkStart = i
      }
      
      currentChunk.push(lines[i])
    }
    
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(currentChunk, chunkStart, lines.length - 1, chunkType))
    }
    
    return chunks
  }

  private parsePython(content: string): ContextChunk[] {
    const chunks: ContextChunk[] = []
    const lines = content.split('\n')
    
    let currentChunk: string[] = []
    let chunkType: 'import' | 'function' | 'class' | 'code' = 'code'
    let chunkStart = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.startsWith('import') || line.startsWith('from')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'import'
        chunkStart = i
      } else if (line.startsWith('def ')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'function'
        chunkStart = i
      } else if (line.startsWith('class ')) {
        if (currentChunk.length > 0) {
          chunks.push(this.createChunk(currentChunk, chunkStart, i - 1, chunkType))
          currentChunk = []
        }
        chunkType = 'class'
        chunkStart = i
      }
      
      currentChunk.push(lines[i])
    }
    
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(currentChunk, chunkStart, lines.length - 1, chunkType))
    }
    
    return chunks
  }

  private parseJava(content: string): ContextChunk[] {
    return this.parseGeneric(content) // Simplified for now
  }

  private parseC(content: string): ContextChunk[] {
    return this.parseGeneric(content) // Simplified for now
  }

  private parseGeneric(content: string): ContextChunk[] {
    const lines = content.split('\n')
    const chunks: ContextChunk[] = []
    const chunkSize = 20
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize)
      chunks.push(this.createChunk(chunkLines, i, Math.min(i + chunkSize - 1, lines.length - 1), 'code'))
    }
    
    return chunks
  }

  private createChunk(lines: string[], startLine: number, endLine: number, type: string): ContextChunk {
    return {
      id: `chunk-${startLine}-${endLine}`,
      content: lines.join('\n'),
      startLine: startLine + 1,
      endLine: endLine + 1,
      type
    }
  }
}
