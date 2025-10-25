import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  useEffect(() => {
    // Log to console for easy copying
    if (code) {
      console.log('Spotify Auth Code:', code)
    }
  }, [code])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-8 shadow-lg">
        {error ? (
          <>
            <div className="text-center mb-6">
              <div className="text-red-500 text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authorization Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                An error occurred: {error}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Please try again or check your Spotify Developer settings.
              </p>
            </div>
          </>
        ) : code ? (
          <>
            <div className="text-center mb-6">
              <div className="text-green-500 text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authorization Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Copy your authorization code below
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase">
                Authorization Code:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-mono break-all bg-white dark:bg-zinc-900 px-3 py-2 rounded border border-gray-300 dark:border-zinc-600">
                  {code}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code)
                    alert('Code copied to clipboard!')
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-semibold">
                Next Steps:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Paste this code into your terminal</li>
                <li>The script will exchange it for access tokens</li>
                <li>Add the tokens to your .env file</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Waiting for Spotify...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You will be redirected shortly
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpotifyCallback
