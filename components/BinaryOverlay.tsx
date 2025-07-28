'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface BinaryChar {
  id: number
  char: string
  x: number
  y: number
  speed: number
  delay: number
}

export default function BinaryOverlay() {
  const [binaryChars, setBinaryChars] = useState<BinaryChar[]>([])

  useEffect(() => {
    const chars: BinaryChar[] = []
    const numChars = 50 // Adjust for density

    for (let i = 0; i < numChars; i++) {
      chars.push({
        id: i,
        char: Math.random() > 0.5 ? '1' : '0',
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // starting position
        speed: 10 + Math.random() * 20, // animation duration in seconds
        delay: Math.random() * 5, // delay before starting
      })
    }

    setBinaryChars(chars)
  }, [])

  return (
    <div className="binary-overlay">
      {binaryChars.map((char) => (
        <motion.div
          key={char.id}
          className="binary-char"
          style={{
            left: `${char.x}%`,
            animationDuration: `${char.speed}s`,
            animationDelay: `${char.delay}s`,
          } as React.CSSProperties}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: [0, window?.innerHeight || 800],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: char.speed,
            delay: char.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {char.char}
        </motion.div>
      ))}
    </div>
  )
}
