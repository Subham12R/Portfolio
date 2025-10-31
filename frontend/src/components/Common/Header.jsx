import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import profileImage from '../../assets/profile.png';
import ResumePdf from '../../assets/Resume.pdf';
import DecryptedText from './DecryptedText';
import { useTheme } from '../../contexts/ThemeContext';
import {FaReact} from 'react-icons/fa';
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaSquareXTwitter, FaPinterestP } from "react-icons/fa6";
import { FaEnvelope, FaBookOpen } from "react-icons/fa";
import { RiClipboardFill, RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";

import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";
import { DiVisualstudio } from "react-icons/di";
import Tooltip from '@mui/material/Tooltip';
import cursorIcon from '../../assets/cursor.webp';
import { Text } from '@radix-ui/themes';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import TechBadge from './TechBadge';
import apiService from '../../services/api';


const Tip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ isDark }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: isDark ? '#ffffff' : '#000000',
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: isDark 
        ? '#ffffff' 
        : '#000000',

      color: isDark ? '#000000' : '#ffffff',
      fontSize: '0.7rem',
      fontWeight: '400',
      padding: '2px 4px',
    },
  }));

// Custom styled tooltip for WakaTime activity with glassmorphism design
const CustomWakaTip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ isDark }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)',
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: isDark 
        ? 'rgba(30, 30, 30, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      border: isDark 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)',
      color: isDark ? '#ffffff' : '#000000',
      fontSize: '0.85rem',
      fontWeight: '400',
      padding: '12px 16px',
      maxWidth: '320px',
      borderRadius: '12px',
      boxShadow: isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    },
  }));

// Get editor icon component
const getEditorIcon = (editorName) => {
  if (!editorName) return null;
  
  const editor = editorName.toLowerCase();
  
  if (editor.includes('cursor')) {
    return <img src={cursorIcon} alt="Cursor" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />;
  } else if (editor.includes('vscode') || editor.includes('visual studio code') || editor.includes('code')) {
    return <DiVisualstudio size={18} className="inline-block mr-1.5 text-blue-500" />;
  }
  
  // Default: try VS Code icon in blue
  return <DiVisualstudio size={18} className="inline-block mr-1.5 text-blue-500" />;
};

