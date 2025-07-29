import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { useAuth } from '@/hooks/useAuth'

export default function TestChatbotAuthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testChatbotRedirect = () => {
    const redirectUrl = 'equatorschatbot://auth/callback'
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    
    // Store for verification
    sessionStorage.setItem('testRedirect', redirectUrl)
    
    // Redirect to login
    router.push(loginUrl)
  }

  const testProfileWithToken = async () => {
    if (!user) {
      setTestResult('❌ Not authenticated')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/profile-with-token', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'no-token'}`
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult(`✅ Profile fetched: ${JSON.stringify(data.data.user, null, 2)}`)
      } else {
        setTestResult(`❌ Error: ${data.message}`)
      }
    } catch (err) {
      setTestResult(`❌ Network error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const simulateDesktopCallback = () => {
    // Simulate what the desktop app would receive
    const token = 'test-jwt-token-here'
    const callbackUrl = `equatorschatbot://auth/callback?token=${token}`
    
    setTestResult(`🖥️ Desktop app would receive: ${callbackUrl}`)
    
    // Try to actually open it (will fail in browser but shows the URL)
    try {
      window.location.href = callbackUrl
    } catch (error) {
      console.log('Expected error - browser cannot handle custom URI scheme')
    }
  }

  return (
    <Layout title="Test Chatbot Auth - Equators">
      <div className="min-h-screen bg-secondary-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-secondary-900 rounded-xl border border-secondary-800 p-8">
            <h1 className="text-3xl font-bold text-white mb-8">
              🤖 Chatbot Authentication Test
            </h1>

            {/* Current User Status */}
            <div className="bg-secondary-800/50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
              {user ? (
                <div className="text-green-400">
                  ✅ Authenticated as: {user.fullName} ({user.email})
                  <br />
                  Auth Type: {user.authType}
                  <br />
                  HF Linked: {user.huggingFace?.linked ? '✅ Yes' : '❌ No'}
                </div>
              ) : (
                <div className="text-red-400">❌ Not authenticated</div>
              )}
            </div>

            {/* Test Actions */}
            <div className="space-y-6">
              {/* Test 1: Chatbot Redirect Flow */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Test 1: Chatbot Redirect Flow
                </h3>
                <p className="text-secondary-300 mb-4">
                  This simulates what happens when the desktop app sends users to login with a custom redirect.
                </p>
                <button
                  onClick={testChatbotRedirect}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Test Login with Chatbot Redirect
                </button>
              </div>

              {/* Test 2: Profile with Token API */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Test 2: Profile with Token API
                </h3>
                <p className="text-secondary-300 mb-4">
                  Test the new API endpoint that returns profile including Hugging Face token.
                </p>
                <button
                  onClick={testProfileWithToken}
                  disabled={loading || !user}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Testing...' : 'Test Profile API'}
                </button>
              </div>

              {/* Test 3: Simulate Desktop Callback */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Test 3: Simulate Desktop Callback
                </h3>
                <p className="text-secondary-300 mb-4">
                  Simulate what the desktop app would receive after successful authentication.
                </p>
                <button
                  onClick={simulateDesktopCallback}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Simulate Desktop Callback
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="mt-8 bg-secondary-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Test Result</h3>
                <pre className="bg-black/30 rounded p-4 text-green-400 text-sm overflow-auto">
                  {testResult}
                </pre>
              </div>
            )}

            {/* Documentation Link */}
            <div className="mt-8 text-center">
              <a
                href="/CHATBOT_AUTH_INTEGRATION.md"
                target="_blank"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                📚 View Implementation Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
