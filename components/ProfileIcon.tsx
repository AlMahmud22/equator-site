import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, User, LogOut, Download, Settings, Shield, Plus, FolderPlus } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/shared/utils'

interface ProfileIconProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  className?: string
  onDropdownChange?: (isOpen: boolean) => void
}

export default function ProfileIcon({ user, className, onDropdownChange }: ProfileIconProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const userName = user.name || 'User'
  const userEmail = user.email || ''
  const userImage = user.image

  // Generate initials from name
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  const handleDropdownToggle = () => {
    const newState = !isDropdownOpen
    setIsDropdownOpen(newState)
    onDropdownChange?.(newState)
  }

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false)
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
    onDropdownChange?.(false)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleDropdownToggle}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-800/50 transition-all duration-200 group"
        aria-label="User menu"
      >
        {/* Avatar or Initials */}
        <div className="relative">
          {userImage ? (
            <img 
              src={userImage} 
              alt={userName}
              className="w-8 h-8 rounded-full border-2 border-green-500/30 group-hover:border-green-500/50 transition-colors duration-200"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none'
                const initialsDiv = e.currentTarget.nextElementSibling as HTMLElement
                if (initialsDiv) {
                  initialsDiv.style.display = 'flex'
                }
              }}
            />
          ) : null}
          
          <div 
            className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold text-sm border-2 border-green-500/30 group-hover:border-green-500/50 transition-colors duration-200",
              userImage ? "hidden" : "flex"
            )}
          >
            {getInitials(userName)}
          </div>
          
          {/* Online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-secondary-900 rounded-full"></div>
        </div>
        
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-secondary-300 transition-transform duration-200",
            isDropdownOpen && "rotate-180"
          )} 
        />
      </button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 lg:hidden"
              onClick={closeDropdown}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-secondary-900/95 backdrop-blur-md rounded-xl border border-secondary-700/50 shadow-xl z-50"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-secondary-700/30">
                <div className="flex items-center space-x-3">
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={userName}
                      className="w-10 h-10 rounded-full border-2 border-green-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold">
                      {getInitials(userName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{userName}</p>
                    <p className="text-sm text-secondary-300 truncate">{userEmail}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800/50 transition-colors duration-200"
                  onClick={closeDropdown}
                >
                  <User className="w-4 h-4 mr-3" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/projects"
                  className="flex items-center px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800/50 transition-colors duration-200"
                  onClick={closeDropdown}
                >
                  <FolderPlus className="w-4 h-4 mr-3" />
                  <span>Projects</span>
                </Link>
                
                <Link
                  href="/create-project"
                  className="flex items-center px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800/50 transition-colors duration-200"
                  onClick={closeDropdown}
                >
                  <Plus className="w-4 h-4 mr-3" />
                  <span>Add Project</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800/50 transition-colors duration-200"
                  onClick={closeDropdown}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  <span>Settings</span>
                </Link>
                
                {/* Admin Link - only for admin users */}
                {user?.email === 'mahmud23k@gmail.com' && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-3 text-sm text-primary-400 hover:text-primary-300 hover:bg-secondary-800/50 transition-colors duration-200"
                    onClick={closeDropdown}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                
                <Link
                  href="/products"
                  className="flex items-center px-4 py-3 text-sm text-secondary-300 hover:text-white hover:bg-secondary-800/50 transition-colors duration-200"
                  onClick={closeDropdown}
                >
                  <Download className="w-4 h-4 mr-3" />
                  <span>Downloads</span>
                </Link>
                
                <div className="border-t border-secondary-700/30 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-secondary-800/50 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