const Header = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [wakatimeData, setWakatimeData] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0); // Time in seconds
  const [sessionStartTime, setSessionStartTime] = useState(null); // When current session started
  const sessionStartTimeRef = useRef(null); // Ref to track session start without causing re-renders

  // Helper function to format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Local timer that runs independently when session is active
  useEffect(() => {
    let timerIntervalId = null;
    
    if (sessionStartTime && isActive) {
      // Start/continue timer that increments every second
      timerIntervalId = setInterval(() => {
        setCurrentSessionTime(prev => {
          // Recalculate from start time to keep it accurate
          if (sessionStartTime) {
            const now = new Date();
            const start = new Date(sessionStartTime);
            return Math.floor((now - start) / 1000);
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Reset timer when not active
      setCurrentSessionTime(0);
    }
    
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [sessionStartTime, isActive]);

  // Fetch WakaTime data for activity status with dynamic polling
  useEffect(() => {
    let pollIntervalId = null;
    let pollCount = 0;
    const MAX_POLLS_WHEN_INACTIVE = 10;

    const fetchWakatime = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch multiple endpoints in parallel for better data
        // Use catch to prevent one failure from breaking everything
        const [statusResponse, statusData, allTimeData, heartbeatsResponse, durationsResponse] = await Promise.all([
          apiService.getWakaTimeStatus().catch((err) => {
            console.warn('Failed to fetch status:', err);
            return { success: false, data: null };
          }),
          apiService.getWakaTimeStatusBar().catch((err) => {
            console.warn('Failed to fetch status bar:', err);
            return { success: false, data: null };
          }),
          apiService.getWakaTimeAllTimeSinceToday().catch((err) => {
            console.warn('Failed to fetch all time:', err);
            return { success: false, data: null };
          }),
          apiService.getWakaTimeHeartbeats(today).catch(() => ({ success: false, data: null })),
          apiService.getWakaTimeDurations(today).catch(() => ({ success: false, data: null }))
        ]);
        
        if (statusData.success) {
          const statusInfo = statusResponse.success ? statusResponse.data : null;
          const heartbeatsData = heartbeatsResponse.success ? heartbeatsResponse.data : null;
          const durationsData = durationsResponse.success ? durationsResponse.data : null;
          
          // Get the most recent heartbeat from heartbeats endpoint (more accurate)
          let lastHeartbeat = statusInfo?.data?.last_heartbeat_at;
          let latestHeartbeat = null;
          
          if (heartbeatsData?.data && Array.isArray(heartbeatsData.data) && heartbeatsData.data.length > 0) {
            // Sort by time descending and get the most recent
            const sortedHeartbeats = [...heartbeatsData.data].sort((a, b) => {
              const timeA = new Date(a.time || a.created_at || 0);
              const timeB = new Date(b.time || b.created_at || 0);
              return timeB - timeA;
            });
            latestHeartbeat = sortedHeartbeats[0];
            lastHeartbeat = latestHeartbeat.time || latestHeartbeat.created_at || lastHeartbeat;
          }
          
          const hasActiveEntity = statusInfo?.data?.entity && statusInfo.data.editor;
          
          // Check if offline using heartbeat data (more accurate)
          let isOffline = false;
          if (lastHeartbeat) {
            const heartbeatTime = new Date(lastHeartbeat);
            const now = new Date();
            const diffMinutes = (now - heartbeatTime) / (1000 * 60);
            // Offline if no heartbeat in last 2 minutes
            isOffline = diffMinutes > 2 || (!hasActiveEntity && diffMinutes > 1);
          } else {
            isOffline = true;
          }
          
          const isCodingNow = !isOffline && (statusData.isCurrentlyCoding === true || hasActiveEntity);
          
          // Get current editor from status or latest heartbeat
          const currentEditor = latestHeartbeat?.editor || statusInfo?.data?.editor || statusData.data?.data?.editor || null;
          
          // Calculate accurate time from durations if available
          let accurateTimeToday = 0;
          if (durationsData?.data && Array.isArray(durationsData.data)) {
            accurateTimeToday = durationsData.data.reduce((total, duration) => {
              return total + (duration.duration || 0);
            }, 0);
          }
          
          // If we detect active heartbeat (recent activity), start/continue timer
          if (isCodingNow && (hasActiveEntity || latestHeartbeat) && lastHeartbeat) {
            if (!sessionStartTimeRef.current) {
              // New active session detected - initialize timer from heartbeat
              const heartbeatTime = new Date(lastHeartbeat);
              const now = new Date();
              const initialSeconds = Math.floor((now - heartbeatTime) / 1000);
              setCurrentSessionTime(Math.max(0, initialSeconds));
              setSessionStartTime(heartbeatTime);
              sessionStartTimeRef.current = heartbeatTime;
            }
            // Timer will continue running via the separate useEffect
          }
          
          // If offline detected, stop the timer and reset
          if (isOffline) {
            if (sessionStartTimeRef.current) {
              setSessionStartTime(null);
              sessionStartTimeRef.current = null;
              setCurrentSessionTime(0);
            }
          }
          
          setIsActive(isCodingNow);
          
          // Combine all data including real-time status from multiple endpoints
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
          });

          // Dynamic polling based on activity state
          if (isCodingNow && hasActiveEntity) {
            // Actively coding - poll every 10 seconds to check if still active
            pollCount = 0;
            clearInterval(pollIntervalId);
            pollIntervalId = setInterval(fetchWakatime, 10000);
          } else if (!isOffline && pollCount < MAX_POLLS_WHEN_INACTIVE) {
            pollCount++;
            clearInterval(pollIntervalId);
            pollIntervalId = setInterval(fetchWakatime, 20000);
          } else if (isOffline) {
            // Offline - stop timer and show recent activity, poll less frequently
            clearInterval(pollIntervalId);
            pollIntervalId = setInterval(fetchWakatime, 60000);
          } else {
            clearInterval(pollIntervalId);
            pollIntervalId = setInterval(fetchWakatime, 120000);
          }
        } else {
          // Still set all time data even if no current status
          if (allTimeData.success && allTimeData.data) {
            setWakatimeData({
              success: true,
              data: null,
              isToday: false,
              isCurrentlyCoding: false,
              allTime: allTimeData.data
            });
          }
          setIsActive(false);
          
          // Stop timer if session was running
          setSessionStartTime(null);
          sessionStartTimeRef.current = null;
          setCurrentSessionTime(0);
          
          pollCount++;
          clearInterval(pollIntervalId);
          if (pollCount < MAX_POLLS_WHEN_INACTIVE) {
            pollIntervalId = setInterval(fetchWakatime, 60000);
          } else {
            pollIntervalId = setInterval(fetchWakatime, 300000);
          }
        }
      } catch (error) {
        console.error('Failed to fetch WakaTime data:', error);
        setIsActive(false);
        // Stop timer on error
        setSessionStartTime(null);
        sessionStartTimeRef.current = null;
        setCurrentSessionTime(0);
        clearInterval(pollIntervalId);
        pollIntervalId = setInterval(fetchWakatime, 60000);
      }
    };

    // Initial fetch
    fetchWakatime();
    
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, []);

  // Format custom tooltip content for WakaTime activity
  const getActivityTooltipContent = () => {
    // Check if offline and should show recent activity
    const isOffline = wakatimeData?.isOffline === true || (!isActive && !wakatimeData?.currentStatus?.entity);
    
    // If currently coding, show real-time current session info with live updates
    if (isActive && !isOffline && (wakatimeData?.currentStatus || wakatimeData?.statusInfo)) {
      const current = wakatimeData.currentStatus || wakatimeData.statusInfo?.data;
      const editor = wakatimeData.currentEditor || current?.editor || wakatimeData.data?.data?.editor;
      const editorIcon = getEditorIcon(editor);
      
      // Use running timer if session is active, otherwise use accurate duration or API time
      let timeToday = '0 secs';
      if (sessionStartTime && currentSessionTime > 0) {
        timeToday = formatTime(currentSessionTime);
      } else if (wakatimeData.accurateTimeToday && wakatimeData.accurateTimeToday > 0) {
        // Use accurate time from durations endpoint
        timeToday = formatTime(wakatimeData.accurateTimeToday);
      } else {
        timeToday = wakatimeData.data?.data?.text || '0 secs';
      }
      
      // Check if entity exists (means actively coding)
      const isActuallyCoding = current && current.entity;
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-semibold">Currently Coding</span>
          </div>
          {editor && (
            <div className="flex items-center gap-2 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              {editorIcon}
              <span className="font-medium">{editor}</span>
              <span style={{ opacity: 0.8 }}>:</span>
              <span className="font-semibold">{timeToday}</span>
              <span className="text-xs opacity-75 text-green-600 dark:text-green-400">(live)</span>
            </div>
          )}
          {current?.project && (
            <div className="text-sm opacity-90">
              Project: <span className="font-medium">{current.project}</span>
            </div>
          )}
          {current?.language && (
            <div className="text-sm opacity-90">
              Language: <span className="font-medium">{current.language}</span>
            </div>
          )}
          {current?.entity && (
            <div className="text-sm opacity-90">
              File: <span className="font-medium">{current.entity}</span>
            </div>
          )}
          {isActuallyCoding && (
            <div className="text-xs opacity-75 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              🔄 Updates every 10s
            </div>
          )}
        </div>
      );
    }
    
    // If offline, will show recent activity from all_time_since_today below

    // If there's current activity data (but not actively coding right now)
    if (wakatimeData && wakatimeData.success && wakatimeData.data?.data) {
      const activity = wakatimeData.data.data;
      const isToday = wakatimeData.isToday;
      const editor = activity.editor;
      const editorIcon = getEditorIcon(editor);
      const timeText = activity.text;
      const totalTime = wakatimeData?.allTime?.data?.text;
      
      if (timeText && timeText !== '0 secs') {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {editorIcon}
              <span className="font-medium">{editor || 'Editor'}</span>
              <span style={{ opacity: 0.8 }}>:</span>
              <span className="font-semibold">{timeText}</span>
            </div>
            <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              Last coded {isToday ? 'today' : 'yesterday'}
            </div>
            {activity.project && (
              <div className="text-sm opacity-90">
                Project: <span className="font-medium">{activity.project}</span>
              </div>
            )}
            {activity.languages && activity.languages.length > 0 && (
              <div className="text-sm opacity-90">
                Languages: <span className="font-medium">{activity.languages.map(lang => lang.name || lang).join(', ')}</span>
              </div>
            )}
            {totalTime && (
              <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
                Total: <span className="font-semibold">{totalTime}</span> all time
              </div>
            )}
          </div>
        );
      }
    }

    // No current activity, show total time from all_time_since_today
    if (wakatimeData?.allTime?.data) {
      const allTimeData = wakatimeData.allTime.data;
      
      if (allTimeData.text) {
        // Determine if online based on last heartbeat or recent activity
        const isOnline = wakatimeData?.isOffline === false || 
                        (wakatimeData?.lastHeartbeat && (() => {
                          const heartbeatTime = new Date(wakatimeData.lastHeartbeat);
                          const now = new Date();
                          const diffMinutes = (now - heartbeatTime) / (1000 * 60);
                          return diffMinutes <= 2; // Online if heartbeat within last 2 minutes
                        })());
        
        // Get the last used editor from current editor or latest heartbeat
        const editor = wakatimeData.currentEditor || 
                     wakatimeData.latestHeartbeat?.editor || 
                     wakatimeData.data?.data?.editor || 
                     wakatimeData.statusInfo?.data?.editor ||
                     null;
        const editorIcon = getEditorIcon(editor);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {editorIcon && (
                <>
                  {editorIcon}
                  <span className="font-medium">{editor}</span>
                </>
              )}
              {!editorIcon && (
                <>
                  <DiVisualstudio size={18} className="inline-block mr-1.5 text-blue-500" />
                  <span className="font-medium">VS Code</span>
                </>
              )}
              <span style={{ opacity: 0.8 }}>:</span>
              <span className="font-semibold">{allTimeData.text}</span>
            </div>
            <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className={`font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        );
      }
    }

    // Get editor even when offline
    const editor = wakatimeData?.currentEditor || 
                   wakatimeData?.latestHeartbeat?.editor || 
                   wakatimeData?.data?.data?.editor || 
                   wakatimeData?.statusInfo?.data?.editor ||
                   null;
    const editorIcon = getEditorIcon(editor);

    return (
      <div className="space-y-2">
        {editorIcon && (
          <div className="flex items-center gap-2">
            {editorIcon}
            <span className="font-medium">{editor}</span>
          </div>
        )}
        <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span className="font-medium text-gray-500 dark:text-gray-400">Offline</span>
          </div>
        </div>
      </div>
    );
  };

  // Function to download resume from assets
  const downloadResume = () => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = ResumePdf;
      link.download = 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <header className="border-gray-200">


        {/* Profile Content */}
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-4 mb-2'>
                    <div className='w-full flex justify-between items-start mb-10 mt-6'>
                                    <div className="relative">
                                        <img src={profileImage} alt="profile image" className='w-24 h-24 rounded-full object-cover shadow-md ' />

                                        <CustomWakaTip 
                                          title={getActivityTooltipContent()} 
                                          placement="right" 
                                          arrow 
                                          isDark={isDark}
                                        >
                                          <span 
                                            className={`absolute bottom-1 right-3 inline-block w-2 h-2 rounded-full ring-2 ring-offset-2 dark:ring-offset-zinc-600 z-10 transition-all duration-300 ${
                                              isActive 
                                                ? 'bg-green-500 ring-green-200 dark:ring-green-700 animate-pulse' 
                                                : (wakatimeData?.allTime?.data && (() => {
                                                    // Check if activity is recent (within 6 days)
                                                    const rangeText = wakatimeData.allTime.data.range?.text || wakatimeData.allTime.data.range?.start || '';
                                                    if (rangeText.includes('today') || rangeText.includes('Today')) {
                                                      return 'bg-green-500 ring-green-200 dark:ring-green-700';
                                                    }
                                                    try {
                                                      const rangeDate = new Date(rangeText);
                                                      if (!isNaN(rangeDate.getTime())) {
                                                        const now = new Date();
                                                        const diffDays = Math.ceil(Math.abs(now - rangeDate) / (1000 * 60 * 60 * 24));
                                                        if (diffDays <= 6) {
                                                          return 'bg-green-400 ring-green-200 dark:ring-green-600';
                                                        }
                                                      }
                                                    } catch {
                                                      // Invalid date, use default gray
                                                    }
                                                    return 'bg-gray-400 ring-gray-300 dark:ring-gray-600';
                                                  })())
                                            }`}
                                          ></span>
                                        </CustomWakaTip>
                                    </div>

                            </div>
                 <div className='w-full inline-flex flex-col justify-center items-start space-y-2'>
                    <div className='mb-2'>
                        
                    <h1 className='text-3xl mb-2 dark:text-zinc-200 text-zinc-900 tracking-tight font-bold'><span className='font-bold text-zinc-800 dark:text-zinc-200'>Hi, I'm Subham</span> - <Text as='span' className='text-blue-500 font-bold'>A Full Stack Web Developer.</Text></h1>
                    {/* <DecryptedText
                        text="A Full Stack Web Developer."
                        speed={100}
                        animateOn='view'
                        maxIterations={20}
                        characters="101010</>?"
                        className="revealed text-xl md:text-3xl font-bold text-blue-500 tracking-tighter"
                        parentClassName="all-letters text-xl  md:text-3xl font-bold text-blue-200 tracking-tighter"
                        encryptedClassName="encrypted"
                    />
                    */}
                    </div> 

                    <div className=' mt-2 w-full '>
                    <p className='gap-1 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 dark:text-zinc-400 font-medium '>I build interactive and responsive web apps using {" "}  
                     <TechBadge icon={FaReact} iconClassName='text-blue-500'>React</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiNextjsFill} iconClassName='text-black dark:text-white'>NextJS</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiTailwindCssFill} iconClassName='text-blue-800'>TailwindCSS</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiNodejsFill} iconClassName='text-emerald-500'>NodeJs</TechBadge>
                    <span>,</span>
                    <span> and </span>
                    <TechBadge icon={BiLogoPostgresql} iconClassName='text-blue-800'>PostgreSQL</TechBadge>
                     <span>. Focusing on <Text as='span' className='dark:text-white text-black'> <strong>UI/UX Design</strong></Text> and learning <Text as='span' className='dark:text-white text-black'> <strong>Three JS</strong></Text>. Currently keeping a close eye on the latest technologies and trends in web development.</span>
                    
                    </p>
                    <div className='text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-2'>
                        <FaBookOpen className='text-zinc-600 dark:text-zinc-400' />
                        <Text>B.Tech CSE Student at <em>Adamas University</em>, Kolkata, India.</Text>
                    </div>
                    </div>



                    <div className='mb-6 w-full flex justify-start items-center gap-4'>
                    <Tip title="Download Resume" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-white/40 transition-all ease-in-out duration-300 py-1 px-2 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <RiClipboardFill/> Resume/CV
                        </button>
                    </Tip>
                    <Tip title="Contact Me" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={() => navigate('/contact')}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-black shadow hover:bg-zinc-100 dark:hover:bg-white transition-all ease-in-out duration-300 py-1 px-2 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BiPaperPlane />Get in Touch
                        </button>
                     </Tip>               
                    </div>

                     <div className='mb-2 flex flex-row justify-center items-center gap-4'>
                        <Tip title="Send me an email" placement="top" arrow isDark={isDark}>
                            <a 
                                href="mailto:rikk4335@gmail.com" 
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
                            >
                                <FaEnvelope size={20}/>
                            </a>
                        </Tip>
                        <Tip title="Connect on LinkedIn" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
                            >
                                <FaLinkedin size={20}/>
                            </a>
                        </Tip>
                        <Tip title="View my GitHub profile" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://github.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-150'
                            >
                                <FaGithub size={20}/>
                            </a>
                        </Tip>
                        <Tip title="Follow me on Twitter" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://twitter.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
                            >
                                <FaSquareXTwitter size={20}/>
                            </a>
                        </Tip>
                        <Tip title="Follow me on Pinterest" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://twitter.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
                            >
                                <FaPinterestP size={20}/>
                            </a>
                        </Tip>
                    </div>
                </div>

        </div>

    </header>
  )
}

export default Header