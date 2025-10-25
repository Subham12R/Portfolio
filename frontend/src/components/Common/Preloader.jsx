import React, { useState, useEffect } from 'react'

const Preloader = ({ onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Multilingual "Hello" words
  const helloWords = [
    "Hola", // Spanish
    "Hello", // English
    "Bonjour", // French
    "Hallo", // German
    "Ciao", // Italian
    "你好", // Chinese
    "مرحبا", // Arabic
    "নমস্কার", // Bengali
    "नमस्ते", // Hindi
    "Salam", // Persian
    "Shalom", // Hebrew
    "Kamusta", // Indonesian
  ]

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % helloWords.length)
    }, 300)

    // Auto-complete after 4 seconds
    const timer = setTimeout(() => {
      clearInterval(wordInterval)
      setIsVisible(false)
      setTimeout(() => {
        onComplete()
      }, 500)
    }, 4000)

    return () => {
      clearInterval(wordInterval)
      clearTimeout(timer)
    }
  }, [onComplete, helloWords.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 
          key={currentWordIndex}
          className="text-6xl font-bold text-gray-900 animate-word-change"
        >
          {helloWords[currentWordIndex]}
        </h1>
      </div>
    </div>
  )
}

export default Preloader
