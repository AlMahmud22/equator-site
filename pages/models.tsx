import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
// import ModelsPage from '@/modules/models/ModelsPage'

export default function Models() {
  return (
    <>
      <Head>
        <title>AI Models Hub - Under Maintenance - Equators</title>
        <meta 
          name="description" 
          content="AI Models Hub is currently under maintenance. We're working to bring you an improved experience. Please check back soon." 
        />
      </Head>
      <Layout>
        {/* <ModelsPage /> */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="mb-8">
              <div className="text-6xl mb-4">🔧</div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Under <span className="text-gradient">Maintenance</span>
              </h1>
              <p className="text-xl text-secondary-300 mb-8">
                We&apos;re working hard to improve the AI Models Hub experience. 
                The models section will be back soon with enhanced features and better performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/" 
                  className="btn-primary px-8 py-3"
                >
                  Back to Home
                </Link>
                <Link 
                  href="/products" 
                  className="btn-secondary px-8 py-3"
                >
                  Explore Projects
                </Link>
              </div>
            </div>
            
            <div className="text-sm text-secondary-400 bg-secondary-900/50 rounded-lg p-4 border border-secondary-800">
              <p className="mb-2">
                <strong>Expected completion:</strong> Q1 2025
              </p>
              <p>
                Thank you for your patience as we build something amazing!
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
