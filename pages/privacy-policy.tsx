import Head from 'next/head'
import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Database } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

export default function PrivacyPolicyPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Privacy Policy - Equators"
      description="Learn how Equators collects, uses, and protects your personal information. Our commitment to your privacy."
    >
      <Head>
        <meta property="og:title" content="Privacy Policy - Equators" />
        <meta property="og:description" content="Learn how Equators collects, uses, and protects your personal information. Our commitment to your privacy." />
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
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8 leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="text-sm text-secondary-400">
              Last updated: December 20, 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Principles */}
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
              Our <span className="text-gradient">Privacy Principles</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              We believe in transparency, minimal data collection, and putting you in control of your information.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Data Protection',
                description: 'Your data is encrypted and securely stored with industry-standard practices.',
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: 'Transparency',
                description: 'We clearly explain what data we collect and how we use it.',
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: 'User Control',
                description: 'You have full control over your data and can delete it at any time.',
              },
              {
                icon: <Database className="w-8 h-8" />,
                title: 'Minimal Collection',
                description: 'We only collect data that is necessary for our services to function.',
              },
            ].map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{principle.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{principle.title}</h3>
                <p className="text-secondary-300 text-sm">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <div className="space-y-12">
                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We collect information you provide directly to us, such as when you:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Create an account or profile</li>
                      <li>Use our applications or services</li>
                      <li>Contact us for support</li>
                      <li>Subscribe to our newsletter</li>
                      <li>Participate in surveys or promotions</li>
                    </ul>
                    <p>This may include your name, email address, username, and any content you create or share through our services.</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send you technical notices and support messages</li>
                      <li>Respond to your comments and questions</li>
                      <li>Monitor and analyze usage patterns and trends</li>
                      <li>Detect, investigate, and prevent fraudulent activities</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing and Disclosure</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>With your explicit consent</li>
                      <li>To comply with legal obligations</li>
                      <li>To protect our rights and safety</li>
                      <li>With trusted service providers who assist in our operations</li>
                      <li>In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Employee training on data protection practices</li>
                    </ul>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights and Choices</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>You have the following rights regarding your personal information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Access and update your account information</li>
                      <li>Request deletion of your personal data</li>
                      <li>Opt out of marketing communications</li>
                      <li>Request a copy of your data</li>
                      <li>Object to certain processing activities</li>
                    </ul>
                    <p>To exercise these rights, please contact us at privacy@equators.tech.</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We use cookies and similar tracking technologies to collect and store information about your interactions with our services. You can control cookies through your browser settings.</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;last updated&quot; date.</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                  <div className="text-secondary-300 space-y-4">
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <div className="bg-secondary-800 p-4 rounded-lg">
                      <p>Email: privacy@equators.tech</p>
                      <p>Address: Equators Inc., Malaysia</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
