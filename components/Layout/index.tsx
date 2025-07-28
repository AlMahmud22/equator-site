import { ReactNode, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  showNavbar?: boolean
  showFooter?: boolean
}

export default function Layout({
  children,
  title = 'Equators - Privacy-Focused AI Desktop Suite',
  description = 'Secure, decentralized AI applications: Privacy-first Chatbot, open-architecture AI Playground, and freedom-focused Browser. Built for digital sovereignty.',
  className = '',
  showNavbar = true,
  showFooter = true,
}: LayoutProps) {
  const router = useRouter()

  // Initialize scroll animations
  useEffect(() => {
    // Simple intersection observer for scroll animations
    if (typeof window !== 'undefined') {
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
            entry.target.classList.remove('opacity-0')
          }
        })
      }

      const observer = new IntersectionObserver(observerCallback, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      })

      // Observe elements with the animate-on-scroll class
      const elements = document.querySelectorAll('.animate-on-scroll')
      elements.forEach((el) => {
        el.classList.add('opacity-0', 'transition-all', 'duration-700')
        observer.observe(el)
      })

      return () => observer.disconnect()
    }
  }, [router.pathname])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://equators.tech${router.asPath}`} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/logo.svg" as="image" />
      </Head>
      
      <div className={`min-h-screen flex flex-col bg-pitch-black text-gray-100 ${className}`}>
        {showNavbar && <Navbar />}
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </>
  )
}
