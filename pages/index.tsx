import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import NoSSR from '@/components/NoSSR'
import ProductShowcase from '@/components/Product/ProductShowcase'
import { siteConfig } from '@/config/site'

export default function HomePage() {
  return (
    <Layout>
      <Head>
        <title>{siteConfig.title}</title>
        <meta name="description" content={siteConfig.description} />
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={siteConfig.ogImage} />
        <meta property="og:url" content={siteConfig.url} />
        
        {/* Structured data for homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Equators",
              "description": siteConfig.description,
              "url": siteConfig.url,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      {/* Hero Section */}
      <NoSSR fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-950 via-primary-950 to-accent-950">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Powerful</span>{' '}
              <span className="text-gradient">Desktop Apps</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8">
              Loading the future of desktop applications...
            </p>
          </div>
        </div>
      }>
        <Hero />
      </NoSSR>

      {/* Product Showcase */}
      <ProductShowcase />

      {/* Features Section */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              What Makes My Projects <span className="text-gradient">Special</span>?
            </h2>
            <p className="text-lg sm:text-xl text-secondary-300 max-w-3xl mx-auto">
              Each tool I build focuses on privacy, simplicity, and giving users control over their 
              digital experience. Here&apos;s what drives my development philosophy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'Your data stays yours. I prioritize privacy and security in every line of code.',
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Optimized performance that doesn\'t compromise on functionality or features.',
              },
              {
                icon: '🎨',
                title: 'Beautiful Design',
                description: 'Intuitive interfaces that make complex tasks simple and enjoyable.',
              },
              {
                icon: '🔄',
                title: 'Regular Updates',
                description: 'Continuous improvements with new features and security patches.',
              },
              {
                icon: '🌍',
                title: 'Cross-Platform',
                description: 'Available on Windows, macOS, and Linux. Use anywhere, anytime.',
              },
              {
                icon: '💬',
                title: 'Open Source',
                description: 'Built with transparency and community feedback. Code available on GitHub.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-secondary-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Testimonials Section */}
      <section className="section-padding bg-gradient-to-r from-primary-950/50 to-accent-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Join the <span className="text-gradient">Growing Community</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 max-w-3xl mx-auto">
              These are some stats from my projects. Each download represents someone who values 
              privacy-first software and digital independence.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { number: '5+', label: 'Active Projects' },
                { number: '12K+', label: 'Total Downloads' },
                { number: '298', label: 'GitHub Stars' },
                { number: '100%', label: 'Open Source' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-secondary-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/products" className="btn-accent text-lg px-8 py-4">
                Explore My Projects
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
  }
}
