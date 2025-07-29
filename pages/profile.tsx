import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { useAuth } from '@/hooks/useAuth'
import ProfileCard from '@/components/ProfileCard'
import HuggingFaceLink from '@/components/HuggingFaceLink'
import GlobeBackground from '@/components/GlobeBackground'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Check for first login modal
  useEffect(() => {
    if (user && router.query.firstLogin === 'true') {
      setShowFirstLoginModal(true)
      // Clean up URL
      router.replace('/profile', undefined, { shallow: true })
    }
  }, [user, router])

  // Show loading state
  if (loading) {
    return (
      <Layout title="Profile - Equators">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  // Show login redirect
  if (!user) {
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
    <>
      <Head>
        <title>Profile - Equators</title>
        <meta name="description" content="Manage your Equators profile and connected services" />
      </Head>
      
      <Layout showNavbar={true} showFooter={false}>
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <GlobeBackground />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen pt-20">
          <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome back, {user.fullName.split(' ')[0]}
              </h1>
              <p className="text-lg text-secondary-300">
                Manage your profile and connected services
              </p>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Left Panel - Hugging Face Connection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <HuggingFaceLink user={user} showFirstLoginModal={showFirstLoginModal} />
              </motion.div>

              {/* Right Panel - Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ProfileCard user={user} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* First Login Modal */}
        {showFirstLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary-900/95 backdrop-blur-md rounded-2xl border border-secondary-700/50 p-8 max-w-md mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Welcome to Equators!
                </h3>
                <p className="text-secondary-300 mb-6">
                  Your account has been created successfully. Would you like to connect your Hugging Face account to unlock additional features?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowFirstLoginModal(false)}
                    className="flex-1 px-4 py-2 text-secondary-300 hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={() => {
                      setShowFirstLoginModal(false)
                      // Scroll to HF section
                      document.getElementById('hf-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex-1 btn-primary"
                  >
                    Connect Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Layout>
    </>
  )
}
