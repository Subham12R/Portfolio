import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

// Import sprite assets
import down1 from '../../assets/neko/down1.png'
import down2 from '../../assets/neko/down2.png'
import up1 from '../../assets/neko/up1.png'
import up2 from '../../assets/neko/up2.png'
import left1 from '../../assets/neko/left1.png'
import left2 from '../../assets/neko/left2.png'
import right1 from '../../assets/neko/right1.png'
import right2 from '../../assets/neko/right2.png'
import upleft1 from '../../assets/neko/upleft1.png'
import upleft2 from '../../assets/neko/upleft2.png'
import upright1 from '../../assets/neko/upright1.png'
import upright2 from '../../assets/neko/upright2.png'
import downleft1 from '../../assets/neko/downleft1.png'
import downleft2 from '../../assets/neko/downleft2.png'
import downright1 from '../../assets/neko/downright1.png'
import downright2 from '../../assets/neko/downright2.png'
import sleep1 from '../../assets/neko/sleep1.png'
import sleep2 from '../../assets/neko/sleep2.png'
import awake from '../../assets/neko/awake.png'
import yawn1 from '../../assets/neko/yawn1.png'
import yawn2 from '../../assets/neko/yawn2.png'
import wash1 from '../../assets/neko/wash1.png'
import wash2 from '../../assets/neko/wash2.png'
import scratch1 from '../../assets/neko/scratch1.png'
import scratch2 from '../../assets/neko/scratch2.png'

