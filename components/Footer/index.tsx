import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Mail, EyeOff } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const footerLinks = [
  {
    title: 'Projects',
    links: [
      { name: 'Privacy Chatbot', href: '/products/chatbot' },
      { name: 'AI Playground', href: '/products/ai-playground' },
      { name: 'Privacy Browser', href: '/products/browser' },
      { name: 'View All', href: '/products' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { name: 'Models Hub', href: '/models' },
      { name: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { name: 'Contact', href: '/contact' },
      { name: 'GitHub', href: siteConfig.social.github },
      { name: 'Twitter', href: siteConfig.social.twitter },
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
    name: 'Email',
    href: `mailto:${siteConfig.contact.email}`,
    icon: Mail,
    color: 'hover:text-green-400',
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
                Building privacy-first AI tools and open-source projects. 
                Passionate about digital sovereignty, decentralized technology, 
                and creating software that puts users first.
              </p>
              
              {/* Newsletter Signup - Simplified */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Let&apos;s Connect</h4>
                <p className="text-secondary-400 text-sm">
                  Have questions about my projects? Want to collaborate? 
                  <Link href="/contact" className="text-primary-400 hover:text-primary-300 ml-1">
                    Get in touch →
                  </Link>
                </p>
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
                <span>© 2025 Equators.</span>
                <EyeOff className="w-4 h-4 mx-2 text-green-500 fill-current animate-pulse" />
                <span>Privacy-first. Open-source. User-owned.</span>
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

              {/* Quick Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link
                  href="/products"
                  className="text-secondary-400 hover:text-white transition-colors duration-200"
                >
                  Projects
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
