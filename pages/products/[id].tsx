import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Star, Shield, Zap, Users, ArrowLeft, ExternalLink } from 'lucide-react'
import Layout from '@/components/Layout'
import { products, Product } from '@/config/site'
import { getOSSpecificDownload, formatFileSize } from '@/utils'

interface ProductPageProps {
  product: Product
}

export default function ProductPage({ product }: ProductPageProps) {
  const download = getOSSpecificDownload(product.id)

  return (
    <Layout
      title={`${product.name} - ${product.tagline}`}
      description={product.longDescription.substring(0, 160)}
    >
      <Head>
        <meta property="og:title" content={`${product.name} - ${product.tagline}`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": product.name,
              "description": product.description,
              "applicationCategory": "Desktop Application",
              "operatingSystem": "Windows, macOS, Linux",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Equators"
              }
            })
          }}
        />
      </Head>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 section-padding bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-secondary-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors duration-200">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-white transition-colors duration-200">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary-400">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Product Info */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center mb-4"
                >
                  <div className="text-4xl mr-4">{product.icon}</div>
                  <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300">
                    v{product.version}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                >
                  {product.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-primary-400 font-medium mb-6"
                >
                  {product.tagline}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg text-secondary-300 mb-8 leading-relaxed"
                >
                  {product.description}
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center space-x-6 mb-8"
                >
                  <div className="flex items-center text-sm text-secondary-400">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    4.8 Rating
                  </div>
                  <div className="flex items-center text-sm text-secondary-400">
                    <Download className="w-4 h-4 mr-1" />
                    {formatFileSize(parseInt(product.size.replace(' MB', '')) * 1024 * 1024)}
                  </div>
                  <div className="flex items-center text-sm text-secondary-400">
                    <Users className="w-4 h-4 mr-1" />
                    10K+ Downloads
                  </div>
                </motion.div>

                {/* Download Button */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <a
                    href={download.url}
                    className="btn-primary text-lg px-8 py-4 group"
                    download
                  >
                    <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                    {download.label}
                  </a>
                  
                  <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                    Learn More
                  </Link>
                </motion.div>
              </div>

              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary-500/30"
                >
                  <Shield className="w-8 h-8 text-primary-400" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Key <span className="text-gradient">Features</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Discover what makes {product.name} the perfect choice for your needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
                <p className="text-secondary-300">
                  Experience the power and efficiency of {feature.toLowerCase()} in {product.name}.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="section-padding bg-secondary-950">
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
                System <span className="text-gradient">Requirements</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Minimum Requirements</h3>
                <div className="space-y-3 text-secondary-300">
                  <div><strong>OS:</strong> {product.requirements.os}</div>
                  <div><strong>RAM:</strong> {product.requirements.ram}</div>
                  <div><strong>Storage:</strong> {product.requirements.storage}</div>
                  {product.requirements.gpu && (
                    <div><strong>GPU:</strong> {product.requirements.gpu}</div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Download Options</h3>
                <div className="space-y-3">
                  <a
                    href={product.downloads.windows}
                    className="flex items-center justify-between p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                    download
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🪟</span>
                      <span className="text-white">Windows</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-secondary-400" />
                  </a>
                  <a
                    href={product.downloads.mac}
                    className="flex items-center justify-between p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                    download
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🍎</span>
                      <span className="text-white">macOS</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-secondary-400" />
                  </a>
                  <a
                    href={product.downloads.linux}
                    className="flex items-center justify-between p-3 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                    download
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🐧</span>
                      <span className="text-white">Linux</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-secondary-400" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Products */}
      <section className="py-8 bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/products" className="btn-ghost group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to All Products
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = products.map((product) => ({
    params: { id: product.id },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const product = products.find((p) => p.id === params?.id)

  if (!product) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      product,
    },
    revalidate: 3600,
  }
}
