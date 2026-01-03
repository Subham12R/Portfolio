import React, { useState, useEffect, useRef } from 'react'
import apiService from '../services/api'
import { FaBlog } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { Return } from '../components/Products/Return'

const Blog = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadedBlogs, setLoadedBlogs] = useState(new Set())
  const { theme } = useTheme()
  const blogsRef = useRef([])

  // Update theme on embedded tweets when theme changes
  useEffect(() => {
    const updateTweetThemes = () => {
      const tweetElements = document.querySelectorAll('.blog-embed-container blockquote.twitter-tweet')
      tweetElements.forEach((element) => {
        element.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
      })
      
      // Reload widgets to apply theme change
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load()
      }
    }

    if (blogs.length > 0 && loadedBlogs.size > 0) {
      updateTweetThemes()
    }
  }, [theme, blogs.length, loadedBlogs.size])

  // Process embedded code to add theme attribute
  const processEmbeddedCode = (embeddedCode) => {
    if (!embeddedCode) return embeddedCode
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(embeddedCode, 'text/html')
    const blockquote = doc.querySelector('blockquote.twitter-tweet')
    
    if (blockquote) {
      blockquote.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
      return doc.documentElement.innerHTML
    }
    
    return embeddedCode
  }

  // Check if a tweet widget is fully loaded
  const checkTweetLoaded = (blogId) => {
    // Check the loader container first (it's always rendered)
    const loaderContainer = document.querySelector(`[data-blog-id="${blogId}-loader"]`)
    if (loaderContainer) {
      const twitterWidget = loaderContainer.querySelector('iframe[src*="twitter"]') || 
                            loaderContainer.querySelector('blockquote.twitter-tweet iframe')
      if (twitterWidget) return true
    }
    
    // Also check the main container
    const mainContainer = document.querySelector(`.blog-embed-container[data-blog-id="${blogId}"]`)
    if (mainContainer) {
      const twitterWidget = mainContainer.querySelector('iframe[src*="twitter"]') || 
                            mainContainer.querySelector('blockquote.twitter-tweet iframe')
      if (twitterWidget) return true
    }
    
    return false
  }

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await apiService.getBlogs()
        if (response && response.blogs) {
          setBlogs(response.blogs)
        } else {
          setBlogs([])
        }
      } catch (err) {
        let errorMessage = err.message || 'Failed to fetch blogs'
        
        // Check for specific error cases
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          errorMessage = 'Blogs endpoint not found. Please verify the backend is deployed and the /api/blogs route exists.'
        } else if (err.message?.includes('table') || err.message?.includes('does not exist')) {
          errorMessage = 'Blogs table does not exist in database. Please run the migration SQL in Supabase.'
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          errorMessage = 'Cannot connect to backend server. Please check if the API is running.'
        }
        
        setError(errorMessage)
        console.error('Error fetching blogs:', err)
        console.error('Full error details:', {
          message: err.message,
          response: err.response,
          status: err.status
        })
        setBlogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  // Track loaded blogs
  useEffect(() => {
    if (blogs.length === 0) {
      setLoadedBlogs(new Set())
      return
    }

    blogsRef.current = blogs
    
    // Reset loaded blogs when blogs change
    setLoadedBlogs(new Set())
    
    const checkInterval = setInterval(() => {
      setLoadedBlogs(prev => {
        const newLoadedBlogs = new Set(prev)
        let hasChanges = false

        blogs.forEach((blog) => {
          if (!prev.has(blog.id) && checkTweetLoaded(blog.id)) {
            newLoadedBlogs.add(blog.id)
            hasChanges = true
          }
        })

        return hasChanges ? newLoadedBlogs : prev
      })
    }, 300)

    return () => clearInterval(checkInterval)
  }, [blogs])

  // Load Twitter Widget Script and initialize widgets for embedded content
  useEffect(() => {
    if (blogs.length === 0) return

    // Clean up embedded code: remove script tags (they won't execute anyway)
    const cleanupEmbeddedCode = () => {
      const containers = document.querySelectorAll('.blog-embed-container')
      containers.forEach(container => {
        // Remove any script tags inside the container
        const scripts = container.querySelectorAll('script')
        scripts.forEach(script => script.remove())
      })
    }

    const loadTwitterWidgets = () => {
      // First, clean up any script tags
      cleanupEmbeddedCode()

      // Function to initialize widgets
      const initWidgets = () => {
        if (window.twttr && window.twttr.widgets) {
          // Use load with a selector to target all twitter-tweet blockquotes
          const tweetElements = document.querySelectorAll('.blog-embed-container blockquote.twitter-tweet')
          if (tweetElements.length > 0) {
            window.twttr.widgets.load()
          }
        }
      }

      // Check if Twitter widgets script is already loaded
      if (window.twttr && window.twttr.widgets) {
        // Script already loaded, wait for DOM then initialize
        setTimeout(initWidgets, 100)
        return
      }

      // Check if script tag exists but twttr not ready
      const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]')
      if (existingScript) {
        // Wait for script to load
        const checkInterval = setInterval(() => {
          if (window.twttr && window.twttr.widgets) {
            initWidgets()
            clearInterval(checkInterval)
          }
        }, 100)
        return () => clearInterval(checkInterval)
      }

      // Create and append script
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      script.id = 'twitter-wjs'
      script.onload = () => {
        // Widget script loaded, wait for DOM updates then initialize
        setTimeout(initWidgets, 200)
      }
      script.onerror = () => {
        console.error('Failed to load Twitter widgets script')
      }
      
      // Only append if not already present
      if (!document.getElementById('twitter-wjs')) {
        document.body.appendChild(script)
      }
    }

    // Wait a bit for DOM to update after blogs are rendered
    const timer = setTimeout(() => {
      loadTwitterWidgets()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [blogs])

  // Skeleton component
  const SkeletonCard = () => (
    <div className='rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 animate-pulse'>
      
      <div className='p-4 space-y-4'>
        {/* Header skeleton */}
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800'></div>
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3'></div>
            <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/4'></div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className='space-y-2'>
          <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded'></div>
          <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded'></div>
          <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-5/6'></div>
        </div>
        {/* Image/Media skeleton */}
        <div className='h-64 bg-gray-200 dark:bg-zinc-800 rounded-lg'></div>
        {/* Footer skeleton */}
        <div className='flex items-center justify-between'>
          <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-24'></div>
          <div className='flex gap-4'>
            <div className='h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded'></div>
            <div className='h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded'></div>
            <div className='h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded'></div>
          </div>
        </div>
      </div>
    </div>
  )


  return (
    <div className='bg-white min-h-screen dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto px-4 py-12 mb-2 '>
      <Return />
      {/* Page Heading */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold dark:text-white mb-2'>Blog</h1>
        <p className='text-gray-600 dark:text-zinc-400 text-md'>
          Thoughts, updates, and insights
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-100 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-zinc-400">Loading blogs...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <FaBlog className="text-4xl text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-2">Error loading blogs</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">{error}</p>
        </div>
      ) : blogs.length > 0 ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {blogs.map((blog) => {
            const isLoaded = loadedBlogs.has(blog.id)
            const processedCode = processEmbeddedCode(blog.embedded_code)
            
            return (
              <div key={blog.id} className='relative'>
                {/* Skeleton shown while loading */}
                {!isLoaded && <SkeletonCard />}
                
                {/* Actual embed - rendered but hidden until loaded */}
                <div 
                  className={`rounded-xl overflow-hidden transition-all duration-200 ${
                    isLoaded ? 'block' : 'hidden'
                  }`}
                >
                  <div 
                    className='blog-embed-container'
                    data-blog-id={blog.id}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                    dangerouslySetInnerHTML={{ __html: processedCode }}
                  />
                </div>
                
                {/* Hidden loader for detection - always render */}
                <div 
                  className='hidden'
                  data-blog-id={`${blog.id}-loader`}
                  dangerouslySetInnerHTML={{ __html: processedCode }}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaBlog className="text-4xl text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-zinc-400">No blogs available yet</p>
        </div>
      )}
    </div>
  )
}

export default Blog

