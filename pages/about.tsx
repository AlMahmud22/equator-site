import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Target, Zap, Heart } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const values = [
  {
    icon: <Users className="w-8 h-8" />,
    title: 'User-Centric',
    description: 'Everything we build starts with understanding our users\' needs and creating tools that truly empower digital freedom.',
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Innovation First',
    description: 'We push boundaries and explore new possibilities to deliver cutting-edge software experiences.',
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Performance Driven',
    description: 'Speed, efficiency, and reliability are at the core of every application we create.',
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Community Focused',
    description: 'We believe in building software that brings people together and strengthens communities.',
  },
]

const milestones = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Started with a vision to create better desktop software.',
  },
  {
    year: '2021',
    title: 'First Product Launch',
    description: 'Launched Equators Chatbot to 1,000+ early adopters.',
  },
  {
    year: '2022',
    title: 'AI Playground Released',
    description: 'Introduced our innovative AI experimentation platform.',
  },
  {
    year: '2023',
    title: 'Browser Launch',
    description: 'Released our privacy-focused web browser.',
  },
  {
    year: '2024',
    title: '100K+ Users',
    description: 'Reached a major milestone of 100,000 active users.',
  },
]

export default function AboutPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="About Equators - Privacy-First AI Innovation"
      description="Learn about Equators' mission to create decentralized, privacy-focused AI applications. Discover our commitment to digital sovereignty and user control."
    >
      <Head>
        <meta property="og:title" content="About Equators - Privacy-First AI Innovation" />
        <meta property="og:description" content="Learn about Equators' mission to create decentralized, privacy-focused AI applications. Discover our commitment to digital sovereignty and user control." />
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
              Building the <span className="text-gradient">Future</span> of Desktop Software
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              We&apos;re a passionate team of developers, designers, and innovators committed to 
              creating powerful desktop applications that enhance productivity and creativity.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {[
                { number: '100K+', label: 'Active Users' },
                { number: '3', label: 'Products' },
                { number: '50+', label: 'Countries' },
                { number: '4.8★', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-secondary-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-lg text-secondary-300 mb-6 leading-relaxed">
                At Equators, we believe that great software should be accessible, powerful, 
                and beautiful. Our mission is to create desktop applications that not only 
                meet today&apos;s needs but anticipate tomorrow&apos;s challenges.
              </p>
              <p className="text-lg text-secondary-300 leading-relaxed">
                We&apos;re committed to privacy, performance, and user experience. Every line of 
                code we write, every feature we design, and every decision we make is guided 
                by our dedication to building software that truly serves our users.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <div className="text-8xl">🚀</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              These core principles guide everything we do and shape the culture of our team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-400">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-secondary-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Our <span className="text-gradient">Journey</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              From a small startup to a growing company trusted by thousands of users worldwide.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-primary-500/30 hidden md:block" />
              
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative flex items-start mb-12 last:mb-0"
                >
                  {/* Timeline Dot */}
                  <div className="hidden md:flex w-16 h-16 bg-primary-500 rounded-full items-center justify-center text-white font-bold text-lg mr-8 z-10">
                    {milestone.year.slice(-2)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 card">
                    <div className="md:hidden text-primary-400 font-bold text-lg mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                    <p className="text-secondary-300">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-pitch-black">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 heading-3d">
              Our <span className="text-gradient">Team</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Built by <strong className="text-neon-cyan">Axios</strong> - a dedicated team of developers and innovators passionate about creating privacy-focused, decentralized applications that put user control and digital sovereignty first.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-950/50 to-accent-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to <span className="text-gradient">Get Started</span>?
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Join thousands of users who trust Equators for their desktop software needs. 
              Download our applications and experience the difference.
            </p>
            <Link href="/products" className="btn-accent text-lg px-8 py-4">
              Explore Our Products
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
