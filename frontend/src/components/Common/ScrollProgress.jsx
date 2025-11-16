import React, { useState, useEffect, useRef, useCallback } from 'react'

// Main sections with their IDs
const sections = [
  { name: 'Home', id: 'home' },
  { name: 'Experience', id: 'experience' },
  { name: 'Projects', id: 'projects' },
  { name: 'About', id: 'about' },
  { name: 'Certificates', id: 'certificates' },
  { name: 'Setup', id: 'setup' }
]

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [sectionPositions, setSectionPositions] = useState([])
  const [hoverPosition, setHoverPosition] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const trackRef = useRef(null)

  // Calculate section positions dynamically
  useEffect(() => {
    const calculatePositions = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const positions = sections.map(section => {
        const element = document.getElementById(section.id)
        if (element) {
          const offset = element.offsetTop - 100// Account for navbar
          const position = (offset / totalHeight) * 100
          return { ...section, position: Math.max(0, Math.min(100, position)) }
        }
        return null
      }).filter(Boolean)
      
      setSectionPositions(positions)
    }

    calculatePositions()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePositions)
    
    // Recalculate after content loads
    const timer = setTimeout(calculatePositions, 1000)
    
    return () => {
      window.removeEventListener('resize', calculatePositions)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!isDragging) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
        
        // Detect active section
        const scrollPosition = window.scrollY + window.innerHeight / 2
        for (let i = sections.length - 1; i >= 0; i--) {
          const element = document.getElementById(sections[i].id)
          if (element && element.offsetTop <= scrollPosition) {
            setActiveSection(sections[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDragging])

  const handleDragStart = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDrag = useCallback((e) => {
    if (!isDragging || !trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const y = e.clientY || e.touches?.[0]?.clientY
    
    if (!y) return

    const relativeY = y - rect.top
    const progress = Math.min(100, Math.max(0, (relativeY / rect.height) * 100))
    
    setScrollProgress(progress)
    
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPosition = (progress / 100) * totalHeight
    window.scrollTo({ top: scrollPosition, behavior: 'auto' })
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDrag)
      window.addEventListener('touchend', handleDragEnd)

      return () => {
        window.removeEventListener('mousemove', handleDrag)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDrag)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, handleDrag, handleDragEnd])

  // Generate many tick marks (like in the image)
  const tickCount = 30
  const ticks = Array.from({ length: tickCount }, (_, i) => i)

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:block">
      {/* Glassmorphism Container */}
      <div className="relative h-80 w-12 px-2 flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-zinc-900/30 rounded border border-white/20 dark:border-zinc-700/20 shadow-xl">
        {/* Track with tick marks */}
        <div 
          ref={trackRef}
          className="relative h-[90%] w-1 flex items-center justify-center"
          onClick={(e) => {
            const rect = trackRef.current.getBoundingClientRect()
            const relativeY = e.clientY - rect.top
            const progress = Math.min(100, Math.max(0, (relativeY / rect.height) * 100))
            
            setScrollProgress(progress)
            
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPosition = (progress / 100) * totalHeight
            window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
          }}
          onMouseMove={(e) => {
            const rect = trackRef.current.getBoundingClientRect()
            const relativeY = e.clientY - rect.top
            const position = Math.min(100, Math.max(0, (relativeY / rect.height) * 100))
            setHoverPosition(position)
          }}
          onMouseLeave={() => setHoverPosition(null)}
        >
          {/* Background line */}
          <div className="absolute inset-0 w-px mx-auto bg-gray-300/50 dark:bg-zinc-600/50" />
          
          {/* Small tick marks */}
          {ticks.map((index) => (
            <div
              key={`tick-${index}`}
              className="absolute left-0 w-1.5 h-px bg-gray-400/40 dark:bg-zinc-600/40"
              style={{ top: `${(index / (tickCount - 1)) * 100}%` }}
            />
          ))}

          {/* Hover indicator - light colored mark at mouse position */}
          {hoverPosition !== null && (
            <div
              className="absolute left-0 -translate-y-1/2 pointer-events-none z-5 transition-opacity duration-150"
              style={{ top: `${hoverPosition}%` }}
            >
              <div className="w-4 h-px bg-gray-400/60 dark:bg-zinc-400/60 shadow-sm" />
            </div>
          )}

          {/* Section indicators (larger marks) - dynamically positioned */}
          {sectionPositions.map((section, index) => {
            const isActive = activeSection === section.id
            return (
              <div
                key={`section-${index}`}
                className="absolute left-0 flex items-center group cursor-pointer z-10"
                style={{ top: `${section.position}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  const element = document.getElementById(section.id)
                  if (element) {
                    const offsetTop = element.offsetTop - 80 // Offset for navbar
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
                  }
                }}
              >
                {/* Tick mark for sections - darker when active */}
                <div className={`w-3 h-px transition-all duration-300 ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white' 
                    : 'bg-gray-600/70 dark:bg-zinc-400/70'
                }`} />
              
                {/* Section label - appears on hover with glassmorphism */}
                <div className={`absolute right-12 transition-all duration-300 whitespace-nowrap pointer-events-none transform ${
                  isActive 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2'
                }`}>
                  <span className={`text-xs font-medium backdrop-blur-lg px-3 py-1.5 rounded shadow-lg border transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gray-900/90 dark:bg-white/90 dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'text-gray-800 dark:text-white bg-white/80 dark:bg-zinc-800/80 border-white/50 dark:border-zinc-700/50'
                  }`}>
                    {section.name}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Draggable bar indicator with glow */}
          <div
            className={`absolute left-0 -translate-y-1/2 cursor-grab z-50 ${
              isDragging ? 'cursor-grabbing scale-110' : ''
            } ${isDragging ? 'transition-none' : 'transition-all duration-200 ease-out'}`}
            style={{ top: `${scrollProgress}%` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {/* Red bar indicator with glow effect */}
            <div className="relative z-50">
              <div className="w-4 h-1 bg-linear-to-r from-red-500 to-orange-500 rounded-md shadow-lg relative z-50" />
              {/* Glow effect */}
              <div className="absolute inset-0 w-4 h-1 bg-linear-to-r from-red-400 to-orange-400 rounded-md blur-sm opacity-75" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScrollProgress

