import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Download, User, LogOut } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/shared/utils'
import { useAuth } from '@/components/auth/AuthHook'
import ProfileIcon from '@/components/ProfileIcon'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  // Ensure component is mounted before using browser APIs
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    // Set initial scroll state
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const toggleMobileMenu = () => setIsOpen(!isOpen)
  
  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-secondary-950/95 backdrop-blur-md border-b border-secondary-800'
            : 'bg-transparent'
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-200">
                <img 
                  src="/images/latest/Gemini_Generated_Image_zetolbzetolbzeto.png" 
                  alt="equator Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gradient">
                equator
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {siteConfig.navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link 
                        href={item.href}
                        className="nav-link flex items-center space-x-1"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Link>
                      
                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-secondary-900/95 backdrop-blur-md border border-secondary-700 rounded-lg shadow-xl"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                              >
                                <div className="font-medium">{child.name}</div>
                                <div className="text-xs text-secondary-400 mt-1">
                                  {child.description}
                                </div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'nav-link',
                        pathname === item.href && 'active'
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isLoading && user ? (
                // User is logged in - show profile icon with dropdown
                <ProfileIcon 
                  user={user}
                  onDropdownChange={(isOpen) => setOpenDropdown(isOpen ? 'profile' : null)}
                />
              ) : (
                // User is not logged in - show login/download buttons
                <>
                  <Link href="/auth/login" className="btn-ghost">
                    Sign In
                  </Link>
                  <Link href="/products" className="btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-secondary-300 hover:text-white transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 lg:top-20 left-0 right-0 z-40 lg:hidden bg-secondary-950/98 backdrop-blur-md border-b border-secondary-800"
          >
            <div className="container-custom py-6">
              <div className="space-y-4">
                {siteConfig.navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => handleDropdownToggle(item.name)}
                          className="flex items-center justify-between w-full py-2 text-secondary-300 hover:text-white transition-colors duration-200"
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 transition-transform duration-200',
                              openDropdown === item.name && 'rotate-180'
                            )}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {openDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className="block py-2 text-sm text-secondary-400 hover:text-white transition-colors duration-200"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          'block py-2 text-secondary-300 hover:text-white transition-colors duration-200',
                          pathname === item.href && 'text-primary-400'
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-secondary-800 space-y-3">
                  {!isLoading && user ? (
                    // Mobile - User is logged in
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-secondary-800/50 rounded-lg">
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-full border-2 border-green-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{user.name || 'User'}</p>
                          <p className="text-xs text-secondary-300">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/profile" className="btn-ghost w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link href="/products" className="btn-ghost w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Downloads
                      </Link>
                      <button onClick={logout} className="btn-secondary w-full text-red-400 hover:text-red-300">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    // Mobile - User not logged in
                    <>
                      <Link href="/auth/login" className="btn-ghost w-full">
                        Sign In
                      </Link>
                      <Link href="/products" className="btn-primary w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
