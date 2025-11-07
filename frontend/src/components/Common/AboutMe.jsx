import React, { useState, useEffect, useRef } from 'react'
import profileImage from '../../assets/profile.png'
import { SiJavascript, SiExpress, SiPostgresql } from 'react-icons/si'
import { DiVisualstudio } from 'react-icons/di'
import GitHubCalendar from 'react-github-calendar';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import cursorIcon from '../../assets/logo/cursor.webp';
import LogoBadge from './LogoBadge';

// Helper to check if editor is Cursor
const isCursorEditor = (editorName) => {
  if (!editorName) return false;
  const editor = editorName.toLowerCase();
  return editor.includes('cursor');
};

// Helper to check if editor is VS Code
const isVSCodeEditor = (editorName) => {
  if (!editorName) return false;
  const editor = editorName.toLowerCase();
  return editor.includes('vscode') || editor.includes('visual studio code') || editor.includes('code');
};

// Get editor icon component
const getEditorIcon = (editorName) => {
  if (!editorName) return null;
  
  if (isCursorEditor(editorName)) {
    return <img src={cursorIcon} alt="Cursor" className="inline-block mr-1.5" style={{ width: '16px', height: '16px' }} />;
  } else if (isVSCodeEditor(editorName)) {
    return <DiVisualstudio size={16} className="inline-block mr-1.5 text-blue-500" />;
  }
  
  // Default: try VS Code icon in blue
  return <DiVisualstudio size={16} className="inline-block mr-1.5 text-blue-500" />;
};

