import React, { useState, useEffect } from 'react'


const Weather = () => {
  const [temperature, setTemperature] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
        )
        const data = await response.json()
        if (data.current && data.current.temperature_2m !== undefined) {
          setTemperature(Math.round(data.current.temperature_2m))
        }
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch weather')
        setLoading(false)
      }
    }

    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          // Fallback to IP-based location or default
          setError('Location denied')
          setLoading(false)
        },
        { timeout: 10000, maximumAge: 300000 } // Cache for 5 minutes
      )
    }

    getLocation()
  }, [])

  if (loading) {
    return (
      <div className="flex items-right gap-1 text-xs text-gray-500 dark:text-zinc-500 animate-pulse">
        
        <span>°C</span>
      </div>
    )
  }

  if (error || temperature === null) {
    return null // Hide if there's an error or no data
  }

  return (
    <div className="flex items-center gap-0.5 text-lg font-bold text-zinc-900 dark:text-gray-200   p-2 rounded-full ">
      <span>{temperature}°C</span>
    </div>
  )
}

export default Weather
