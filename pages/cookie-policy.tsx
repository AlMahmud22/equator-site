import Head from 'next/head'
import { motion } from 'framer-motion'
import { Cookie, Settings, Eye, Shield } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/hooks/useAnimations'

export default function CookiePolicyPage() {
  const heroRef = useScrollReveal()

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'Required for the website to function properly. These cannot be disabled.',
      examples: ['Authentication', 'Security', 'Load balancing'],
      retention: 'Session or up to 1 year'
    },
    {
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      examples: ['Google Analytics', 'Page views', 'User behavior'],
      retention: 'Up to 2 years'
    },
    {
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'Theme settings', 'User preferences'],
      retention: 'Up to 1 year'
    },
    {
      name: 'Marketing Cookies',
      description: 'Used to track visitors and display relevant advertisements.',
      examples: ['Ad targeting', 'Social media integration', 'Marketing campaigns'],
      retention: 'Up to 1 year'
    }
  ]

  return (
    <Layout
      title="Cookie Policy - Equators"
      description="Learn about how Equators uses cookies and similar technologies to improve your browsing experience and our services."
    >
      <Head>
        <meta property="og:title" content="Cookie Policy - Equators" />
        <meta property="og:description" content="Learn about how Equators uses cookies and similar technologies to improve your browsing experience and our services." />
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
              Cookie <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8 leading-relaxed">
              Learn how we use cookies and similar technologies to enhance your experience on our website.
            </p>
            <div className="text-sm text-secondary-400">
              Last updated: December 20, 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Cookies */}
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
              What Are <span className="text-gradient">Cookies?</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <Cookie className="w-8 h-8" />,
                title: 'Small Files',
                description: 'Cookies are tiny text files stored locally on your device by your browser.',
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: 'Functionality',
                description: 'They help websites remember your preferences and improve functionality.',
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: 'Analytics',
                description: 'Some cookies help us understand how visitors use our website.',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Security',
                description: 'Essential cookies are necessary for security and basic website functions.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{item.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-secondary-300 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookie Types */}
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
              Types of <span className="text-gradient">Cookies We Use</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              We use different types of cookies for various purposes to enhance your browsing experience.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">{type.name}</h3>
                <p className="text-secondary-300 mb-4">{type.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-white mb-2">Examples:</h4>
                  <div className="flex flex-wrap gap-2">
                    {type.examples.map((example, i) => (
                      <span
                        key={i}
                        className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-secondary-400">
                  <strong>Retention:</strong> {type.retention}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cookie Management */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Managing Your <span className="text-gradient">Cookie Preferences</span>
              </h2>
              <p className="text-lg text-secondary-300">
                You have control over which cookies you accept. Here&apos;s how to manage them.
              </p>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">Browser Settings</h3>
                <p className="text-secondary-300 mb-4">
                  You can control cookies through your browser settings. Here&apos;s how to do it in popular browsers:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Chrome</h4>
                    <p className="text-sm text-secondary-300">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Firefox</h4>
                    <p className="text-sm text-secondary-300">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Safari</h4>
                    <p className="text-sm text-secondary-300">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Edge</h4>
                    <p className="text-sm text-secondary-300">Settings → Cookies and site permissions → Cookies and site data</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">Cookie Consent Banner</h3>
                <p className="text-secondary-300 mb-4">
                  When you first visit our website, you&apos;ll see a cookie consent banner that allows you to:
                </p>
                <ul className="list-disc pl-6 text-secondary-300 space-y-2">
                  <li>Accept all cookies</li>
                  <li>Accept only essential cookies</li>
                  <li>Customize your cookie preferences</li>
                  <li>Learn more about our cookie usage</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">Third-Party Cookies</h3>
                <p className="text-secondary-300 mb-4">
                  We may use third-party services that set their own cookies:
                </p>
                <div className="space-y-3">
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Google Analytics</h4>
                    <p className="text-sm text-secondary-300">Helps us understand website usage and improve our services.</p>
                  </div>
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Social Media Plugins</h4>
                    <p className="text-sm text-secondary-300">Enable sharing and social media integration features.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">Impact of Disabling Cookies</h3>
                <p className="text-secondary-300 mb-4">
                  If you choose to disable certain cookies, some features may not work properly:
                </p>
                <ul className="list-disc pl-6 text-secondary-300 space-y-2">
                  <li>You may need to log in repeatedly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some interactive features may not function</li>
                  <li>We may not be able to provide personalized content</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
                <p className="text-secondary-300 mb-4">
                  If you have questions about our cookie policy, please contact us:
                </p>
                <div className="bg-secondary-800 p-4 rounded-lg">
                  <p className="text-secondary-300">Email: privacy@equators.tech</p>
                  <p className="text-secondary-300">Address: Equators Inc., Malaysia</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
