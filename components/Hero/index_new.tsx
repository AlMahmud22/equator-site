import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Download, Play, Star, Skull, Zap, Shield, Target, Eye } from 'lucide-react'
import { useScrollReveal, useParallax } from '@/hooks/useAnimations'
import BinaryOverlay from '@/components/BinaryOverlay'

const stats = [
  { label: 'Active Users', value: '100K+' },
  { label: 'Downloads', value: '500K+' },
  { label: 'Countries', value: '50+' },
  { label: 'Rating', value: '4.8★' },
]

const floatingElements = [
  { icon: Skull, delay: 0, x: '10%', y: '20%' },
  { icon: Shield, delay: 0.5, x: '80%', y: '15%' },
  { icon: Eye, delay: 1, x: '15%', y: '70%' },
  { icon: Zap, delay: 1.5, x: '85%', y: '75%' },
  { icon: Target, delay: 2, x: '50%', y: '10%' },
  { icon: Shield, delay: 2.2, x: '70%', y: '30%' },
  { icon: Skull, delay: 2.5, x: '25%', y: '50%' },
  { icon: Target, delay: 2.8, x: '90%', y: '60%' },
  { icon: Eye, delay: 3.1, x: '5%', y: '85%' },
  { icon: Zap, delay: 3.3, x: '60%', y: '65%' },
]

export default function Hero() {
  const heroRef = useScrollReveal()
  const backgroundRef = useParallax(0.3)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-pitch-black">
      {/* Binary Code Overlay */}
      <BinaryOverlay />

      {/* Background Gradient */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black z-10" />
      </div>

      {/* Floating Icons */}
      {floatingElements.map((element, index) => {
        const IconComponent = element.icon
        return (
          <motion.div
            key={index}
            className="absolute floating-icon pointer-events-none z-20 neon-glow"
            style={{
              left: element.x,
              top: element.y,
            } as React.CSSProperties}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              delay: element.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <IconComponent size={32} />
          </motion.div>
        )
      })}

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
            className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-medium mb-16 mt-16"
          >
            <Star className="w-4 h-4 mr-2 fill-current" />
            Privacy-focused AI trusted by 100K+ users
          </motion.div>

          {/* Main Heading with 3D effect */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-8 heading-3d"
          >
            <span className="text-white">Privacy-Focused</span>{' '}
            <span className="text-gradient">Decentralized</span>
            <br />
            <span className="text-white">Secure</span>{' '}
            <span className="text-gradient">Desktop Suite</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience true sovereignty with our decentralized suite: privacy-first Chatbot, 
            secure AI Playground, freedom-focused Browser and a lot more. Built for users who value data 
            control, open architecture, and digital independence.
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
              Secure Download
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
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto mb-16"
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
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center mb-3"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
              />
            </motion.div>
            <p className="text-xs text-gray-500 text-center whitespace-nowrap">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
