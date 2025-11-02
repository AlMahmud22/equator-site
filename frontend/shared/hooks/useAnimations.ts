import { useEffect, useRef } from 'react'
import { throttle } from '@/shared/utils'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: UseScrollRevealOptions = {}) {
  const elementRef = useRef<T>(null)
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            if (triggerOnce) {
              observer.unobserve(entry.target)
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('revealed')
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    // Add initial animation class
    element.classList.add('animate-on-scroll')
    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return elementRef
}

/**
 * Hook for scroll position tracking
 */
export function useScrollPosition() {
  const scrollY = useRef(0)
  const scrollDirection = useRef<'up' | 'down'>('down')

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY
      scrollDirection.current = currentScrollY > scrollY.current ? 'down' : 'up'
      scrollY.current = currentScrollY
    }, 16) // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollY: scrollY.current, scrollDirection: scrollDirection.current }
}

/**
 * Hook for parallax scrolling effects
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed: number = 0.5) {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || typeof window === 'undefined') return

    const handleScroll = throttle(() => {
      const scrolled = window.scrollY
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + scrolled
      const elementHeight = rect.height
      const windowHeight = window.innerHeight

      // Check if element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const yPos = -(scrolled - elementTop) * speed
        element.style.transform = `translateY(${yPos}px)`
      }
    }, 16)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return elementRef
}

/**
 * Hook for mouse parallax effects
 */
export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(intensity: number = 0.1) {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = throttle((e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * intensity
      const deltaY = (e.clientY - centerY) * intensity
      
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    }, 16)

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0px, 0px)'
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])

  return elementRef
}
