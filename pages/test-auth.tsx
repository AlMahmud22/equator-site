import { useSession } from 'next-auth/react'
import Layout from '@/components/Layout'
import { AuthStatus } from '@/components/auth/AuthStatus'
import { useAuth } from '@/components/auth/AuthHook'

export default function AuthTestPage() {
  const { data: session, status } = useSession()
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <Layout title="Authentication Test - Equators">
      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 pt-20">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Authentication System Test</h1>
            
            {/* NextAuth Session Info */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">NextAuth Session</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-secondary-400">Status:</span> <span className="text-white">{status}</span></p>
                <p><span className="text-secondary-400">User:</span> <span className="text-white">{session?.user?.name || 'None'}</span></p>
                <p><span className="text-secondary-400">Email:</span> <span className="text-white">{session?.user?.email || 'None'}</span></p>
                <p><span className="text-secondary-400">Image:</span> <span className="text-white">{session?.user?.image ? 'Available' : 'None'}</span></p>
              </div>
            </div>

            {/* Custom Auth Hook Info */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Custom Auth Hook</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-secondary-400">Is Loading:</span> <span className="text-white">{isLoading ? 'Yes' : 'No'}</span></p>
                <p><span className="text-secondary-400">Is Authenticated:</span> <span className="text-white">{isAuthenticated ? 'Yes' : 'No'}</span></p>
                <p><span className="text-secondary-400">User Name:</span> <span className="text-white">{user?.name || 'None'}</span></p>
                <p><span className="text-secondary-400">User Email:</span> <span className="text-white">{user?.email || 'None'}</span></p>
              </div>
            </div>

            {/* AuthStatus Component Test */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">AuthStatus Component Test</h2>
              <AuthStatus
                fallback={
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400">Not authenticated - please sign in</p>
                  </div>
                }
              >
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400">✅ Authentication successful!</p>
                  <p className="text-white mt-2">Welcome, {user?.name}!</p>
                </div>
              </AuthStatus>
            </div>

            {/* Raw Session Data (for debugging) */}
            <div className="card mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Raw Session Data</h2>
              <pre className="bg-secondary-800 rounded-lg p-4 text-xs text-secondary-300 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
