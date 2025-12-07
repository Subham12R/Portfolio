import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import profileImg from '../../assets/profile.png'

const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    // Fade out after 2 seconds
    const timer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => setIsVisible(false)
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-white dark:bg-black backdrop-blur-md transition-colors duration-300 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="relative flex justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
          <img
            src={profileImg}
            alt="Profile"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Preloader
