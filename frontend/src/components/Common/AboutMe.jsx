import React, { useState, useEffect, useRef } from 'react'
import profileImage from '../../assets/profile.png'
import { FaReact } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill } from 'react-icons/ri'
import { SiTypescript, SiJavascript, SiExpress, SiPostgresql } from 'react-icons/si'
import { DiVisualstudio } from "react-icons/di";
import GitHubCalendar from 'react-github-calendar';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import cursorIcon from '../../assets/cursor.webp';

// Get editor icon component
const getEditorIcon = (editorName) => {
  if (!editorName) return null;
  
  const editor = editorName.toLowerCase();
  
  if (editor.includes('cursor')) {
    return <img src={cursorIcon} alt="Cursor" className="inline-block mr-1.5" style={{ width: '16px', height: '16px' }} />;
  } else if (editor.includes('vscode') || editor.includes('visual studio code') || editor.includes('code')) {
    return <DiVisualstudio size={16} className="inline-block mr-1.5" />;
  }
  
  // Default: try VS Code icon
  return <DiVisualstudio size={16} className="inline-block mr-1.5" />;
};

const AboutMe = () => {
  const { data, isLoading, error } = usePortfolio()
  const { theme } = useTheme()
  const [wakatimeData, setWakatimeData] = useState(null)
  const [wakatimeLoading, setWakatimeLoading] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [currentSessionTime, setCurrentSessionTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const sessionStartTimeRef = useRef(null)

  // Helper function to format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Local timer that runs independently when session is active
  useEffect(() => {
    let timerIntervalId = null
    
    if (sessionStartTime && isActive) {
      timerIntervalId = setInterval(() => {
        setCurrentSessionTime(prev => {
          if (sessionStartTime) {
            const now = new Date()
            const start = new Date(sessionStartTime)
            return Math.floor((now - start) / 1000)
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setCurrentSessionTime(0)
    }
    
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId)
    }
  }, [sessionStartTime, isActive])

  // Fetch WakaTime data with dynamic polling
  useEffect(() => {
    let pollIntervalId = null
    let pollCount = 0
    const MAX_POLLS_WHEN_INACTIVE = 10

    const fetchWakatime = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Fetch multiple endpoints in parallel for better data
        // Use catch to prevent one failure from breaking everything
        const [statusResponse, statusData, allTimeData, heartbeatsResponse, durationsResponse] = await Promise.all([
          apiService.getWakaTimeStatus().catch((err) => {
            console.warn('Failed to fetch status:', err)
            return { success: false, data: null }
          }),
          apiService.getWakaTimeStatusBar().catch((err) => {
            console.warn('Failed to fetch status bar:', err)
            return { success: false, data: null }
          }),
          apiService.getWakaTimeAllTimeSinceToday().catch((err) => {
            console.warn('Failed to fetch all time:', err)
            return { success: false, data: null }
          }),
          apiService.getWakaTimeHeartbeats(today).catch(() => ({ success: false, data: null })),
          apiService.getWakaTimeDurations(today).catch(() => ({ success: false, data: null }))
        ])
        
        if (statusData.success) {
          const statusInfo = statusResponse.success ? statusResponse.data : null
          const heartbeatsData = heartbeatsResponse.success ? heartbeatsResponse.data : null
          const durationsData = durationsResponse.success ? durationsResponse.data : null
          
          // Get the most recent heartbeat from heartbeats endpoint (more accurate)
          let lastHeartbeat = statusInfo?.data?.last_heartbeat_at
          let latestHeartbeat = null
          
          if (heartbeatsData?.data && Array.isArray(heartbeatsData.data) && heartbeatsData.data.length > 0) {
            // Sort by time descending and get the most recent
            const sortedHeartbeats = [...heartbeatsData.data].sort((a, b) => {
              const timeA = new Date(a.time || a.created_at || 0)
              const timeB = new Date(b.time || b.created_at || 0)
              return timeB - timeA
            })
            latestHeartbeat = sortedHeartbeats[0]
            lastHeartbeat = latestHeartbeat.time || latestHeartbeat.created_at || lastHeartbeat
          }
          
          const hasActiveEntity = statusInfo?.data?.entity && statusInfo.data.editor
          
          // Check if offline using heartbeat data (more accurate)
          let isOffline = false
          if (lastHeartbeat) {
            const heartbeatTime = new Date(lastHeartbeat)
            const now = new Date()
            const diffMinutes = (now - heartbeatTime) / (1000 * 60)
            // Offline if no heartbeat in last 2 minutes
            isOffline = diffMinutes > 2 || (!hasActiveEntity && diffMinutes > 1)
          } else {
            isOffline = true
          }
          
          const isCodingNow = !isOffline && (statusData.isCurrentlyCoding === true || hasActiveEntity)
          
          // Get current editor from status or latest heartbeat
          const currentEditor = latestHeartbeat?.editor || statusInfo?.data?.editor || statusData.data?.data?.editor || null
          
          // Calculate accurate time from durations if available
          let accurateTimeToday = 0
          if (durationsData?.data && Array.isArray(durationsData.data)) {
            accurateTimeToday = durationsData.data.reduce((total, duration) => {
              return total + (duration.duration || 0)
            }, 0)
          }
          
          // Start timer if active heartbeat detected
          if (isCodingNow && (hasActiveEntity || latestHeartbeat) && lastHeartbeat) {
            if (!sessionStartTimeRef.current) {
              const heartbeatTime = new Date(lastHeartbeat)
              const now = new Date()
              const initialSeconds = Math.floor((now - heartbeatTime) / 1000)
              setCurrentSessionTime(Math.max(0, initialSeconds))
              setSessionStartTime(heartbeatTime)
              sessionStartTimeRef.current = heartbeatTime
            }
          }
          
          // Stop timer if offline
          if (isOffline) {
            if (sessionStartTimeRef.current) {
              setSessionStartTime(null)
              sessionStartTimeRef.current = null
              setCurrentSessionTime(0)
            }
          }
          
          setIsActive(isCodingNow)
          
          setWakatimeData({
            ...statusData,
            statusInfo: statusInfo,
            currentStatus: statusInfo?.data || null,
            currentEditor: currentEditor,
            isOffline: isOffline,
            lastHeartbeat: lastHeartbeat,
            latestHeartbeat: latestHeartbeat,
            heartbeats: heartbeatsData,
            durations: durationsData,
            accurateTimeToday: accurateTimeToday,
            allTime: allTimeData.success ? allTimeData.data : null
          })

          // Dynamic polling
          if (isCodingNow && hasActiveEntity) {
            pollCount = 0
            clearInterval(pollIntervalId)
            pollIntervalId = setInterval(fetchWakatime, 10000)
          } else if (!isOffline && pollCount < MAX_POLLS_WHEN_INACTIVE) {
            pollCount++
            clearInterval(pollIntervalId)
            pollIntervalId = setInterval(fetchWakatime, 20000)
          } else if (isOffline) {
            clearInterval(pollIntervalId)
            pollIntervalId = setInterval(fetchWakatime, 60000)
          } else {
            clearInterval(pollIntervalId)
            pollIntervalId = setInterval(fetchWakatime, 120000)
          }
          
          setWakatimeLoading(false)
        } else {
          if (allTimeData.success && allTimeData.data) {
            setWakatimeData({
              success: true,
              data: null,
              isToday: false,
              isCurrentlyCoding: false,
              allTime: allTimeData.data
            })
          }
          setIsActive(false)
          setSessionStartTime(null)
          sessionStartTimeRef.current = null
          setCurrentSessionTime(0)
          
          pollCount++
          clearInterval(pollIntervalId)
          if (pollCount < MAX_POLLS_WHEN_INACTIVE) {
            pollIntervalId = setInterval(fetchWakatime, 60000)
          } else {
            pollIntervalId = setInterval(fetchWakatime, 300000)
          }
          
          setWakatimeLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch WakaTime data:', error)
        setIsActive(false)
        setSessionStartTime(null)
        sessionStartTimeRef.current = null
        setCurrentSessionTime(0)
        clearInterval(pollIntervalId)
        pollIntervalId = setInterval(fetchWakatime, 60000)
        setWakatimeLoading(false)
      }
    }

    fetchWakatime()
    
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId)
    }
  }, [])
  
  // Use backend data instead of hardcoded data
  const aboutMeData = data?.aboutMe || {
    name: 'Subham Karmakar',
    title: 'Full Stack Web Developer',
    bio: 'I am a Full Stack Web Developer with a passion for building web applications. Currently, I am a student at Adamas University, pursuing a Bachelor of Technology in Computer Science and Engineering.'
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-2 mb-2'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-2 mb-2'>
        <div className="text-center">
          <p className="text-red-600">Error loading profile: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto  py-2 mb-2'>
    <div className='flex lg:flex-row flex-col justify-start items-start gap-2'>
        <div className='w-full'>
            <img src={profileImage} alt="profile image" className='w-64 h-64 rounded object-cover shadow-md ' />
        </div>

        <div className='flex flex-col justify-start items-start gap-4'>
            <h1 className='text-3xl font-bold dark:text-white'>{aboutMeData.name}</h1>
            <p className='text-gray-600 dark:text-zinc-400 text-md '>{aboutMeData.bio}</p>

            <div className='flex flex-col justify-center items-start gap-2 mt-4'>
                <h1 className='text-xl font-bold dark:text-white'>Skills</h1>
                <div className='flex justify-start items-center gap-2'>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><FaReact className='text-blue-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><RiNextjsFill className='text-black' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><RiTailwindCssFill className='text-blue-800' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiTypescript className='text-blue-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiJavascript className='text-yellow-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiExpress className='text-gray-700 dark:text-gray-300' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiPostgresql className='text-blue-700' /></span>
                </div>
            </div>
            </div>
        </div>
        <div className='mt-8'>
            <h1 className='text-2xl font-bold dark:text-white'>Github Activity</h1>
            <p className='text-gray-600 dark:text-zinc-400 text-sm tracking-tighter'><span className='font-bold tracking-tighter'>Subham12R's</span> journey over the years. </p>
            <p className='text-gray-600 dark:text-zinc-400 text-sm tracking-tighter'>
              {wakatimeLoading ? (
                'Loading coding stats...'
              ) : isActive && !wakatimeData?.isOffline && (wakatimeData?.currentStatus || wakatimeData?.statusInfo) ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1'></span>
                  {getEditorIcon(wakatimeData.currentEditor || wakatimeData.currentStatus?.editor || wakatimeData.data?.data?.editor)}
                  <span className='font-semibold text-green-600 dark:text-green-400'>Currently coding</span>
                  <span>:</span>
                  {(() => {
                    if (sessionStartTime && currentSessionTime > 0) {
                      return <span className='font-semibold'>{formatTime(currentSessionTime)} <span className='text-xs text-green-600 dark:text-green-400 opacity-75'>(live)</span></span>
                    } else if (wakatimeData.accurateTimeToday && wakatimeData.accurateTimeToday > 0) {
                      return <span className='font-semibold'>{formatTime(wakatimeData.accurateTimeToday)}</span>
                    } else if (wakatimeData.data?.data?.text) {
                      return <span className='font-semibold'>{wakatimeData.data.data.text}</span>
                    }
                    return null
                  })()}
                  {wakatimeData.currentStatus?.project && (
                    <span className='opacity-75'> on {wakatimeData.currentStatus.project}</span>
                  )}
                </span>
              ) : wakatimeData?.success && wakatimeData.data?.data && wakatimeData.data.data.text ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  {getEditorIcon(wakatimeData.data.data.editor)}
                  <span className='font-semibold'>{wakatimeData.data.data.editor || 'Last Activity'}</span>
                  <span>:</span>
                  <span className='font-semibold'>{wakatimeData.data.data.text}</span>
                  {wakatimeData.isToday ? (
                    <span className='opacity-75'> today</span>
                  ) : (
                    <span className='opacity-75'> yesterday</span>
                  )}
                  {wakatimeData.data.data.project && (
                    <span className='opacity-75'> on {wakatimeData.data.data.project}</span>
                  )}
                  {wakatimeData?.allTime?.data?.text && (
                    <span className='opacity-75'> • Total: {wakatimeData.allTime.data.text}</span>
                  )}
                </span>
              ) : wakatimeData?.allTime?.data?.text ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  {getEditorIcon(wakatimeData.data?.data?.editor) || <DiVisualstudio size={16} className="inline-block mr-1.5" />}
                  <span className='font-semibold'>Last Activity</span>
                  <span>:</span>
                  <span className='font-semibold'>{wakatimeData.allTime.data.text}</span>
                  {(() => {
                    const allTimeData = wakatimeData.allTime.data
                    let lastActivityText = 'recent'
                    let isRecentActivity = false
                    let isOnline = false
                    
                    if (allTimeData.range) {
                      const rangeText = allTimeData.range.text || allTimeData.range.start || ''
                      if (rangeText.includes('today') || rangeText.includes('Today')) {
                        lastActivityText = 'today'
                        isRecentActivity = true
                        isOnline = true
                      } else if (rangeText.includes('yesterday') || rangeText.includes('Yesterday')) {
                        lastActivityText = 'yesterday'
                        isRecentActivity = true
                      } else {
                        try {
                          const rangeDate = new Date(rangeText)
                          if (!isNaN(rangeDate.getTime())) {
                            const now = new Date()
                            const diffTime = Math.abs(now - rangeDate)
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                            
                            if (diffDays === 0 && diffHours < 24) {
                              if (diffHours < 6) {
                                lastActivityText = `${diffHours}h ago`
                                isOnline = true
                              } else {
                                lastActivityText = 'today'
                                isOnline = true
                              }
                              isRecentActivity = true
                            } else if (diffDays === 1) {
                              lastActivityText = 'yesterday'
                              isRecentActivity = true
                            } else if (diffDays <= 6) {
                              lastActivityText = 'recent'
                              isRecentActivity = true
                            } else {
                              lastActivityText = `${diffDays} days ago`
                              isRecentActivity = false
                            }
                          }
                        } catch {
                          lastActivityText = 'recent'
                          isRecentActivity = true
                        }
                      }
                    }
                    
                    return (
                      <span className='opacity-75'>
                        {isOnline ? (
                          <span className='inline-flex items-center gap-1'>
                            <span className='w-1.5 h-1.5 rounded-full bg-green-500 mr-1'></span>
                            <span className='text-green-600 dark:text-green-400'>Online</span>
                            <span> • {lastActivityText}</span>
                          </span>
                        ) : (
                          <span> ({isRecentActivity ? 'recent' : lastActivityText})</span>
                        )}
                      </span>
                    )
                  })()}
                </span>
              ) : (
                'No recent coding activity - check out my GitHub activity below!'
              )}
            </p>
        </div>
        <div className='mt-2'>
            <div className='w-full h-full border border-gray-200 dark:border-zinc-700 border-dashed rounded-md github-calendar-container'>
                <GitHubCalendar 
                  username="subham12r" 
                  style={{ 
                    width: '100%', 
                    height: '100%'
                  }}
                  showWeekdayLabels={true}
                  fontSize={12}
                  blockSize={12}
                  blockMargin={3}
                  colorScheme={theme}
                  theme={{
                    light: ['#f1f5f9', '#dcfce7', '#86efac', '#22c55e', '#15803d'],
                    dark: ['#1e293b', '#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa']
                  }}
                />
            </div>
        </div>
    </div>
  )
}

export default AboutMe