const AboutMe = () => {
  const { data, isLoading, error } = usePortfolio()
  const { theme } = useTheme()
  const [wakatimeData, setWakatimeData] = useState(null)
  const [wakatimeLoading, setWakatimeLoading] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [currentSessionTime, setCurrentSessionTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [onlineSessionTime, setOnlineSessionTime] = useState(0)
  const [onlineStartTime, setOnlineStartTime] = useState(null)
  const sessionStartTimeRef = useRef(null)
  const onlineStartTimeRef = useRef(null)

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

  // Online session timer that runs when online (not just when actively coding)
  useEffect(() => {
    let onlineTimerIntervalId = null
    
    // Check if online using the same logic as render
    // Default to online unless explicitly marked offline (no heartbeat in 5+ minutes)
    const isOnline = wakatimeData?.isOffline === false || 
                    (wakatimeData?.lastHeartbeat && (() => {
                      const heartbeatTime = new Date(wakatimeData.lastHeartbeat);
                      const now = new Date();
                      const diffMinutes = (now - heartbeatTime) / (1000 * 60);
                      return diffMinutes <= 5; // Online if heartbeat within last 5 minutes (matching offline threshold)
                    })()) ||
                    (wakatimeData && wakatimeData.isOffline === undefined); // Default online if isOffline not set
    
    if (isOnline && onlineStartTime) {
      // Start/continue online timer that increments every second
      onlineTimerIntervalId = setInterval(() => {
        setOnlineSessionTime(prev => {
          // Recalculate from start time to keep it accurate
          if (onlineStartTime) {
            const now = new Date()
            const start = new Date(onlineStartTime)
            return Math.floor((now - start) / 1000)
          }
          return prev + 1
        })
      }, 1000)
    } else {
      // Reset online timer when offline
      setOnlineSessionTime(0)
      setOnlineStartTime(null)
      onlineStartTimeRef.current = null
    }
    
    return () => {
      if (onlineTimerIntervalId) clearInterval(onlineTimerIntervalId)
    }
  }, [onlineStartTime, wakatimeData])

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
          // Default to online unless no heartbeat in 5+ minutes (matching Header logic)
          const OFFLINE_THRESHOLD_MINUTES = 5
          let isOffline = false
          if (lastHeartbeat) {
            const heartbeatTime = new Date(lastHeartbeat)
            const now = new Date()
            const diffMinutes = (now - heartbeatTime) / (1000 * 60)
            // Offline if no heartbeat in last 5 minutes
            isOffline = diffMinutes > OFFLINE_THRESHOLD_MINUTES
          } else {
            // No heartbeat at all - mark as offline
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
          
          // Start/continue online timer when online (not just when coding)
          if (!isOffline && lastHeartbeat) {
            if (!onlineStartTimeRef.current) {
              // New online session detected - initialize timer from heartbeat
              const heartbeatTime = new Date(lastHeartbeat)
              const now = new Date()
              const initialSeconds = Math.floor((now - heartbeatTime) / 1000)
              setOnlineSessionTime(Math.max(0, initialSeconds))
              setOnlineStartTime(heartbeatTime)
              onlineStartTimeRef.current = heartbeatTime
            }
            // Online timer will continue running via the separate useEffect
          }
          
          // Stop all timers if offline
          if (isOffline) {
            if (sessionStartTimeRef.current) {
              setSessionStartTime(null)
              sessionStartTimeRef.current = null
              setCurrentSessionTime(0)
            }
            if (onlineStartTimeRef.current) {
              setOnlineStartTime(null)
              onlineStartTimeRef.current = null
              setOnlineSessionTime(0)
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
          setOnlineStartTime(null)
          onlineStartTimeRef.current = null
          setOnlineSessionTime(0)
          
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
        setOnlineStartTime(null)
        onlineStartTimeRef.current = null
        setOnlineSessionTime(0)
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
                <div className='flex flex-wrap justify-start items-center gap-3'>
                  {[
                    { label: 'React', key: 'react' },
                    { label: 'Next.js', key: 'nextjs' },
                    { label: 'Tailwind CSS', key: 'tailwindcss' },
                    { label: 'TypeScript', key: 'typescript' },
                    { label: 'JavaScript', key: 'javascript', fallback: <SiJavascript className='text-yellow-500 text-xl' /> },
                    { label: 'Express', key: 'express', fallback: <SiExpress className='text-gray-700 dark:text-gray-300 text-xl' /> },
                    { label: 'PostgreSQL', key: 'postgresql', fallback: <SiPostgresql className='text-blue-700 text-xl' /> },
                  ].map((skill) => (
                    <div key={skill.label} className='flex flex-col items-center gap-1'>
                      <LogoBadge name={skill.key}>
                        {skill.fallback || <span className='text-sm font-semibold text-zinc-500 dark:text-zinc-300'>{skill.label[0]}</span>}
                      </LogoBadge>
                    </div>
                  ))}
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
                  {(() => {
                    // Get the last used editor from current editor or latest heartbeat
                    const editor = wakatimeData.currentEditor || 
                                 wakatimeData.latestHeartbeat?.editor || 
                                 wakatimeData.data?.data?.editor || 
                                 wakatimeData.statusInfo?.data?.editor ||
                                 null;
                    const editorIcon = getEditorIcon(editor);
                    
                    // Determine if online based on last heartbeat or recent activity
                    // Default to online unless explicitly marked offline (no heartbeat in 5+ minutes)
                    const isOnline = wakatimeData?.isOffline === false || 
                                    (wakatimeData?.lastHeartbeat && (() => {
                                      const heartbeatTime = new Date(wakatimeData.lastHeartbeat);
                                      const now = new Date();
                                      const diffMinutes = (now - heartbeatTime) / (1000 * 60);
                                      return diffMinutes <= 5; // Online if heartbeat within last 5 minutes (matching offline threshold)
                                    })()) ||
                                    (wakatimeData && wakatimeData.isOffline === undefined); // Default online if isOffline not set
                    
                    // Show timer if online
                    const timerDisplay = isOnline && onlineSessionTime > 0 ? formatTime(onlineSessionTime) : null;
                    
                    return (
                      <>
                        {editorIcon || <img src={cursorIcon} alt="cursor icon" className="inline-block mr-1.5" style={{ width: '16px', height: '16px' }} />}
                        <span className='opacity-75'>{isCursorEditor(editor) ? 'Vibed in VSCODE for ' : 'Vibed in Cursor for '}</span>
                        {isOnline && timerDisplay ? (
                          <span className='font-semibold text-green-600 dark:text-green-400'>{timerDisplay}</span>
                        ) : (
                          <span className='font-semibold'>{wakatimeData.allTime.data.text}</span>
                        )}
                        <span className='opacity-75 inline-flex items-center gap-1 ml-1'>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          <span className={isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          {isOnline && timerDisplay && (
                            <>
                              <span>•</span>
                              <span className='font-semibold text-green-600 dark:text-green-400'>{timerDisplay}</span>
                              <span className='text-xs text-green-600 dark:text-green-400'>(live)</span>
                            </>
                          )}
                        </span>
                      </>
                    );
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