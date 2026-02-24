'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface BlizzardFlake {
  id: number
  x: number
  y: number
  size: number
  speed: number
  delay: number
  opacity: number
}

interface NeonStripe {
  id: number
  x: number
  width: number
  rotation: number
  color: string
  opacity: number
}

export default function BlizzardOverlay() {
  const [flakes, setFlakes] = useState<BlizzardFlake[]>([])
  const [stripes, setStripes] = useState<NeonStripe[]>([])

  useEffect(() => {
    // Create blizzard flakes
    const blizzardFlakes: BlizzardFlake[] = []
    const numFlakes = 60

    for (let i = 0; i < numFlakes; i++) {
      blizzardFlakes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        speed: 8 + Math.random() * 15,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4,
      })
    }

    // Create neon stripes
    const neonStripes: NeonStripe[] = []
    const numStripes = 8
    const neonColors = [
      '#00ffff', // cyan
      '#ff00ff', // magenta  
      '#00ff00', // lime
      '#ffff00', // yellow
      '#ff0080', // hot pink
      '#8000ff', // electric purple
    ]

    for (let i = 0; i < numStripes; i++) {
      neonStripes.push({
        id: i,
        x: Math.random() * 120 - 10, // can go off screen
        width: 1 + Math.random() * 3,
        rotation: -45 + Math.random() * 90,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        opacity: 0.1 + Math.random() * 0.2,
      })
    }

    setFlakes(blizzardFlakes)
    setStripes(neonStripes)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Neon Stripes */}
      {stripes.map((stripe) => (
        <motion.div
          key={`stripe-${stripe.id}`}
          className="absolute h-full"
          style={{
            left: `${stripe.x}%`,
            width: `${stripe.width}px`,
            background: `linear-gradient(${stripe.rotation}deg, transparent, ${stripe.color}, transparent)`,
            opacity: stripe.opacity,
            transform: `rotate(${stripe.rotation}deg)`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: ['-20vw', '120vw'],
            opacity: [0, stripe.opacity, stripe.opacity, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}

      {/* Blizzard Flakes */}
      {flakes.map((flake) => (
        <motion.div
          key={`flake-${flake.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, -20 + Math.random() * 40], // slight horizontal drift
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.speed,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Additional Neon Glow Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%)',
            filter: 'blur(35px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>
    </div>
  )
}
