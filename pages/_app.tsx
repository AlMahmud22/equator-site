import type { AppProps } from 'next/app'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { siteConfig } from '@/config/site'
import { AuthProvider } from '@/shared/hooks/useAuth'
import '@/styles/globals.css'

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Track page views and handle route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Add analytics tracking here if needed
      console.log('Route changed to:', url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // Initialize scroll reveal on route changes
  useEffect(() => {
    // Reset scroll position on route change
    const handleRouteChangeStart = () => {
      // Optionally scroll to top on route change
      // window.scrollTo(0, 0)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>{siteConfig.title}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={siteConfig.ogImage} />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.title} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={siteConfig.ogImage} />
        
        {/* Theme */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="color-scheme" content="dark" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </Head>
      
      <div className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </div>
    </>
  )
}
