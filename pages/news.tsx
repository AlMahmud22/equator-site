import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'
import { formatDate } from '@/shared/utils/dateUtils'
import { GetStaticProps } from 'next'

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  publishedAt: string
  readTime: number
  category: string
  tags: string[]
  featured: boolean
}

// Stylized usernames for authors
const authorNames = ['Blue', 'Grey', 'Red', 'Axsios', 'Nante', 'Echo', 'Vega']

// Function to get a consistent random author for each article
const getAuthorForArticle = (articleId: string): string => {
  const index = parseInt(articleId) % authorNames.length
  return authorNames[index]
}

const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Equators Chatbot 2.1.0 Released: Enhanced AI Capabilities',
    excerpt: 'The latest version of our AI chatbot brings improved natural language processing, better context understanding, and new integrations.',
    content: 'Full article content here...',
    image: '/images/news/chatbot-update.jpg',
    author: getAuthorForArticle('1'),
    publishedAt: '2024-12-15',
    readTime: 5,
    category: 'Product Update',
    tags: ['Chatbot', 'AI', 'Update'],
    featured: true,
  },
  {
    id: '2',
    title: 'Privacy First: Our Commitment to User Data Protection',
    excerpt: 'Learn about the security measures and privacy features we have implemented across all Equators applications.',
    content: 'Full article content here...',
    image: '/images/news/privacy-security.jpg',
    author: getAuthorForArticle('2'),
    publishedAt: '2024-12-10',
    readTime: 7,
    category: 'Security',
    tags: ['Privacy', 'Security', 'Data Protection'],
    featured: true,
  },
  {
    id: '3',
    title: 'AI Playground Gets Machine Learning Model Comparison',
    excerpt: 'Compare different AI models side-by-side with our new comparison feature in AI Playground.',
    content: 'Full article content here...',
    image: '/images/news/ai-playground-update.jpg',
    author: getAuthorForArticle('3'),
    publishedAt: '2024-12-05',
    readTime: 4,
    category: 'Feature',
    tags: ['AI Playground', 'Machine Learning', 'Feature'],
    featured: false,
  },
  {
    id: '4',
    title: 'Equators Browser: Built-in VPN Now Available',
    excerpt: 'Browse the web with enhanced privacy using our new built-in VPN feature in Equators Browser.',
    content: 'Full article content here...',
    image: '/images/news/browser-vpn.jpg',
    author: getAuthorForArticle('4'),
    publishedAt: '2024-11-28',
    readTime: 6,
    category: 'Feature',
    tags: ['Browser', 'VPN', 'Privacy'],
    featured: false,
  },
  {
    id: '5',
    title: 'Community Spotlight: How Users Are Using Equators Apps',
    excerpt: 'Discover creative ways our community is using Equators applications in their daily workflows.',
    content: 'Full article content here...',
    image: '/images/news/community-spotlight.jpg',
    author: getAuthorForArticle('5'),
    publishedAt: '2024-11-20',
    readTime: 8,
    category: 'Community',
    tags: ['Community', 'Use Cases', 'Spotlight'],
    featured: false,
  },
  {
    id: '6',
    title: 'Roadmap 2025: What\'s Coming Next for Equators',
    excerpt: 'Get a sneak peek at the exciting features and improvements we\'re planning for the upcoming year.',
    content: 'Full article content here...',
    image: '/images/news/roadmap-2025.jpg',
    author: getAuthorForArticle('6'),
    publishedAt: '2024-11-15',
    readTime: 10,
    category: 'Announcement',
    tags: ['Roadmap', 'Future', 'Planning'],
    featured: false,
  },
]

const categories = ['All', 'Product Update', 'Feature', 'Security', 'Community', 'Announcement']

interface NewsPageProps {
  articles: NewsArticle[]
}

export default function NewsPage({ articles }: NewsPageProps) {
  const heroRef = useScrollReveal()
  const featuredArticles = articles.filter(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

  return (
    <Layout
      title="News & Updates - Equators"
      description="Stay updated with the latest news, product updates, and announcements from Equators."
    >
      <Head>
        <meta property="og:title" content="News & Updates - Equators" />
        <meta property="og:description" content="Stay updated with the latest news, product updates, and announcements from Equators." />
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
              News & <span className="text-gradient">Updates</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Stay up to date with the latest product updates, feature announcements, 
              and insights from the Equators team.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border border-secondary-700 text-secondary-300 hover:text-white hover:bg-secondary-800"
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="section-padding bg-secondary-900">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Featured <span className="text-gradient">Stories</span>
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover group cursor-pointer"
                >
                  <Link href={`/news/${article.id}`}>
                    <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-xs text-primary-300">
                        {article.category}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-gradient transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-secondary-300 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-secondary-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate.toLocaleDateString(article.publishedAt, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.readTime} min read
                          </div>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-secondary-800">
                        <span className="text-sm text-secondary-400">
                          by {article.author}
                        </span>
                        
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-secondary-800 text-xs text-secondary-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Articles */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Latest <span className="text-gradient">Articles</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover group cursor-pointer"
              >
                <Link href={`/news/${article.id}`}>
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded text-xs text-primary-300">
                      {article.category}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-secondary-300 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-secondary-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate.toLocaleDateString(article.publishedAt, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {article.readTime} min
                        </div>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-secondary-800">
                      <span className="text-xs text-secondary-400">
                        by {article.author}
                      </span>
                      
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-secondary-500" />
                        <span className="text-xs text-secondary-400">
                          {article.tags[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Load More Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <button className="btn-secondary px-8 py-3">
              Load More Articles
            </button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Subscribe */}
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
              Never Miss an <span className="text-gradient">Update</span>
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Subscribe to our newsletter and be the first to know about new features, 
              product updates, and company news.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
              />
              <button className="btn-primary px-6 py-3">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      articles: newsArticles,
    },
    revalidate: 3600, // Revalidate every hour
  }
}
