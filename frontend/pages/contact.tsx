import Head from 'next/head'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

export default function ContactPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Contact - Equators"
      description="Get in touch about Equators projects. Questions, feedback, or collaboration opportunities welcome."
    >
      <Head>
        <meta property="og:title" content="Contact - Equators" />
        <meta property="og:description" content="Get in touch about Equators projects. Questions, feedback, or collaboration opportunities welcome." />
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
              Let&apos;s <span className="text-gradient">Connect</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Have questions about my projects? Interested in collaboration? Want to hire me? 
              I&apos;d love to hear from you and discuss how we can work together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <Mail className="w-8 h-8" />,
                title: 'Email Me',
                description: 'Questions, feedback, or just to say hello',
                contact: 'al.mahmud@equators.tech',
                action: 'Send Email',
                href: 'mailto:al.mahmud@equators.tech'
              },
              {
                icon: <Phone className="w-8 h-8" />,
                title: 'WhatsApp',
                description: 'Quick messages and collaboration',
                contact: '+60 11-6132 0832',
                action: 'Message Now',
                href: 'https://wa.me/601161320832'
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: 'Location',
                description: 'Currently based in',
                contact: 'Malaysia',
                action: 'Remote Work'
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Response Time',
                description: 'I typically reply within',
                contact: '12-24 hours',
                action: 'Quick Reply'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{item.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-secondary-300 mb-4">{item.description}</p>
                <p className="text-primary-400 font-medium mb-4">{item.contact}</p>
                {item.href ? (
                  <a 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm inline-block"
                  >
                    {item.action}
                  </a>
                ) : (
                  <button className="btn-ghost text-sm">{item.action}</button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Send me a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    What&apos;s this about?
                  </label>
                  <select className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors duration-200">
                    <option value="">Select a topic</option>
                    <option value="projects">Questions about my projects</option>
                    <option value="collaboration">Collaboration opportunity</option>
                    <option value="hiring">Hiring/Job opportunity</option>
                    <option value="feedback">Feedback or suggestions</option>
                    <option value="other">Just saying hello</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200 resize-none"
                    placeholder="Tell me about your project, idea, or just say hi..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
