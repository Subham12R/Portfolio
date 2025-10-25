import React, { useState, useEffect } from 'react'

const Preloader = ({ onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Multilingual "Hello" words
  const helloWords = [
    "Hello", // English
    "Hola", // Spanish
    "Bonjour", // French
    "Hallo", // German
    "Ciao", // Italian
    "Привет", // Russian
    "こんにちは", // Japanese
    "你好", // Chinese
    "안녕하세요", // Korean
    "مرحبا", // Arabic
    "Olá", // Portuguese
    "Merhaba", // Turkish
    "Hej", // Swedish
    "Hei", // Norwegian
    "Hej", // Danish
    "Hei", // Finnish
    "Helló", // Hungarian
    "Ahoj", // Czech
    "Cześć", // Polish
    "Γεια", // Greek
    "Namaste", // Hindi
    "Salam", // Persian
    "Shalom", // Hebrew
    "Kumusta", // Filipino
    "Sawubona", // Zulu
    "Kamusta", // Indonesian
    "Xin chào", // Vietnamese
    "สวัสดี", // Thai
    "Selamat", // Malay
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
