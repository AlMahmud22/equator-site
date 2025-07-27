import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Youtube, MessageCircle, Mail, Heart } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useScrollReveal } from '@/hooks/useAnimations'

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const footerLinks = [
  {
    title: 'Products',
    links: [
      { name: 'Equators Chatbot', href: '/products/chatbot' },
      { name: 'AI Playground', href: '/products/ai-playground' },
      { name: 'Equators Browser', href: '/products/browser' },
      { name: 'All Downloads', href: '/products' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'News & Updates', href: '/news' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Status Page', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'DMCA', href: '/dmca' },
    ],
  },
]

const socialLinks = [
  {
    name: 'GitHub',
    href: siteConfig.social.github,
    icon: Github,
    color: 'hover:text-gray-400',
  },
  {
    name: 'Twitter',
    href: siteConfig.social.twitter,
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'Discord',
    href: siteConfig.social.discord,
    icon: MessageCircle,
    color: 'hover:text-indigo-400',
  },
  {
    name: 'YouTube',
    href: siteConfig.social.youtube,
    icon: Youtube,
    color: 'hover:text-red-400',
  },
]

export default function Footer() {
  const footerRef = useScrollReveal()

  return (
    <footer className="bg-secondary-950 border-t border-secondary-800">
      <div className="container-custom">
        <motion.div
          ref={footerRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16"
        >
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-gradient">Equators</span>
              </Link>
              
              <p className="text-secondary-300 mb-6 leading-relaxed">
                Building the future with powerful desktop applications. 
                Join thousands of users who trust Equators for their daily workflow.
              </p>
              
              {/* Newsletter Signup */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Stay Updated</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-l-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
                  />
                  <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-r-lg transition-colors duration-200">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-secondary-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-secondary-800">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center text-secondary-400 text-sm">
                <span>© 2024 Equators. Made with</span>
                <Heart className="w-4 h-4 mx-1 text-red-500 fill-current animate-pulse" />
                <span>by the Equators team.</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-secondary-400 ${social.color} transition-colors duration-200`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>

              {/* Additional Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link
                  href="/sitemap"
                  className="text-secondary-400 hover:text-white transition-colors duration-200"
                >
                  Sitemap
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center text-secondary-400 hover:text-white transition-colors duration-200"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 opacity-0 transition-opacity duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </motion.button>
    </footer>
  )
}
