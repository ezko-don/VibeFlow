/**
 * Debug utility for testing Puter.js AI integration
 * This helps troubleshoot AI response format issues
 */

declare global {
  interface Window {
    debugAI: {
      testPuterDirectly: () => Promise<void>
      testSimpleChat: () => Promise<void>
      checkPuterStatus: () => void
    }
  }
}

export function setupDebugAI() {
  if (typeof window === 'undefined') return

  window.debugAI = {
    async testPuterDirectly() {
      console.log('🧪 Testing Puter.js directly...')
      
      try {
        if (!window.puter?.ai?.chat) {
          console.error('❌ Puter.js not available')
          return
        }

        console.log('📤 Sending test request...')
        const response = await window.puter.ai.chat('Hello, please respond with "API working!"')
        
        console.log('📥 Raw response:', response)
        console.log('📥 Response type:', typeof response)
        
        if (typeof response === 'object') {
          console.log('📥 Response keys:', Object.keys(response || {}))
          console.log('📥 Response JSON:', JSON.stringify(response, null, 2))
        }
        
      } catch (error) {
        console.error('❌ Direct test failed:', error)
      }
    },

    async testSimpleChat() {
      console.log('🧪 Testing simple chat...')
      
      try {
        const response = await window.puter.ai.chat('Say "test successful"', {
          model: 'claude-sonnet-4'
        })
        
        console.log('✅ Simple chat response:', response)
        console.log('✅ Extracted text:', response?.message?.content?.[0]?.text)
        
      } catch (error) {
        console.error('❌ Simple chat failed:', error)
      }
    },

    checkPuterStatus() {
      console.log('🔍 Puter.js Status Check:')
      console.log('- window.puter exists:', !!window.puter)
      console.log('- window.puter.ai exists:', !!window.puter?.ai)
      console.log('- window.puter.ai.chat exists:', !!window.puter?.ai?.chat)
      console.log('- typeof window.puter.ai.chat:', typeof window.puter?.ai?.chat)
      
      if (window.puter?.ai) {
        console.log('- Available methods:', Object.keys(window.puter.ai))
      }
    }
  }

  console.log('🛠️ Debug utilities available:')
  console.log('- window.debugAI.checkPuterStatus()')
  console.log('- window.debugAI.testPuterDirectly()')
  console.log('- window.debugAI.testSimpleChat()')
} 