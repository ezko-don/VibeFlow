import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { DebugLoader } from '@/components/debug/debug-loader'

export const metadata: Metadata = {
  title: 'VibeFlow - AI-Powered Code Editor',
  description: 'A Cursor-like coding editor with free Claude & GPT AI integration for natural language programming.',
  keywords: ['code editor', 'AI coding', 'Claude', 'GPT', 'IDE', 'programming'],
  authors: [{ name: 'VibeFlow Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-sans antialiased">
        {/* Puter.js for free Claude API access */}
        <Script 
          src="https://js.puter.com/v2/" 
          strategy="beforeInteractive"
        />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <DebugLoader />
          <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 