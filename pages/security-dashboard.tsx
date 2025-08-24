import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import SecurityDashboard from '@/components/security/SecurityDashboard'

export default function SecurityPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication and admin access
  useEffect(() => {
    if (sessionStatus !== 'loading') {
      setIsLoading(false)
      
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      
      // Check if user is admin (you can customize this logic)
      const isAdmin = (session.user as any).email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                      (session.user as any).email?.endsWith('@equators.tech') // Example admin check
      
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [session, sessionStatus, router])

  if (isLoading) {
    return (
      <Layout title="Security Dashboard - Equators">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-secondary-300">Loading security dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!session?.user) {
    return (
      <Layout title="Security Dashboard - Equators">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-secondary-300">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Security Dashboard - Equators">
      <Head>
        <title>Security Dashboard - Equators</title>
        <meta name="description" content="Security monitoring and analytics dashboard for Equators" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen pt-20 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <SecurityDashboard />
      </div>
    </Layout>
  )
}
