import React, { createContext, useContext, useState, useEffect } from 'react'

const PreloaderContext = createContext()

export const usePreloader = () => {
  const context = useContext(PreloaderContext)
  if (!context) {
    throw new Error('usePreloader must be used within a PreloaderProvider')
  }
  return context
}

export const PreloaderProvider = ({ children }) => {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)

  useEffect(() => {
    // Preloader completes after 2 seconds (matching the preloader duration)
    const timer = setTimeout(() => {
      setIsPreloaderComplete(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <PreloaderContext.Provider value={{ isPreloaderComplete }}>
      {children}
    </PreloaderContext.Provider>
  )
}

