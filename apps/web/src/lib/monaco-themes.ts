// VS Code-like themes for Monaco Editor

export const themes = {
  'github-dark': {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'ffa657' },
      { token: 'type', foreground: '7ee787' },
      { token: 'class', foreground: 'ffa657' },
      { token: 'interface', foreground: '7ee787' },
      { token: 'namespace', foreground: 'ffa657' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e6edf3',
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#264f7855',
      'editorCursor.foreground': '#79c0ff',
      'editorWhitespace.foreground': '#484f58',
      'editorLineNumber.foreground': '#7d8590',
      'editorLineNumber.activeForeground': '#e6edf3',
      'editorIndentGuide.background': '#21262d',
      'editorIndentGuide.activeBackground': '#79c0ff',
    }
  },

  'github-light': {
    base: 'vs' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cf222e', fontStyle: 'bold' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: '0550ae' },
      { token: 'function', foreground: '8250df' },
      { token: 'variable', foreground: 'e36209' },
      { token: 'type', foreground: '116329' },
      { token: 'class', foreground: 'e36209' },
      { token: 'interface', foreground: '116329' },
      { token: 'namespace', foreground: 'e36209' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#0969da33',
      'editor.inactiveSelectionBackground': '#0969da22',
      'editorCursor.foreground': '#0969da',
      'editorWhitespace.foreground': '#afb8c1',
      'editorLineNumber.foreground': '#656d76',
      'editorLineNumber.activeForeground': '#24292f',
      'editorIndentGuide.background': '#d0d7de',
      'editorIndentGuide.activeBackground': '#0969da',
    }
  },

  'monokai': {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'class', foreground: 'a6e22e' },
      { token: 'interface', foreground: '66d9ef' },
      { token: 'namespace', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editor.selectionBackground': '#49483e',
      'editor.inactiveSelectionBackground': '#49483e88',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#464741',
      'editorLineNumber.foreground': '#90908a',
      'editorLineNumber.activeForeground': '#c2c2bf',
      'editorIndentGuide.background': '#464741',
      'editorIndentGuide.activeBackground': '#767771',
    }
  },

  'dracula': {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'class', foreground: '50fa7b' },
      { token: 'interface', foreground: '8be9fd' },
      { token: 'namespace', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editor.selectionBackground': '#44475a',
      'editor.inactiveSelectionBackground': '#44475a88',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#6272a4',
      'editorLineNumber.foreground': '#6272a4',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editorIndentGuide.background': '#6272a4',
      'editorIndentGuide.activeBackground': '#bd93f9',
    }
  }
}

export function setupMonacoThemes(monaco: any) {
  Object.entries(themes).forEach(([name, theme]) => {
    monaco.editor.defineTheme(name, theme)
  })
}