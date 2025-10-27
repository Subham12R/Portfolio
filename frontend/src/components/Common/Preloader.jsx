import React, { useState, useEffect } from 'react'
import profileImg from '../../assets/profile.png'

const Preloader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete()
      }, 500)
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="relative">
        {/* Ring loader */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
        {/* Profile image */}
        <img 
          src={profileImg} 
          alt="Profile" 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover"
        />
      </div>
    </div>
  )
}

export default Preloader
