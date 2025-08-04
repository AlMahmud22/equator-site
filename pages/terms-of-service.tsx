import Head from 'next/head'
import { motion } from 'framer-motion'
import { FileText, Users, Shield, AlertTriangle } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

export default function TermsOfServicePage() {
  const heroRef = useScrollReveal()

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: `By accessing and using Equators services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`
    },
    {
      id: 'services',
      title: 'Description of Services',
      content: `Equators provides AI-powered software applications including chatbots, AI playground tools, and browser extensions. Our services are designed to enhance productivity and provide intelligent assistance.`
    },
    {
      id: 'accounts',
      title: 'User Accounts',
      content: `You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.`
    },
    {
      id: 'conduct',
      title: 'Acceptable Use',
      content: `You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services. This includes but is not limited to attempting to gain unauthorized access to our systems.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: `Our services and all related content are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our explicit permission.`
    },
    {
      id: 'privacy',
      title: 'Privacy',
      content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices.`
    },
    {
      id: 'termination',
      title: 'Termination',
      content: `We may terminate or suspend your access to our services at any time, with or without cause, and with or without notice. You may also terminate your account at any time.`
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      content: `Our services are provided "as is" without warranties of any kind. We do not guarantee that our services will be uninterrupted, secure, or error-free.`
    },
    {
      id: 'limitation',
      title: 'Limitation of Liability',
      content: `To the maximum extent permitted by law, Equators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.`
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      content: `We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the updated terms on our website.`
    }
  ]

  return (
    <Layout
      title="Terms of Service - Equators"
      description="Read Equators' Terms of Service to understand the rules and regulations for using our AI-powered services and applications."
    >
      <Head>
        <meta property="og:title" content="Terms of Service - Equators" />
        <meta property="og:description" content="Read Equators' Terms of Service to understand the rules and regulations for using our AI-powered services and applications." />
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
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8 leading-relaxed">
              Please read these terms carefully before using our services. They govern your use of Equators applications and services.
            </p>
            <div className="text-sm text-secondary-400">
              Last updated: December 20, 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Points */}
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
              Key <span className="text-gradient">Points</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Here are the essential points you should know about using our services.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Agreement',
                description: 'By using our services, you agree to abide by these terms and conditions.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'User Responsibility',
                description: 'You are responsible for your account security and lawful use of our services.',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Service Protection',
                description: 'We protect our intellectual property and maintain service integrity.',
              },
              {
                icon: <AlertTriangle className="w-8 h-8" />,
                title: 'Limitations',
                description: 'Our liability is limited, and services are provided "as is".',
              },
            ].map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{point.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{point.title}</h3>
                <p className="text-secondary-300 text-sm">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="text-secondary-300 leading-relaxed">
                    {section.content}
                    
                    {section.id === 'conduct' && (
                      <div className="mt-4">
                        <p className="font-semibold text-white mb-2">Prohibited activities include:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Violating any applicable laws or regulations</li>
                          <li>Infringing on intellectual property rights</li>
                          <li>Distributing malware or harmful content</li>
                          <li>Attempting to reverse engineer our software</li>
                          <li>Using our services for illegal or unethical purposes</li>
                        </ul>
                      </div>
                    )}

                    {section.id === 'accounts' && (
                      <div className="mt-4">
                        <p className="font-semibold text-white mb-2">Account requirements:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Provide accurate and complete information</li>
                          <li>Maintain the security of your login credentials</li>
                          <li>Notify us immediately of any unauthorized use</li>
                          <li>Use only one account unless authorized otherwise</li>
                        </ul>
                      </div>
                    )}

                    {section.id === 'intellectual-property' && (
                      <div className="mt-4">
                        <p className="font-semibold text-white mb-2">Our intellectual property includes:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Software applications and source code</li>
                          <li>Trademarks, logos, and brand materials</li>
                          <li>Documentation and user guides</li>
                          <li>AI models and training data</li>
                        </ul>
                      </div>
                    )}

                    {section.id === 'disclaimers' && (
                      <div className="mt-4">
                        <p className="font-semibold text-white mb-2">Specific disclaimers:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>No warranty of merchantability or fitness for purpose</li>
                          <li>No guarantee of availability or uptime</li>
                          <li>AI responses may not always be accurate</li>
                          <li>Third-party integrations are subject to their own terms</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>If you have any questions about these Terms of Service, please contact us:</p>
                  <div className="bg-secondary-800 p-6 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-white mb-2">Email</h3>
                        <p>legal@equators.tech</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Address</h3>
                        <p>Equators Inc.<br />Malaysia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
