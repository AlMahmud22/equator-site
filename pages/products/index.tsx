import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Download, Star, Users, ExternalLink } from 'lucide-react'
import Layout from '@/components/Layout'
import { products } from '@/config/site'
import { getOSSpecificDownload, formatFileSize } from '@/utils'
import { formatDate } from '@/utils/dateUtils'

export default function ProductsPage() {

  return (
    <Layout
      title="Products - Desktop Applications by Equators"
      description="Download our powerful desktop applications: Equators Chatbot, AI Playground, and Browser. Available for Windows, macOS, and Linux."
    >
      <Head>
        <meta property="og:title" content="Products - Desktop Applications by Equators" />
        <meta property="og:description" content="Download our powerful desktop applications: Equators Chatbot, AI Playground, and Browser. Available for Windows, macOS, and Linux." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 section-padding bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-gradient">Products</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Discover our suite of powerful desktop applications designed to enhance 
              your productivity, creativity, and digital experience.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {[
                { number: '3', label: 'Applications' },
                { number: '500K+', label: 'Downloads' },
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

      {/* Products Grid */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const download = getOSSpecificDownload(product.id)
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover group h-full flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 z-10" />
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Floating Icon */}
                    <motion.div
                      whileHover={{ y: -5, scale: 1.1 }}
                      className="absolute top-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-2xl z-20"
                    >
                      {product.icon}
                    </motion.div>
                    
                    {/* Version Badge */}
                    <div className="absolute top-4 right-4 px-2 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-xs text-primary-300 z-20">
                      v{product.version}
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80 z-20">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        4.8
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        10K+
                      </div>
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {formatFileSize(parseInt(product.size.replace(' MB', '')) * 1024 * 1024)}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-sm text-primary-400 font-medium mb-3">
                        {product.tagline}
                      </p>
                      <p className="text-secondary-300 leading-relaxed mb-6">
                        {product.description}
                      </p>

                      {/* Features Preview */}
                      <div className="space-y-2 mb-6">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-secondary-400">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3" />
                            {feature}
                          </div>
                        ))}
                        {product.features.length > 3 && (
                          <div className="text-sm text-secondary-500 ml-4">
                            +{product.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>

                    {/* System Requirements */}
                    <div className="mb-6 p-4 bg-secondary-800/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-white mb-2">System Requirements</h4>
                      <div className="text-xs text-secondary-400 space-y-1">
                        <div><strong>OS:</strong> {product.requirements.os}</div>
                        <div><strong>RAM:</strong> {product.requirements.ram}</div>
                        <div><strong>Storage:</strong> {product.requirements.storage}</div>
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-secondary-400 mb-2">
                        <span>Available for:</span>
                        <span>Released: {formatDate.toLocaleDateString(product.releaseDate)}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <a
                          href={product.downloads.windows}
                          className="flex flex-col items-center p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200 group/os"
                          download
                        >
                          <span className="text-lg mb-1">🪟</span>
                          <span className="text-xs text-secondary-300 group-hover/os:text-white">Windows</span>
                        </a>
                        <a
                          href={product.downloads.mac}
                          className="flex flex-col items-center p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200 group/os"
                          download
                        >
                          <span className="text-lg mb-1">🍎</span>
                          <span className="text-xs text-secondary-300 group-hover/os:text-white">macOS</span>
                        </a>
                        <a
                          href={product.downloads.linux}
                          className="flex flex-col items-center p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200 group/os"
                          download
                        >
                          <span className="text-lg mb-1">🐧</span>
                          <span className="text-xs text-secondary-300 group-hover/os:text-white">Linux</span>
                        </a>
                      </div>

                      {/* Primary Actions */}
                      <div className="flex flex-col gap-3">
                        <a
                          href={download.url}
                          className="btn-primary w-full group/btn"
                          download
                        >
                          <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                          {download.label}
                        </a>
                        
                        <Link
                          href={`/products/${product.id}`}
                          className="btn-secondary w-full group/btn"
                        >
                          Learn More
                          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
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
              Ready to Get <span className="text-gradient">Started</span>?
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Join thousands of users who have already discovered the power of Equators applications. 
              Download for free and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary px-8 py-4">
                Create Free Account
              </Link>
              <Link href="/about" className="btn-ghost px-8 py-4">
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
