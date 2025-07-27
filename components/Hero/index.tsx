import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Play, Star } from 'lucide-react'
import { useScrollReveal, useParallax } from '@/hooks/useAnimations'

const stats = [
  { label: 'Active Users', value: '100K+' },
  { label: 'Downloads', value: '500K+' },
  { label: 'Countries', value: '50+' },
  { label: 'Rating', value: '4.8★' },
]

const floatingElements = [
  { icon: '🤖', delay: 0, x: '10%', y: '20%' },
  { icon: '🧪', delay: 0.5, x: '80%', y: '15%' },
  { icon: '🌐', delay: 1, x: '15%', y: '70%' },
  { icon: '⚡', delay: 1.5, x: '85%', y: '75%' },
  { icon: '🚀', delay: 2, x: '50%', y: '10%' },
]

export default function Hero() {
  const heroRef = useScrollReveal()
  const backgroundRef = useParallax(0.3)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  // Auto-play background video
  useEffect(() => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, which is expected in some browsers
        console.log('Auto-play prevented')
      })
    }
  }, [videoError])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-950/90 via-secondary-900/80 to-primary-950/90 z-10" />
        {!videoError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            poster="/images/hero-bg.jpg"
            onError={() => {
              setVideoError(true)
            }}
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        )}
        {/* Background image fallback */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${videoError ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)'
          }}
        />
      </div>

      {/* Floating Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-10 pointer-events-none z-20"
          style={{ left: element.x, top: element.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            delay: element.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {element.icon}
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-30 container-custom text-center">
        <motion.div
          ref={heroRef}
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-8"
          >
            <Star className="w-4 h-4 mr-2 fill-current" />
            Trusted by 100K+ users worldwide
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Powerful</span>{' '}
            <span className="text-gradient">Desktop Apps</span>
            <br />
            <span className="text-white">for the</span>{' '}
            <span className="text-gradient">Modern World</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl lg:text-2xl text-secondary-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Discover our suite of innovative desktop applications: AI-powered Chatbot, 
            advanced AI Playground, and privacy-focused Browser. Built for creators, 
            developers, and digital natives.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/products" className="btn-primary text-lg px-8 py-4 group">
              <Download className="w-5 h-5 mr-3 group-hover:animate-bounce" />
              Download Free
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <button className="btn-secondary text-lg px-8 py-4 group">
              <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-secondary-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-secondary-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-3 bg-primary-500 rounded-full mt-2"
          />
        </motion.div>
        <p className="text-xs text-secondary-500 mt-2 text-center">Scroll to explore</p>
      </motion.div>
    </section>
  )
}
