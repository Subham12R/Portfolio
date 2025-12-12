import React, { useState, useEffect, useRef } from 'react'
import profileImage from '../../assets/pfp.jpg'
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
  const [currentEditor, setCurrentEditor] = useState(null)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [totalTimeToday, setTotalTimeToday] = useState(null) // Total time coded today (text)
  const [allTimeData, setAllTimeData] = useState(null) // Full all_time_since_today data
  const lastResponseTimeRef = useRef(null)
  const lastSessionStartRef = useRef(null) // Track last session start time for resuming
  
  // Helper to get/set last session start from localStorage
  const getLastSessionStart = () => {
    try {
      const stored = localStorage.getItem('wakatime_last_session_start')
      return stored ? new Date(stored) : null
    } catch {
      return null
    }
  }
  
  const setLastSessionStart = (date) => {
    try {
      if (date) {
        localStorage.setItem('wakatime_last_session_start', date.toISOString())
      } else {
        localStorage.removeItem('wakatime_last_session_start')
      }
    } catch {
      // Ignore localStorage errors
    }
  }

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

  // Timer that runs when session is active
  useEffect(() => {
    let timerIntervalId = null
    
    if (sessionStartTime && isActive) {
      timerIntervalId = setInterval(() => {
        setSessionTime(prev => {
          if (sessionStartTime) {
            const now = new Date()
            const start = new Date(sessionStartTime)
            return Math.floor((now - start) / 1000)
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setSessionTime(0)
    }
    
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId)
    }
  }, [sessionStartTime, isActive])

  // Fetch WakaTime data and manage timer
  useEffect(() => {
    let pollIntervalId = null
    const POLL_INTERVAL = 30000 // Poll every 30 seconds
    const NO_RESPONSE_THRESHOLD = 60 * 60 * 1000 // 1 hour in milliseconds

    const fetchWakatime = async () => {
      try {
        // Fetch current status
        const statusResponse = await apiService.getWakaTimeStatus().catch((error) => {
          console.warn('WakaTime status fetch failed:', error);
          return { success: false, data: null, error: error?.message || 'Unknown error' };
        });
        
        // Log status response for debugging
        if (!statusResponse.success) {
          console.warn('WakaTime status response failed:', statusResponse.error || statusResponse.details);
        }
        
        if (statusResponse.success && statusResponse.data?.data) {
          const statusData = statusResponse.data.data
          const lastHeartbeat = statusData.last_heartbeat_at
          const editor = statusData.editor
          const hasEntity = statusData.entity // Entity means actively coding
          
          // Update last response time
          lastResponseTimeRef.current = new Date()
          
          // Check if we have recent activity (within last 2 minutes)
          let hasRecentActivity = false
          if (lastHeartbeat) {
            const heartbeatTime = new Date(lastHeartbeat)
            const now = new Date()
            const diffMinutes = (now - heartbeatTime) / (1000 * 60)
            hasRecentActivity = diffMinutes < 2 && hasEntity
          }
          
          // If we have recent activity, start/continue the timer
          if (hasRecentActivity) {
            const heartbeatTime = new Date(lastHeartbeat)
            
            if (!sessionStartTime) {
              // Check if we should resume a previous session or start new
              const lastSessionStart = getLastSessionStart()
              const RESUME_THRESHOLD = 60 * 60 * 1000 // 1 hour - if heartbeat is within 1 hour of last session, resume
              
              if (lastSessionStart && lastSessionStartRef.current) {
                const timeSinceLastSession = heartbeatTime - lastSessionStart
                // If heartbeat is within 1 hour of last session start, resume it
                if (timeSinceLastSession >= 0 && timeSinceLastSession < RESUME_THRESHOLD) {
                  // Resume previous session
                  setSessionStartTime(lastSessionStart)
                  lastSessionStartRef.current = lastSessionStart
                  setLastSessionStart(lastSessionStart)
                } else {
                  // Start new session from heartbeat
                  setSessionStartTime(heartbeatTime)
                  lastSessionStartRef.current = heartbeatTime
                  setLastSessionStart(heartbeatTime)
                }
              } else {
                // No previous session - start new from heartbeat
                setSessionStartTime(heartbeatTime)
                lastSessionStartRef.current = heartbeatTime
                setLastSessionStart(heartbeatTime)
              }
              setSessionTime(0)
            } else {
              // Session already running - update stored time if needed
              if (lastSessionStartRef.current !== sessionStartTime) {
                lastSessionStartRef.current = sessionStartTime
                setLastSessionStart(sessionStartTime)
              }
            }
            setIsActive(true)
            setCurrentEditor(editor)
            // Clear total time when active (we show live timer instead)
            setTotalTimeToday(null)
          } else {
            // No recent activity - stop timer but keep session start for potential resume
            setIsActive(false)
            // Don't clear sessionStartTime immediately - keep it for potential resume
            // Only clear if we're sure the session is over (no heartbeat for >1 hour)
            if (lastHeartbeat) {
              const heartbeatTime = new Date(lastHeartbeat)
              const now = new Date()
              const diffMinutes = (now - heartbeatTime) / (1000 * 60)
              if (diffMinutes > 60) {
                // No activity for >1 hour - clear session
                setSessionStartTime(null)
                lastSessionStartRef.current = null
                setLastSessionStart(null)
                setSessionTime(0)
              }
            }
            
            // Fetch total time today and heartbeats when no live activity
            // Note: We check isActive state here, but don't add it to deps to avoid infinite loops
            // The effect runs on statusResponse changes, which is sufficient
            try {
              const allTimeResponse = await apiService.getWakaTimeAllTimeSinceToday()
              if (allTimeResponse.success && allTimeResponse.data?.data) {
                const allTimeData = allTimeResponse.data.data
                setAllTimeData(allTimeData)
                setTotalTimeToday(allTimeData.text || null)
              }
            } catch (error) {
              console.error('Failed to fetch total time today:', error)
            }
          }
          
          setWakatimeData({
            success: true,
            editor: editor,
            lastHeartbeat: lastHeartbeat,
            hasEntity: hasEntity
          })
          // Always set editor and last heartbeat if available (even if old)
          if (editor) {
            setCurrentEditor(editor)
          }
          setWakatimeLoading(false)
        } else {
          // No data available - try to fetch all-time data anyway
          setWakatimeLoading(false)
          
          // Even if status fails, try to fetch all-time data
          try {
            const allTimeResponse = await apiService.getWakaTimeAllTimeSinceToday()
            if (allTimeResponse.success && allTimeResponse.data?.data) {
              const allTimeData = allTimeResponse.data.data
              setAllTimeData(allTimeData)
              setTotalTimeToday(allTimeData.text || null)
            }
          } catch (error) {
            console.error('Failed to fetch total time today:', error)
          }
          
          // Check if we haven't had a response for more than 1 hour
          if (lastResponseTimeRef.current) {
            const timeSinceLastResponse = new Date() - lastResponseTimeRef.current
            if (timeSinceLastResponse > NO_RESPONSE_THRESHOLD) {
              // Stop timer if no response for >1 hour
              setIsActive(false)
              setSessionStartTime(null)
              lastSessionStartRef.current = null
              setLastSessionStart(null)
              setSessionTime(0)
              setCurrentEditor(null)
            }
          }
          setWakatimeLoading(false)
        }
      } catch (error) {
        // Only log unexpected errors (not timeouts/network issues)
        if (!error.message?.includes('timeout') && !error.message?.includes('Failed to fetch')) {
          console.error('Failed to fetch WakaTime data:', error)
        }
        // Check if we haven't had a response for more than 1 hour
        if (lastResponseTimeRef.current) {
          const timeSinceLastResponse = new Date() - lastResponseTimeRef.current
          if (timeSinceLastResponse > NO_RESPONSE_THRESHOLD) {
            // Stop timer if no response for >1 hour
            setIsActive(false)
            setSessionStartTime(null)
            lastSessionStartRef.current = null
            setLastSessionStart(null)
            setSessionTime(0)
            setCurrentEditor(null)
          }
        }
        setWakatimeLoading(false)
      }
    }

    // Initial fetch
    fetchWakatime()
    
    // Poll every 30 seconds
    pollIntervalId = setInterval(fetchWakatime, POLL_INTERVAL)
    
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId)
    }
  }, [sessionStartTime])

  // Note: Commits fetching removed - focusing on all-time-since-today data for now
  
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
        <div className='w-[450px] flex justify-start items-start'>
            <img src={profileImage} alt="profile image" className='w-64 h-64 rounded object-cover shadow-md ' />
        </div>

        <div className=' w-full flex flex-col justify-start items-start gap-4'>
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
        {/* GitHub Activity Section */}
        <div className='mt-8'>
            <h1 className='text-2xl font-bold dark:text-white mb-1'>GitHub Activity</h1>
            <p className='text-gray-600 dark:text-zinc-400 text-sm mb-4'>
              <span className='font-semibold'>@Subham12R</span> • Coding journey over the years
            </p>
            
            {/* Stats Bar */}
            <div className='mb-4 p-3 rounded-lg border border-gray-200 dark:border-zinc-800'>
              <div className='text-sm text-gray-700 dark:text-zinc-300'>
              {wakatimeLoading ? (
                'Loading coding stats...'
              ) : isActive && currentEditor ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1'></span>
                  {getEditorIcon(currentEditor)}
                  <span className='font-semibold text-green-600 dark:text-green-400'>Currently coding</span>
                  <span>:</span>
                  <span className='font-semibold'>{formatTime(sessionTime)} <span className='text-xs text-green-600 dark:text-green-400 opacity-75'>(live)</span></span>
                </span>
              ) : currentEditor && wakatimeData?.lastHeartbeat ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  {getEditorIcon(currentEditor)}
                  <span className='font-semibold'>{currentEditor}</span>
                  <span>:</span>
                  <span className='opacity-75'>
                    Last activity {(() => {
                      const lastHeartbeat = new Date(wakatimeData.lastHeartbeat)
                      const now = new Date()
                      const diffMinutes = Math.floor((now - lastHeartbeat) / (1000 * 60))
                      return diffMinutes < 60 ? `${diffMinutes}m ago` : `${Math.floor(diffMinutes / 60)}h ago`
                    })()}
                  </span>
                  {allTimeData && (
                    <>
                      <span>•</span>
                      <span className='font-semibold'>Total: {allTimeData.text || totalTimeToday}</span>
                      {allTimeData.daily_average && (
                        <>
                          <span>•</span>
                          <span className='opacity-75 text-sm'>
                            Avg: {(() => {
                              const avgHours = Math.floor(allTimeData.daily_average / 3600);
                              const avgMins = Math.floor((allTimeData.daily_average % 3600) / 60);
                              return `${avgHours}h ${avgMins}m`;
                            })()}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </span>
              ) : currentEditor && wakatimeData?.lastHeartbeat ? (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  {getEditorIcon(currentEditor)}
                  <span className='font-semibold'>{currentEditor}</span>
                  <span>:</span>
                  <span className='opacity-75'>
                    Last active {(() => {
                      const lastHeartbeat = new Date(wakatimeData.lastHeartbeat)
                      const now = new Date()
                      const diffMinutes = Math.floor((now - lastHeartbeat) / (1000 * 60))
                      const diffHours = Math.floor(diffMinutes / 60)
                      const diffDays = Math.floor(diffHours / 24)
                      
                      if (diffDays > 0) {
                        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
                      } else if (diffHours > 0) {
                        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
                      } else if (diffMinutes > 0) {
                        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
                      } else {
                        return 'just now'
                      }
                    })()}
                  </span>
                  {allTimeData && (
                    <>
                      <span>•</span>
                      <span className='font-semibold'>Total: {allTimeData.text || totalTimeToday}</span>
                      {allTimeData.daily_average && (
                        <>
                          <span>•</span>
                          <span className='opacity-75 text-sm'>
                            Avg: {(() => {
                              const avgHours = Math.floor(allTimeData.daily_average / 3600);
                              const avgMins = Math.floor((allTimeData.daily_average % 3600) / 60);
                              return `${avgHours}h ${avgMins}m`;
                            })()}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 flex-wrap'>
                  {allTimeData ? (
                    <>
                      <span className='font-semibold'>Total: {totalTimeToday}</span>
                      {allTimeData.daily_average && (
                        <>
                          <span>•</span>
                          <span className='opacity-75 text-sm'>
                            Daily avg: {(() => {
                              const avgHours = Math.floor(allTimeData.daily_average / 3600);
                              const avgMins = Math.floor((allTimeData.daily_average % 3600) / 60);
                              return `${avgHours}h ${avgMins}m`;
                            })()}
                          </span>
                        </>
                      )}
        
                    </>
                  ) : (
                    <>
                      <span className='opacity-75'>Check out my GitHub activity below!</span>
                    </>
                  )}
                </span>
              )}
              </div>
            </div>
            
            {/* Calendar Container */}
            <div className='w-full rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 p-4 shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] flex justify-center items-center'>
              <div className='github-calendar-container w-full max-w-full overflow-x-auto flex justify-center'>
                <GitHubCalendar 
                  username="subham12r" 
                  showWeekdayLabels={false}
                  hideTotalCount={false}
                  fontSize={12}
                  blockSize={12}
                  blockMargin={3}
                  colorScheme={theme}
                />
              </div>
            </div>
        </div>
    </div>
  )
}

export default AboutMe