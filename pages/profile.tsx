import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Show loading state
  if (status === 'loading') {
    return (
      <Layout title="Profile - Equators">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    )
  }

  // Show login redirect
  if (!session?.user) {
    return (
      <Layout title="Profile - Equators">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-secondary-300">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      title="Profile - Equators"
      description="Your Equators profile and download history"
    >
      <Head>
        <meta property="og:title" content="Profile - Equators" />
        <meta property="og:description" content="Your Equators profile and download history" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50 pt-20">
        <div className="container-custom py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'}
                    className="w-16 h-16 rounded-full border-2 border-green-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold text-xl">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">{session.user?.name}</h1>
                  <p className="text-secondary-300">{session.user?.email}</p>
                  <p className="text-sm text-secondary-400 capitalize">
                    Signed in with {(session.user as any)?.authType || 'OAuth'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Welcome!</h2>
                  <p className="text-secondary-300">
                    You&apos;re signed in and can now download projects and access tools. 
                    This simple profile tracks your basic info and download history.
                  </p>
                </div>

                <div className="bg-secondary-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">What you can do:</h3>
                  <ul className="space-y-2 text-secondary-300">
                    <li>• Download desktop applications</li>
                    <li>• Access OAuth integration for desktop apps</li>
                    <li>• View your download history</li>
                    <li>• Connect with my projects</li>
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-400 mb-2">Privacy First</h3>
                  <p className="text-green-300 text-sm">
                    Only basic profile info is stored. No tracking, no spam, no complex user management. 
                    Just simple authentication for downloads and tool access.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

// Disable static optimization for this page
ProfilePage.getInitialProps = () => {
  return {}
}
