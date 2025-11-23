import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import profileImg from '../../assets/profile.png'

const Preloader = ({ onComplete, showMessage = false }) => {
  const [isVisible, setIsVisible] = useState(true)

  const containerRef = useRef(null)


  useEffect(() => {
    // Animate progress from 0 to 100

    // Auto-complete after 3 seconds only if onComplete is provided
    if (!onComplete) return

    const timer = setTimeout(() => {
      // Simple fade out animation
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: 'power2.inOut',
        onComplete: () => {
          setIsVisible(false)
          onComplete()
        }
      })
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-white dark:bg-black backdrop-blur-md transition-colors duration-300">
      {/* Content layer - centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
            {/* Profile image */}
            <img 
              src={profileImg} 
              alt="Profile" 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover"
            />
          </div>
          
          {/* Progress counter */}

        </div>
        
        {/* Message - positioned at bottom with fade in animation */}
        {showMessage && (
          <div className="absolute bottom-12 left-0 right-0 flex justify-center px-4 animate-fadeIn">
            <p className="text-gray-400 dark:text-gray-600 text-xs font-light tracking-wide opacity-50">
              Grab a coffee and get ready to explore.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Preloader
