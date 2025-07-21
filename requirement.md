📄 Requirements & Tech-Stack Document
Project: Vibe Coding Editor “Cursor-like” with Free Claude & GPT AI
Version: 1.0 – 18 Jul 2025
1. Product Vision
A single-window desktop + web IDE that lets developers “vibe code” by chatting in natural language.
Two run-modes:
Table
Copy
Mode	What it does	Human-in-the-loop?	LLM(s)
Agent	Plan → write → test → commit end-to-end features	Approves each step	Free Claude (web), GPT-4o (OpenRouter)
Autopilot	Continuous inline completions, refactor on save	Always on	Same models, streamed
2. Functional Requirements (MVP)
Chat-first UI – sidebar chat panel + inline diff overlays.
Context Engine – index entire git repo; 200 k-token window for Claude.
Agent Loop
3.1 Parse prompt → task plan → code → run tests → commit → push.
3.2 Allow human review at each stage.
Autopilot
4.1 Real-time completions (ghost text).
4.2 On-save “mini-agent” to lint, format, add tests.
Multi-model support
Free tier: Claude.ai web interface + GPT via OpenRouter free keys.
Paid tier: Bring-your-own-key (OpenAI, Anthropic, Azure).
Extensions & Themes – VS Code compatible marketplace.
One-click Deploy – Vercel / Netlify / Supabase.
3. Non-Functional Requirements
Table
Copy
Attribute	Target
Startup	< 2 s cold start
Memory	Agent mode ≤ 1 GB RAM
Latency	First token < 800 ms
Offline	Autopilot works w/o internet; Agent needs cloud
Security	Runs untrusted code in sandboxed Docker (WASM fallback)
4. Recommended Tech-Stack
Table
Copy
Layer	Choice	Rationale
Shell (Desktop)	Tauri (Rust)	Tiny 10 MB binary, uses OS webview, secure 
Shell (Web)	Next.js 15 (App Router)	SSR for instant load, deploy to Vercel 
Editor Core	Monaco + VS Code Extension Host	Free, proven, supports LSP & themes
Agent Runtime	Node.js 20 worker thread	Easy LLM SDKs (Anthropic, OpenAI)
Context Index	Tree-sitter + vector DB (Chroma, in-memory)	Fast AST + semantic search 
Sandbox	Docker / WASM via Wasmer	Secure test execution
Realtime Sync	Yjs + WebRTC	Collaborative cursor, conflict-free
Auth & Sync	Supabase Auth + Realtime	Row-level security, free tier 
Deployment	Vercel (web), GitHub Releases (desktop)	One-click vibe pipeline 
5. Free LLM Integration Plan
Table
Copy
Provider	Access Route	Quota
Claude 3.5 Sonnet	claude.ai web reverse proxy (puppeteer)	50 msgs/day 
GPT-4o	OpenRouter free tier	20 req/min
Fallback	Local Ollama (CodeLlama 13B)	Offline mode
Architecture tip:
Create a “LLM Router” micro-service that load-balances requests across free endpoints.
Cache prompts with 5-minute TTL to reduce quota burn.
6. Implementation Roadmap (12 Weeks)
Phase 0 – Bootstrap (Week 0)
Repo setup: Turborepo monorepo (apps/desktop, apps/web, packages/agent).
Configure Tauri + Next.js dev shell.
Phase 1 – Editor Skeleton (Weeks 1-2)
Monaco + file tree + terminal panel.
Theme & extension loader (copied from VS Code).
Phase 2 – Context Engine (Weeks 3-4)
Tree-sitter parsers for TS, JS, Python, Rust.
Build vector index on file change events.
Milestone: Open a 10 k-file repo in < 5 s.
Phase 3 – Autopilot (Weeks 5-6)
Ghost-text completions via OpenRouter GPT-4o.
On-save refactor agent: prettier, eslint, vitest template.
Telemetry: latency, token usage.
Phase 4 – Agent Mode (Weeks 7-9)
Prompt → plan → code → test loop.
Implement “Approve / Reject” UI in chat sidebar.
Git push integration (simple-git).
Phase 5 – Sandboxing & Deploy (Weeks 10-11)
Docker provider for test runs.
“Deploy to Vercel” button via Vercel API.
Phase 6 – Polish & Release (Week 12)
Auto-updater (Tauri updater).
Publish VSIX marketplace stub.
7. Security & Compliance Checklist
[ ] Run user code in Docker --read-only --cap-drop ALL.
[ ] Strip secrets from prompts before logging.
[ ] Rate-limit free keys per IP.
[ ] OSS license scan on every build.
8. Future Extensions (Post-MVP)
Multi-agent collaboration (Claude + GPT voting).
Fine-tuned local model (LoRA) for proprietary codebases.
Voice-to-code using Whisper + LLM.