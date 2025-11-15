import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const WakaTimeCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code') || searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`Authorization failed: ${error}`)
        setTimeout(() => navigate('/'), 5000)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received.')
        setTimeout(() => navigate('/'), 5000)
        return
      }

      try {
        const response = await apiService.exchangeWakaTimeCode(code)
        
        if (response.success) {
          setStatus('success')
          // Show tokens in console and provide instructions
          if (response.tokens) {
            console.log('📝 Add these to your backend/.env file:')
            console.log(`WAKATIME_ACCESS_TOKEN=${response.tokens.access_token}`)
            console.log(`WAKATIME_REFRESH_TOKEN=${response.tokens.refresh_token}`)
            console.log(`WAKATIME_TOKEN_EXPIRES_AT=${response.tokens.expires_at}`)
          }
          setMessage('✅ WakaTime connected! Real-time data fetching is now active.')
          // Redirect after showing message
          setTimeout(() => navigate('/'), 3000)
        } else {
          setStatus('error')
          setMessage(response.message || 'Failed to connect')
          setTimeout(() => navigate('/'), 5000)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Connection failed')
        setTimeout(() => navigate('/'), 5000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-8 shadow-lg">
        {status === 'processing' && (
          <div className="text-center mb-6">
            <div className="text-blue-500 text-5xl mb-4 animate-spin">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connecting WakaTime...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up real-time data fetching
            </p>
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="text-center mb-6">
              <div className="text-red-500 text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authorization Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Please try again or check your WakaTime app settings.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Go to Home
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-center mb-6">
              <div className="text-green-500 text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connected!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-semibold">
                📝 Add these to your backend/.env file for persistence:
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-mono bg-white dark:bg-zinc-900 p-2 rounded border border-blue-300 dark:border-blue-700 break-all">
                Check browser console for tokens
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Real-time data fetching is active. Redirecting to home page...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WakaTimeCallback

