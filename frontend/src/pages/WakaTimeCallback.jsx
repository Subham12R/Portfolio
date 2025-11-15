import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiService from '../services/api'

const WakaTimeCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`Authorization failed: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received. Please try authorizing again.')
        return
      }

      try {
        // Exchange code for access token
        const response = await apiService.exchangeWakaTimeCode(code)
        
        if (response.success) {
          setStatus('success')
          setMessage('WakaTime authorization successful! You can now close this window.')
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(response.message || 'Failed to exchange authorization code')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'An error occurred during authorization')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-8 shadow-lg">
        {status === 'processing' && (
          <>
            <div className="text-center mb-6">
              <div className="text-blue-500 text-5xl mb-4 animate-spin">⏳</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authorizing WakaTime...
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we complete the authorization
              </p>
            </div>
          </>
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
                Authorization Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                Your WakaTime integration is now active. You will be redirected to the home page shortly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WakaTimeCallback

