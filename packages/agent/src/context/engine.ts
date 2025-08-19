import { CodeContext, ContextChunk } from '@vibeflow/shared'

export class ContextEngine {
  private chunks: Map<string, ContextChunk[]> = new Map()

  async analyzeCode(filePath: string, content: string): Promise<CodeContext> {
    const chunks = this.parseCodeIntoChunks(content)
    this.chunks.set(filePath, chunks)

    return {
      filePath,
      content,
      chunks,
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      functions: this.extractFunctions(content),
      classes: this.extractClasses(content),
      variables: this.extractVariables(content)
    }
  }

  private parseCodeIntoChunks(content: string): ContextChunk[] {
    const lines = content.split('\n')
    const chunks: ContextChunk[] = []
    
    for (let i = 0; i < lines.length; i += 10) {
      const chunkLines = lines.slice(i, i + 10)
      chunks.push({
        id: `chunk-${i}`,
        content: chunkLines.join('\n'),
        startLine: i + 1,
        endLine: Math.min(i + 10, lines.length),
        type: 'code'
      })
    }
    
    return chunks
  }

  private extractImports(content: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
    const imports: string[] = []
    let match
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }
    
    return imports
  }

  private extractExports(content: string): string[] {
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g
    const exports: string[] = []
    let match
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1])
    }
    
    return exports
  }

  private extractFunctions(content: string): string[] {
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\()/g
    const functions: string[] = []
    let match
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2])
    }
    
    return functions
  }

  private extractClasses(content: string): string[] {
    const classRegex = /class\s+(\w+)/g
    const classes: string[] = []
    let match
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1])
    }
    
    return classes
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /(?:const|let|var)\s+(\w+)/g
    const variables: string[] = []
    let match
    
    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1])
    }
    
    return variables
  }

  getContext(filePath: string): ContextChunk[] | undefined {
    return this.chunks.get(filePath)
  }

  getAllContexts(): Map<string, ContextChunk[]> {
    return this.chunks
  }
}