const Neko = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [waiting, setWaiting] = useState(false)
  const [state, setState] = useState(0) // 0-3: awake, 4-6: scratch, 7-9: wash, 10-12: yawn, 13+: sleep
  const [count, setCount] = useState(0)
  const [min, setMin] = useState(8)
  const [max, setMax] = useState(16)
  const [sprite, setSprite] = useState('down')
  
  const speed = 1
  const scale = 1.0
  const width = 32
  const height = 32
  
  const animationFrameRef = useRef(null)
  const positionRef = useRef(position)
  const mousePosRef = useRef(mousePos)
  const lastClickTimeRef = useRef(0)
  const { theme } = useTheme()

  // Keep refs in sync with state
  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    mousePosRef.current = mousePos
  }, [mousePos])

  // Get sprite name based on state (idle states)
  const getSpriteName = () => {
    if (state >= 13) {
      return 'sleep'
    } else if (state >= 10) {
      return 'yawn'
    } else if (state >= 7) {
      return 'wash'
    } else if (state >= 4) {
      return 'scratch'
    } else if (state >= 0) {
      return 'awake'
    }
    return sprite
  }

  // Get sprite image
  const getSpriteImage = () => {
    // Check if we should use idle sprites (waiting or close to cursor)
    const distance = Math.abs(mousePosRef.current.x - positionRef.current.x) + 
                     Math.abs(mousePosRef.current.y - positionRef.current.y)
    const isIdle = distance < width || waiting
    
    let spriteName
    if (isIdle) {
      spriteName = getSpriteName()
    } else {
      // When chasing, use the movement sprite
      spriteName = sprite
    }
    
    // For awake sprite, use the static awake image
    if (spriteName === 'awake') {
      return awake
    }
    
    // For other sprites, use frame 1 or 2 based on count
    const frame = count < min ? 1 : 2
    
    const spriteMap = {
      sleep: frame === 1 ? sleep1 : sleep2,
      yawn: frame === 1 ? yawn1 : yawn2,
      wash: frame === 1 ? wash1 : wash2,
      scratch: frame === 1 ? scratch1 : scratch2,
      down: frame === 1 ? down1 : down2,
      up: frame === 1 ? up1 : up2,
      left: frame === 1 ? left1 : left2,
      right: frame === 1 ? right1 : right2,
      upleft: frame === 1 ? upleft1 : upleft2,
      upright: frame === 1 ? upright1 : upright2,
      downleft: frame === 1 ? downleft1 : downleft2,
      downright: frame === 1 ? downright1 : downright2,
    }
    
    return spriteMap[spriteName] || down1
  }

  // Calculate direction based on angle (matching Go code logic)
  const calculateDirection = (x, y) => {
    const r = Math.atan2(y, x)
    let a = ((r / Math.PI * 180) + 360) % 360 // Normalize angle to [0, 360)
    
    if (a <= 292.5 && a > 247.5) { // up
      return 'up'
    } else if (a <= 337.5 && a > 292.5) { // up right
      return 'upright'
    } else if (a <= 22.5 || a > 337.5) { // right
      return 'right'
    } else if (a <= 67.5 && a > 22.5) { // down right
      return 'downright'
    } else if (a <= 112.5 && a > 67.5) { // down
      return 'down'
    } else if (a <= 157.5 && a > 112.5) { // down left
      return 'downleft'
    } else if (a <= 202.5 && a > 157.5) { // left
      return 'left'
    } else if (a <= 247.5 && a > 202.5) { // up left
      return 'upleft'
    }
    return 'down'
  }

  // Main update loop (matching Go code Update function)
  useEffect(() => {
    const update = () => {
      setCount(prev => prev + 1)
      
      const mx = mousePosRef.current.x
      const my = mousePosRef.current.y
      const catX = positionRef.current.x
      const catY = positionRef.current.y
      
      // Calculate relative position from cat to mouse (matching Go code)
      const x = mx - catX
      const y = my - catY
      
      const dy = Math.abs(y)
      const dx = Math.abs(x)
      const distance = dx + dy
      
      // If distance < width OR waiting, stay idle
      if (distance < width || waiting) {
        // Stay idle logic - update state first if needed (matching Go code)
        setState(prev => {
          if (prev === 0) return 1
          return prev
        })
        
        animationFrameRef.current = requestAnimationFrame(update)
        return
      }
      
      // Otherwise catch cursor
      setState(0)
      setMin(8)
      setMax(16)
      
      const direction = calculateDirection(x, y)
      setSprite(direction)
      
      // Move based on direction
      setPosition(prev => {
        let newX = prev.x
        let newY = prev.y
        
        switch (direction) {
          case 'up':
            newY -= speed
            break
          case 'upright':
            newX += speed / Math.SQRT2
            newY -= speed / Math.SQRT2
            break
          case 'right':
            newX += speed
            break
          case 'downright':
            newX += speed / Math.SQRT2
            newY += speed / Math.SQRT2
            break
          case 'down':
            newY += speed
            break
          case 'downleft':
            newX -= speed / Math.SQRT2
            newY += speed / Math.SQRT2
            break
          case 'left':
            newX -= speed
            break
          case 'upleft':
            newX -= speed
            newY -= speed
            break
        }
        
        // Keep within bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth))
        newY = Math.max(0, Math.min(newY, window.innerHeight))
        
        return { x: newX, y: newY }
      })
      
      animationFrameRef.current = requestAnimationFrame(update)
    }
    
    animationFrameRef.current = requestAnimationFrame(update)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [waiting])

  // Handle state progression and sprite updates (matching Go code Draw function)
  useEffect(() => {
    if (count > max) {
      setCount(0)
      
      if (state > 0) {
        setState(prev => {
          const newState = prev + 1
          // Play sleep sound at state 13 (we can't play sounds, but we track it)
          return newState
        })
      }
    }
  }, [count, max, state])

  // Update sprite based on state (matching Go code stayIdle function)
  useEffect(() => {
    // Only update sprite when idle (waiting or close to cursor)
    const distance = Math.abs(mousePosRef.current.x - positionRef.current.x) + 
                     Math.abs(mousePosRef.current.y - positionRef.current.y)
    
    if (distance < width || waiting) {
      if (state >= 0 && state <= 3) {
        setSprite('awake')
      } else if (state >= 4 && state <= 6) {
        setSprite('scratch')
      } else if (state >= 7 && state <= 9) {
        setSprite('wash')
      } else if (state >= 10 && state <= 12) {
        setMin(32)
        setMax(64)
        setSprite('yawn')
      } else {
        setSprite('sleep')
      }
    }
  }, [state, waiting])

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Handle double-click on cat to toggle waiting
  const handleCatClick = () => {
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTimeRef.current
    
    if (timeSinceLastClick < 300) { // Double-click detected (within 300ms)
      setWaiting(prev => {
        if (!prev) {
          // Reset state when starting to wait
          setState(0)
        }
        return !prev
      })
    }
    
    lastClickTimeRef.current = now
  }

  // Initialize position
  useEffect(() => {
    const initialPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    setPosition(initialPos)
    setMousePos(initialPos)
    positionRef.current = initialPos
    mousePosRef.current = initialPos
  }, [])

  const currentSprite = getSpriteImage()
  const isSleeping = state >= 13

  return (
    <>
      <div
        className="fixed z-50 cursor-pointer"
        onClick={handleCatClick}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          width: `${width * scale}px`,
          height: `${height * scale}px`,
          imageRendering: 'pixelated',
        }}
      >
        <img
          src={currentSprite}
          alt="Neko cat"
          className="w-full h-full pointer-events-none"
          style={{
            imageRendering: 'pixelated',
            filter: theme === 'dark' ? 'invert(1)' : 'none',
          }}
        />
      </div>
      
      {/* Sleep "z" indicator */}
      {isSleeping && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y - (height * scale * 0.3)}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span
            className="text-2xl font-bold text-gray-700 dark:text-gray-300 select-none inline-block neko-sleep-z"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.3)',
              fontSize: `${12 * scale}px`,
            }}
          >
            z
          </span>
          <span
            className="text-2xl font-bold text-gray-700 dark:text-gray-300 select-none inline-block neko-sleep-z"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.3)',
              fontSize: `${16 * scale}px`,
            }}
          >
            z
          </span>
          <span
            className="text-2xl font-bold text-gray-700 dark:text-gray-300 select-none inline-block neko-sleep-z"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.3)',
              fontSize: `${10 * scale}px`,
            }}
          >
            z
          </span>
          <style>{`
            .neko-sleep-z {
              animation: nekoBreathe 1.5s ease-in-out infinite;
            }
            @keyframes nekoBreathe {
              0%, 100% {
                opacity: 0.6;
                transform: translateY(0) scale(1);
              }
              50% {
                opacity: 1;
                transform: translateY(-4px) scale(1.1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default Neko
