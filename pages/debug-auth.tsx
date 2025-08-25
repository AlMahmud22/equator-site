import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useAuth } from '@/components/auth/AuthHook'

export default function AuthDebugPage() {
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Layout title="Auth Debug"><div>Loading...</div></Layout>
  }

  return (
    <Layout title="Authentication Debug - Equators">
      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 pt-20">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">🔍 Authentication Debug Panel</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* NextAuth Session */}
              <div className="bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">NextAuth Session</h2>
                <div className="space-y-3 text-sm font-mono">
                  <div>
                    <span className="text-secondary-400">Status:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'authenticated' ? 'bg-green-500/20 text-green-400' :
                      status === 'loading' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  {session?.user && (
                    <>
                      <div>
                        <span className="text-secondary-400">Name:</span>{' '}
                        <span className="text-white">{session.user.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-400">Email:</span>{' '}
                        <span className="text-white">{session.user.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-400">Image:</span>{' '}
                        <span className="text-white">
                          {session.user.image ? (
                            <>
                              ✅ Available
                              <img 
                                src={session.user.image} 
                                alt="User avatar" 
                                className="w-8 h-8 rounded-full ml-2 inline-block"
                              />
                            </>
                          ) : '❌ None'}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {!session && status !== 'loading' && (
                    <div className="text-secondary-400">No active session</div>
                  )}
                </div>
              </div>

              {/* Custom Auth Hook */}
              <div className="bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Custom Auth Hook</h2>
                <div className="space-y-3 text-sm font-mono">
                  <div>
                    <span className="text-secondary-400">Loading:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${
                      isLoading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {isLoading ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-secondary-400">Authenticated:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${
                      isAuthenticated ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isAuthenticated ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  {user && (
                    <>
                      <div>
                        <span className="text-secondary-400">User Name:</span>{' '}
                        <span className="text-white">{user.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-400">User Email:</span>{' '}
                        <span className="text-white">{user.email || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication Actions */}
            <div className="mt-8 bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Authentication Actions</h2>
              
              <div className="flex flex-wrap gap-4">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => signIn('github')}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      🔒 Sign In with GitHub
                    </button>
                    <button
                      onClick={() => signIn('google')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      🔒 Sign In with Google
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => signOut()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      🚪 Sign Out
                    </button>
                    <Link
                      href="/profile"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 inline-block"
                    >
                      👤 View Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-block"
                    >
                      ⚙️ Settings
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Raw Session Data */}
            <div className="mt-8 bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Raw Session Data</h2>
              <pre className="bg-secondary-800 rounded-lg p-4 text-xs text-green-400 overflow-auto">
                {JSON.stringify({ session, user, status, isAuthenticated, isLoading }, null, 2)}
              </pre>
            </div>

            {/* Browser Local Storage Check */}
            <div className="mt-8 bg-secondary-900/50 backdrop-blur-sm border border-secondary-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Browser Storage Check</h2>
              <div className="text-sm font-mono">
                <div>
                  <span className="text-secondary-400">NextAuth Session Token:</span>{' '}
                  <span className="text-white">
                    {typeof window !== 'undefined' && document.cookie.includes('next-auth.session-token') 
                      ? '✅ Present' 
                      : '❌ Missing'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
