# VibeFlow 🚀

A Cursor-like AI-powered code editor with **FREE unlimited Claude & GPT integration** using Puter.js.

![VibeFlow Logo](https://img.shields.io/badge/VibeFlow-AI%20Editor-22c55e?style=for-the-badge&logo=visualstudiocode)

## ✨ Features

- 🎨 **Monaco Editor Integration** - VS Code-quality editing with syntax highlighting and IntelliSense
- 🤖 **FREE AI Integration** - Unlimited Claude 3.5 Sonnet & GPT-4o via Puter.js (no API keys needed!)
- 🌙 **Dark/Light Mode** - Beautiful themes that adapt to your preference
- 📁 **File Explorer** - Intuitive file tree with search and navigation
- 💬 **AI Chat Interface** - Real-time chat with Claude for coding assistance
- 🖥️ **Integrated Terminal** - Built-in terminal for running commands
- 🎭 **Framer Motion Animations** - Smooth, delightful animations throughout the UI
- 🎯 **Production Ready** - Built with TypeScript, Tailwind CSS, and modern best practices

## 🆓 Free AI Integration

**NO API KEYS REQUIRED!** VibeFlow uses [Puter.js](https://puter.com) for free, unlimited access to:

- **Claude 3.5 Sonnet** - Advanced reasoning and code generation
- **GPT-4o** - Multimodal AI capabilities  
- **"User Pays" Model** - You only pay for what you use (typically $0.01-$0.05 per conversation)

### How it Works

1. **Instant Access** - No sign-ups, API keys, or backend servers required
2. **Pay-per-Use** - Micro-payments charged directly to your payment method
3. **Unlimited Usage** - No rate limits or quotas
4. **Privacy First** - Your conversations aren't stored or logged

## 🏗️ Architecture

VibeFlow is built as a **Turborepo monorepo** with the following structure:

```
VibeFlow/
├── apps/
│   ├── web/           # Next.js 14 web application ✅
│   └── desktop/       # Tauri desktop application ✅
├── packages/
│   ├── agent/         # AI agent runtime ✅
│   ├── ui/            # Shared UI components ✅
│   └── shared/        # Common utilities and types ✅
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/VibeFlow.git
   cd VibeFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Try the AI Chat** 🎉
   - Click the chat icon in the top-right corner
   - Start chatting with Claude instantly (no setup required!)
   - Ask for help with coding, debugging, or explanations

### No Additional Setup Required!

Unlike other AI coding tools, VibeFlow works immediately:
- ❌ No API key registration
- ❌ No account creation  
- ❌ No complex configuration
- ✅ Just run and start coding with AI!

## 🎮 Usage

### AI-Powered Coding

1. **Open the Chat Panel** - Click the chat icon or press `Cmd/Ctrl + Shift + C`
2. **Select Your Model** - Choose between Claude 3.5 Sonnet or GPT-4o
3. **Start Chatting** - Ask questions like:
   - "Create a React component for a todo list"
   - "Debug this TypeScript error"
   - "Explain how this code works"
   - "Refactor this function to be more efficient"

### File Management

- **File Explorer** - Browse and select files from the left sidebar
- **Monaco Editor** - Edit code with full syntax highlighting and IntelliSense
- **Terminal** - Run commands directly in the integrated terminal

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open AI Chat | `Ctrl/Cmd + Shift + C` |
| Open Terminal | `Ctrl/Cmd + Shift + T` |
| Toggle Theme | `Ctrl/Cmd + Shift + L` |
| Quick File Search | `Ctrl/Cmd + P` |

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server for all apps |
| `npm run build` | Build all applications |
| `npm run web:dev` | Start only the web app |
| `npm run desktop:dev` | Start only the desktop app |
| `npm run lint` | Run ESLint across all packages |
| `npm run format` | Format code with Prettier |

### Technology Stack

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Monaco Editor** - VS Code editor component

#### AI Integration
- **Puter.js** - Free unlimited Claude & GPT access
- **LLM Router** - Smart provider management with fallbacks
- **Rate Limiting** - Built-in usage tracking and optimization

#### Development Tools
- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

### Design System

VibeFlow uses a custom design system with the following color palette:

```css
/* Primary Colors */
--primary-500: #22c55e;     /* Green */
--secondary-500: #f97316;   /* Orange */
--accent-500: #2563eb;      /* Blue */

/* Neutral Colors */
--neutral-900: #171717;     /* Dark */
--neutral-100: #f5f5f5;     /* Light */
```

## 🤖 AI Integration Details

### Puter.js Integration

```typescript
// Example: Send a message to Claude
const response = await aiService.sendMessage([
  {
    role: 'user',
    content: 'Create a React component for a todo list',
    timestamp: new Date()
  }
], 'claude-3.5-sonnet')

console.log(response.content) // AI-generated code
```

### Available Models

- **Claude 3.5 Sonnet** - Best for complex reasoning and code generation
- **GPT-4o** - Great for explanations and debugging
- **Automatic Fallback** - Seamlessly switches between models if one is unavailable

### Cost Structure (Puter.js)

- **Claude 3.5 Sonnet**: ~$0.003 per 1K tokens
- **GPT-4o**: ~$0.005 per 1K tokens
- **Typical Conversation**: $0.01 - $0.05
- **No Monthly Fees**: Pay only for what you use

## 📚 Project Structure

### Web App (`apps/web`)

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── editor/         # Editor-specific components
│   ├── welcome/        # Welcome screen components
│   └── providers/      # React context providers
├── lib/                # Utility functions (including AI service)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── store/              # State management
```

### Key Components

- **`AIService`** - Puter.js integration for free Claude API
- **`EditorLayout`** - Main editor interface with panels
- **`MonacoEditor`** - Code editor with syntax highlighting
- **`ChatPanel`** - Real-time AI chat interface
- **`Terminal`** - Integrated terminal component
- **`Sidebar`** - File explorer and navigation

## 🔧 Configuration

### AI Service Configuration

The AI service automatically detects Puter.js availability and provides:
- Real-time status monitoring
- Automatic error handling with user-friendly messages
- Token usage tracking
- Model selection and fallbacks

### Monaco Editor

The Monaco editor is configured with:
- Custom VibeFlow dark theme
- TypeScript/JavaScript language support
- IntelliSense and autocomplete
- Syntax highlighting for 10+ languages

### Tailwind CSS

Custom configuration includes:
- Extended color palette
- Custom animations
- Glass morphism utilities
- Responsive design breakpoints

## 🚧 Roadmap

### ✅ Phase 1 - MVP (COMPLETED)
- ✅ Monaco Editor integration
- ✅ Basic file explorer
- ✅ **FREE Claude API integration via Puter.js**
- ✅ Real-time AI chat interface
- ✅ Terminal integration
- ✅ Theme system
- ✅ Production-ready web app

### 🔄 Phase 2 - Enhanced AI Features (In Progress)
- 🔄 Context-aware code suggestions
- 🔄 Multi-file code analysis
- 🔄 Automatic code completion
- 🔄 Git integration with AI commit messages

### 📋 Phase 3 - Advanced Features
- 📋 Real-time collaboration
- 📋 Plugin system
- 📋 Advanced debugging with AI
- 📋 Code review automation

### 📋 Phase 4 - Desktop App
- 📋 Tauri desktop application
- 📋 File system access
- 📋 Native performance
- 📋 Auto-updater

## 🎯 Why VibeFlow?

### Compared to Other AI Coding Tools

| Feature | VibeFlow | Cursor | GitHub Copilot | Replit |
|---------|----------|--------|----------------|---------|
| **Free AI Access** | ✅ Unlimited | ❌ Limited | ❌ Paid only | ❌ Paid only |
| **No API Keys** | ✅ Zero setup | ❌ Required | ❌ Required | ❌ Account needed |
| **Claude 3.5 Sonnet** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Local Development** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Cloud only |
| **Open Source** | ✅ MIT License | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary |

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request guidelines
- Issue reporting

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test the AI integration: Open the chat and try a few questions
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Puter.js** - For providing free, unlimited access to Claude and GPT APIs
- **Monaco Editor** - For the excellent code editing experience
- **VS Code** - For inspiration and extension compatibility
- **Cursor** - For pioneering AI-powered coding
- **Vercel** - For Next.js and deployment platform
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- 📧 **Email**: support@vibeflow.dev
- 💬 **Discord**: [Join our community](https://discord.gg/vibeflow)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/VibeFlow/issues)
- 📖 **Docs**: [Documentation Site](https://docs.vibeflow.dev)

## 🚀 Try It Now!

```bash
git clone https://github.com/your-username/VibeFlow.git
cd VibeFlow
npm install
npm run dev
```

**Open http://localhost:3000 and start coding with AI for FREE!** 🎉

---

**Built with ❤️ by the VibeFlow team**

*No API keys. No limits. Just pure AI-powered coding bliss.* ✨ 