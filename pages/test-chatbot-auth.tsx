import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'

export default function TestChatbotAuthPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('google')
  
  const handleLoginWithProtocol = () => {
    const redirectUri = 'equatorschatbot://auth/callback'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://equators.tech'
    const loginUrl = `${baseUrl}/api/auth/oauth?provider=${selectedProvider}&redirect=${encodeURIComponent(redirectUri)}`
    
    window.location.href = loginUrl
  }

  return (
    <Layout
      title="Chatbot OAuth Test"
      description="Test OAuth deep linking integration with Equators Chatbot"
    >
      <Head>
        <meta property="og:title" content="Chatbot OAuth Test" />
        <meta property="og:description" content="Test OAuth deep linking integration with Equators Chatbot" />
      </Head>

      <div className="min-h-[calc(100vh-4rem)] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Chatbot OAuth Deep Linking Test
            </h1>
            <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
              Use the buttons below to test the OAuth deep linking integration between 
              the web app and Electron desktop app.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg mx-auto bg-secondary-900 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                OAuth Deep Link Test
              </h2>
              
              <div className="mb-6">
                <label className="block text-secondary-300 mb-2">Select Provider:</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600"
                      name="provider"
                      value="google"
                      checked={selectedProvider === 'google'}
                      onChange={() => setSelectedProvider('google')}
                    />
                    <span className="ml-2 text-secondary-300">Google</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600"
                      name="provider"
                      value="github"
                      checked={selectedProvider === 'github'}
                      onChange={() => setSelectedProvider('github')}
                    />
                    <span className="ml-2 text-secondary-300">GitHub</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="p-3 bg-secondary-800 rounded-md">
                  <p className="text-sm text-secondary-300">
                    <span className="text-primary-400 font-semibold">Protocol:</span> equatorschatbot://auth/callback
                  </p>
                  <p className="text-sm text-secondary-300">
                    <span className="text-primary-400 font-semibold">Provider:</span> {selectedProvider}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLoginWithProtocol}
                className="w-full py-3 btn-primary flex items-center justify-center"
              >
                Test OAuth Deep Link
              </button>
              
              <p className="mt-4 text-sm text-secondary-400">
                This will redirect to the OAuth provider and then back to the Electron app
                via the custom protocol handler. Make sure the Electron app is running.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-secondary-400 text-sm">
              The test page demonstrates the protocol handler integration between the web app and Electron app.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
