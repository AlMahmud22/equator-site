import Head from 'next/head'
import { motion } from 'framer-motion'
import { Search, Book, MessageCircle, Download, Settings, Shield } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const helpCategories = [
  {
    icon: <Download className="w-8 h-8" />,
    title: 'Installation & Setup',
    description: 'Get started with downloading and installing Equators applications.',
    articles: 12,
  },
  {
    icon: <Settings className="w-8 h-8" />,
    title: 'Configuration',
    description: 'Learn how to configure and customize your applications.',
    articles: 8,
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Privacy & Security',
    description: 'Understand our privacy features and security measures.',
    articles: 6,
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Troubleshooting',
    description: 'Solutions to common issues and error messages.',
    articles: 15,
  },
  {
    icon: <Book className="w-8 h-8" />,
    title: 'User Guides',
    description: 'Comprehensive guides for using all features.',
    articles: 20,
  },
  {
    icon: <Settings className="w-8 h-8" />,
    title: 'API & Integration',
    description: 'Technical documentation for developers.',
    articles: 10,
  },
]

const popularArticles = [
  {
    title: 'How to Install Equators Chatbot on Windows',
    category: 'Installation & Setup',
    readTime: '3 min read',
  },
  {
    title: 'Configuring AI Models in AI Playground',
    category: 'Configuration',
    readTime: '5 min read',
  },
  {
    title: 'Browser Privacy Settings Guide',
    category: 'Privacy & Security',
    readTime: '4 min read',
  },
  {
    title: 'Troubleshooting Connection Issues',
    category: 'Troubleshooting',
    readTime: '6 min read',
  },
  {
    title: 'Getting Started with Equators Browser',
    category: 'User Guides',
    readTime: '8 min read',
  },
]

export default function HelpCenterPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Help Center - Equators Support"
      description="Find answers to your questions about Equators applications. Browse our knowledge base, guides, and tutorials."
    >
      <Head>
        <meta property="og:title" content="Help Center - Equators Support" />
        <meta property="og:description" content="Find answers to your questions about Equators applications. Browse our knowledge base, guides, and tutorials." />
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
              Help <span className="text-gradient">Center</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Find answers to your questions, browse our knowledge base, and get the help you need 
              to make the most of Equators applications.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for articles, guides, and tutorials..."
                className="w-full pl-12 pr-4 py-4 bg-secondary-800/50 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 backdrop-blur-sm transition-colors duration-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
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
              Browse by <span className="text-gradient">Category</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Find the information you need organized by topic and application area.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover group cursor-pointer"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors duration-300">
                  <div className="text-primary-400">{category.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-colors duration-300">
                  {category.title}
                </h3>
                <p className="text-secondary-300 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-400">{category.articles} articles</span>
                  <span className="text-primary-400 text-sm group-hover:translate-x-1 transition-transform duration-200">
                    Browse →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
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
              Popular <span className="text-gradient">Articles</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              The most helpful articles from our knowledge base, frequently accessed by our community.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-secondary-400">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors duration-300">
                    <Book className="w-4 h-4 text-primary-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Still Need <span className="text-gradient">Help</span>?
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions or issues.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card text-center">
                <MessageCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-secondary-300 mb-4">
                  Get personalized help from our support team
                </p>
                <button className="btn-primary w-full">Contact Us</button>
              </div>
              
              <div className="card text-center">
                <MessageCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Community Forum</h3>
                <p className="text-secondary-300 mb-4">
                  Connect with other users and share experiences
                </p>
                <button className="btn-ghost w-full">Join Community</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
