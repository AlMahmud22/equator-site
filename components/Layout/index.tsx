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
  title = 'Equators - Desktop Applications Suite',
  description = 'Discover and download powerful desktop applications including Equators Chatbot, AI Playground, and Browser.',
  className = '',
  showNavbar = true,
  showFooter = true,
}: LayoutProps) {
  const router = useRouter()

  // Initialize scroll animations
  useEffect(() => {
    // Load ScrollReveal dynamically
    if (typeof window !== 'undefined') {
      import('scrollreveal').then((ScrollReveal) => {
        const sr = ScrollReveal.default({
          distance: '30px',
          duration: 800,
          easing: 'ease-out',
          reset: false,
          viewFactor: 0.2,
        })

        // Reveal elements with the animate-on-scroll class
        sr.reveal('.animate-on-scroll', {
          interval: 100,
        })
      })
    }
  }, [router.pathname])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://equators.com${router.asPath}`} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/logo.svg" as="image" />
      </Head>
      
      <div className={`min-h-screen flex flex-col ${className}`}>
        {showNavbar && <Navbar />}
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </>
  )
}
