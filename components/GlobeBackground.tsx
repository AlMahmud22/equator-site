import { useEffect, useRef } from 'react'

export default function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Globe parameters
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.3
    
    // Particle system for cyberpunk effect
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      life: number
      maxLife: number
    }> = []

    // Create initial particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: (Math.random() - 0.5) * 1000,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: Math.random() * 100,
        maxLife: 100
      })
    }

    let time = 0

    const animate = () => {
      time += 0.01

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw wireframe globe
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 1

      // Longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        for (let j = 0; j <= 50; j++) {
          const lat = (j / 50 - 0.5) * Math.PI
          const x = centerX + Math.cos(lat) * Math.cos(angle + time * 0.2) * radius
          const y = centerY + Math.sin(lat) * radius
          const z = Math.cos(lat) * Math.sin(angle + time * 0.2) * radius
          
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Latitude lines
      for (let i = 0; i < 8; i++) {
        const lat = (i / 8 - 0.5) * Math.PI * 0.8
        ctx.beginPath()
        for (let j = 0; j <= 50; j++) {
          const lon = (j / 50) * Math.PI * 2
          const x = centerX + Math.cos(lat) * Math.cos(lon + time * 0.2) * radius
          const y = centerY + Math.sin(lat) * radius
          const z = Math.cos(lat) * Math.sin(lon + time * 0.2) * radius
          
          if (z > 0) {
            if (j === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz
        particle.life -= 1

        // Wrap around screen
        if (particle.x > canvas.width / 2) particle.x = -canvas.width / 2
        if (particle.x < -canvas.width / 2) particle.x = canvas.width / 2
        if (particle.y > canvas.height / 2) particle.y = -canvas.height / 2
        if (particle.y < -canvas.height / 2) particle.y = canvas.height / 2

        // Reset particle if dead
        if (particle.life <= 0) {
          particle.x = (Math.random() - 0.5) * canvas.width
          particle.y = (Math.random() - 0.5) * canvas.height
          particle.z = (Math.random() - 0.5) * 1000
          particle.life = particle.maxLife
        }

        // Calculate screen position
        const screenX = centerX + particle.x
        const screenY = centerY + particle.y
        const alpha = Math.max(0, particle.life / particle.maxLife) * 0.6

        // Draw particle with blue cyberpunk glow
        const size = particle.size * (1 + Math.sin(time * 3 + index * 0.1) * 0.2)
        
        // Outer glow
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size * 3)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.8})`)
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.4})`)
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(screenX, screenY, size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Inner core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(screenX, screenY, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw central glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)
      glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
      glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)')
      glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Add scanning lines effect
      const scanLineY = centerY + Math.sin(time * 2) * radius
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX - radius, scanLineY)
      ctx.lineTo(centerX + radius, scanLineY)
      ctx.stroke()

      // Add pulsing ring
      const ringRadius = radius + Math.sin(time * 1.5) * 20
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(time * 2) * 0.2})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    />
  )
}
