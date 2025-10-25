import React, { useState, useEffect } from 'react'

const Preloader = ({ onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  // Multilingual words for the preloader
  const words = [
    { text: "Loading", language: "English" },
    { text: "Cargando", language: "Spanish" },
    { text: "Chargement", language: "French" },
    { text: "Laden", language: "German" },
    { text: "Caricamento", language: "Italian" },
    { text: "Загрузка", language: "Russian" },
    { text: "読み込み中", language: "Japanese" },
    { text: "加载中", language: "Chinese" },
    { text: "로딩 중", language: "Korean" },
    { text: "تحميل", language: "Arabic" },
    { text: "Carregando", language: "Portuguese" },
    { text: "Yükleniyor", language: "Turkish" },
    { text: "Laddar", language: "Swedish" },
    { text: "Laster", language: "Norwegian" },
    { text: "Indlæser", language: "Danish" },
    { text: "Ladataan", language: "Finnish" },
    { text: "Betöltés", language: "Hungarian" },
    { text: "Načítání", language: "Czech" },
    { text: "Ładowanie", language: "Polish" },
    { text: "Φόρτωση", language: "Greek" }
  ]

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 200)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(wordInterval)
          setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => {
              onComplete()
            }, 500)
          }, 300)
          return 100
        }
        return prev + Math.random() * 3 + 1
      })
    }, 50)

    return () => {
      clearInterval(wordInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete, words.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Animated Background Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 animate-pulse"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Profile Image with Blur Effect */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-spin-slow blur-sm"></div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse"></div>
        </div>

        {/* Animated Text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 animate-fade-in">
            Subham Karmakar
          </h1>
          <div className="h-12 flex items-center justify-center">
            <div className="relative">
              <span 
                key={currentWordIndex}
                className="text-2xl font-semibold text-blue-600 dark:text-blue-400 animate-word-change"
              >
                {words[currentWordIndex].text}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({words[currentWordIndex].language})
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Blur Overlay */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
    </div>
  )
}

export default Preloader
