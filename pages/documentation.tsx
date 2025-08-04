import Head from 'next/head'
import { motion } from 'framer-motion'
import { Book, Code, Download, ExternalLink, Search } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const docSections = [
  {
    icon: <Download className="w-8 h-8" />,
    title: 'Getting Started',
    description: 'Installation guides and quick start tutorials for all platforms.',
    articles: [
      'System Requirements',
      'Installation on Windows',
      'Installation on macOS',
      'Installation on Linux',
      'First Time Setup',
    ],
  },
  {
    icon: <Book className="w-8 h-8" />,
    title: 'User Guides',
    description: 'Comprehensive guides for using all features and capabilities.',
    articles: [
      'Chatbot Configuration',
      'AI Model Training',
      'Browser Privacy Settings',
      'Keyboard Shortcuts',
      'Advanced Features',
    ],
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: 'Developer Resources',
    description: 'Technical documentation for developers and power users.',
    articles: [
      'API Reference',
      'SDK Documentation',
      'Plugin Development',
      'Custom Integrations',
      'Troubleshooting',
    ],
  },
]

const quickLinks = [
  {
    title: 'API Reference',
    description: 'Complete API documentation with examples',
    href: '/api-reference',
  },
  {
    title: 'Changelog',
    description: 'See what\'s new in the latest versions',
    href: '/changelog',
  },
  {
    title: 'SDK Downloads',
    description: 'Download SDKs for various programming languages',
    href: '/sdk',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other developers and users',
    href: '/community',
  },
]

export default function DocumentationPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Documentation - Equators Developer Resources"
      description="Comprehensive documentation for Equators applications. API references, user guides, and developer resources."
    >
      <Head>
        <meta property="og:title" content="Documentation - Equators Developer Resources" />
        <meta property="og:description" content="Comprehensive documentation for Equators applications. API references, user guides, and developer resources." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 section-padding bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container-custom">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="text-gradient">Documentation</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Everything you need to know about using and developing with Equators applications. 
              Find guides, tutorials, API references, and more.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-12 pr-4 py-4 bg-secondary-800/50 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 backdrop-blur-sm transition-colors duration-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Browse <span className="text-gradient">Documentation</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Organized by topic to help you find exactly what you need.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {docSections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card h-full"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-primary-400">{section.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{section.title}</h3>
                <p className="text-secondary-300 mb-6">{section.description}</p>
                
                <div className="space-y-3">
                  {section.articles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className="flex items-center justify-between p-3 bg-secondary-800/50 rounded-lg hover:bg-secondary-800 transition-colors duration-200 cursor-pointer group"
                    >
                      <span className="text-secondary-200 group-hover:text-white transition-colors duration-200">
                        {article}
                      </span>
                      <ExternalLink className="w-4 h-4 text-secondary-400 group-hover:text-primary-400 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Quick <span className="text-gradient">Links</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Fast access to commonly used resources and tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover group cursor-pointer text-center"
              >
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                  {link.title}
                </h3>
                <p className="text-secondary-300 text-sm mb-4">{link.description}</p>
                <div className="flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-primary-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Get Started <span className="text-gradient">Quickly</span>
              </h2>
              <p className="text-lg text-secondary-300">
                Here&apos;s a simple example to get you started with the Equators API.
              </p>
            </div>

            <div className="bg-secondary-950 rounded-lg border border-secondary-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 bg-secondary-800 border-b border-secondary-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-secondary-400 text-sm">example.js</span>
              </div>
              <div className="p-6">
                <pre className="text-secondary-200 font-mono text-sm leading-relaxed">
                  <code>{`// Initialize Equators SDK
import { EquatorsAPI } from '@equators/sdk';

const api = new EquatorsAPI({
  apiKey: 'your-api-key-here',
  version: 'v1'
});

// Example: Send a message to the chatbot
async function sendMessage(message) {
  try {
    const response = await api.chatbot.send({
      message: message,
      context: 'user-session-id'
    });
    
    console.log('Response:', response.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage
sendMessage('Hello, how can you help me today?');`}</code>
                </pre>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="btn-primary mr-4">
                <Download className="w-4 h-4 mr-2" />
                Download SDK
              </button>
              <button className="btn-ghost">
                View Full API Reference
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
