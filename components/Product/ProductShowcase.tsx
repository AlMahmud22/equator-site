'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Download, ExternalLink } from 'lucide-react'
import { products } from '@/config/site'
import { useScrollReveal } from '@/hooks/useAnimations'
import { getOSSpecificDownload } from '@/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function ProductShowcase() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const sectionRef = useScrollReveal()

  return (
    <section className="section-padding bg-gradient-to-b from-secondary-950 to-secondary-900">
      <div className="container-custom">
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Our <span className="text-gradient">Product Suite</span>
            </h2>
            <p className="text-lg sm:text-xl text-secondary-300 max-w-3xl mx-auto">
              Discover powerful desktop applications designed to enhance your productivity, 
              creativity, and digital experience.
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const download = getOSSpecificDownload(product.id)
              
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="group"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="card-hover h-full relative overflow-hidden">
                    {/* Product Image */}
                    <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
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
                        className="absolute top-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-2xl z-20"
                        animate={{
                          y: hoveredProduct === product.id ? -5 : 0,
                          scale: hoveredProduct === product.id ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {product.icon}
                      </motion.div>
                      
                      {/* Version Badge */}
                      <div className="absolute top-4 right-4 px-2 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-xs text-primary-300 z-20">
                        v{product.version}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-sm text-primary-400 font-medium mb-3">
                          {product.tagline}
                        </p>
                        <p className="text-secondary-300 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-secondary-400">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3" />
                            {feature}
                          </div>
                        ))}
                        {product.features.length > 3 && (
                          <div className="text-sm text-secondary-500">
                            +{product.features.length - 3} more features
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link
                          href={`/products/${product.id}`}
                          className="btn-primary flex-1 group/btn"
                        >
                          <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                          {download.label}
                        </Link>
                        
                        <Link
                          href={`/products/${product.id}`}
                          className="btn-ghost flex-shrink-0 group/btn"
                        >
                          Learn More
                          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200" />
                        </Link>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to get started?
                </h3>
                <p className="text-secondary-300 mb-6 max-w-md">
                  Download all our applications for free and experience the future of desktop software.
                </p>
                <Link href="/products" className="btn-accent group">
                  View All Products
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
