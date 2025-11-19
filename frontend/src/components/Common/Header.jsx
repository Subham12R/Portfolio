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
import {RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";
import { BsEnvelopePaper } from "react-icons/bs";
import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";
import { DiVisualstudio } from "react-icons/di";
import Tooltip from '@mui/material/Tooltip';
import cursorIcon from '../../assets/logo/cursor.webp';
import { Text } from '@radix-ui/themes';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import TechBadge from './TechBadge';
import apiService from '../../services/api';
import bannerImage from '../../assets/banner.gif';


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
    return <img src={cursorIcon} alt="Cursor" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />;
  } else if (isVSCodeEditor(editorName)) {
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
  const [currentEditor, setCurrentEditor] = useState(null);
  const [sessionTime, setSessionTime] = useState(0); // Time in seconds
  const [sessionStartTime, setSessionStartTime] = useState(null); // When current session started
  const [lastCodingTime, setLastCodingTime] = useState(null); // Last coding time from durations (text format)
  const [lastCodingDate, setLastCodingDate] = useState(null); // Date of last coding time
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Spotify music playing state
  const [musicStartTime, setMusicStartTime] = useState(null); // When music started playing
  const [musicTime, setMusicTime] = useState(0); // Time music has been playing in seconds
  const lastResponseTimeRef = useRef(null); // Track when we last got a successful response 
  const lastSessionStartRef = useRef(null); // Track last session start time for resuming
  const lastHeartbeatTimeRef = useRef(null); // Track last heartbeat time
  
  // Helper to get/set last session start from localStorage
  const getLastSessionStart = () => {
    try {
      const stored = localStorage.getItem('wakatime_last_session_start');
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  };
  
  const setLastSessionStart = (date) => {
    try {
      if (date) {
        localStorage.setItem('wakatime_last_session_start', date.toISOString());
      } else {
        localStorage.removeItem('wakatime_last_session_start');
      }
    } catch {
      // Ignore localStorage errors
    }
  };
  

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

  // Timer that runs when session is active
  useEffect(() => {
    let timerIntervalId = null;
    
    if (sessionStartTime && isActive) {
      // Start/continue timer that increments every second
      timerIntervalId = setInterval(() => {
        setSessionTime(prev => {
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
      setSessionTime(0);
    }
    
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [sessionStartTime, isActive]);

  // Timer for music playing
  useEffect(() => {
    let musicTimerIntervalId = null;
    
    if (musicStartTime && isMusicPlaying) {
      // Start/continue music timer that increments every second
      musicTimerIntervalId = setInterval(() => {
        setMusicTime(prev => {
          // Recalculate from start time to keep it accurate
          if (musicStartTime) {
            const now = new Date();
            const start = new Date(musicStartTime);
            return Math.floor((now - start) / 1000);
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Reset timer when not playing
      setMusicTime(0);
    }
    
    return () => {
      if (musicTimerIntervalId) clearInterval(musicTimerIntervalId);
    };
  }, [musicStartTime, isMusicPlaying]);

  // Fetch WakaTime data and manage timer
  useEffect(() => {
    let pollIntervalId = null;
    let heartbeatPollIntervalId = null;
    const POLL_INTERVAL = 30000; // Poll status every 30 seconds
    const HEARTBEAT_POLL_INTERVAL = 2 * 60 * 1000; // Poll heartbeats every 2 minutes for better responsiveness
    const NO_RESPONSE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

    const fetchWakatime = async () => {
      try {
        // Fetch current status
        const statusResponse = await apiService.getWakaTimeStatus().catch((error) => {
          console.warn('WakaTime status fetch failed:', error);
          return { success: false, data: null, error: error?.message || 'Unknown error' };
        });
        
        // Log status response for debugging (but suppress 404 and 429 errors as they're expected)
        if (!statusResponse.success && statusResponse.statusCode !== 404 && statusResponse.statusCode !== 429) {
          console.warn('WakaTime status response failed:', statusResponse.error || statusResponse.details);
        }
        
        if (statusResponse.success && statusResponse.data?.data) {
          const statusData = statusResponse.data.data;
          const lastHeartbeat = statusData.last_heartbeat_at;
          const editor = statusData.editor;
          const hasEntity = statusData.entity; // Entity means actively coding
          
          // Update last response time
          lastResponseTimeRef.current = new Date();
          
          // Always set editor and last heartbeat if available (even if old)
          if (editor) {
            setCurrentEditor(editor);
          }
          
          // Check if we have recent activity (within last 2 minutes)
          let hasRecentActivity = false;
          if (lastHeartbeat) {
            const heartbeatTime = new Date(lastHeartbeat);
            const now = new Date();
            const diffMinutes = (now - heartbeatTime) / (1000 * 60);
            hasRecentActivity = diffMinutes < 2 && hasEntity;
          }
          
          // If we have recent activity, start/continue the timer
          if (hasRecentActivity) {
            const heartbeatTime = new Date(lastHeartbeat);
            
            if (!sessionStartTime) {
              // Check if we should resume a previous session or start new
              const lastSessionStart = getLastSessionStart();
              const RESUME_THRESHOLD = 60 * 60 * 1000; // 1 hour - if heartbeat is within 1 hour of last session, resume
              
              if (lastSessionStart && lastSessionStartRef.current) {
                const timeSinceLastSession = heartbeatTime - lastSessionStart;
                // If heartbeat is within 1 hour of last session start, resume it
                if (timeSinceLastSession >= 0 && timeSinceLastSession < RESUME_THRESHOLD) {
                  // Resume previous session
                  setSessionStartTime(lastSessionStart);
                  lastSessionStartRef.current = lastSessionStart;
                  setLastSessionStart(lastSessionStart);
                } else {
                  // Start new session from heartbeat
                  setSessionStartTime(heartbeatTime);
                  lastSessionStartRef.current = heartbeatTime;
                  setLastSessionStart(heartbeatTime);
                }
              } else {
                // No previous session - start new from heartbeat
                setSessionStartTime(heartbeatTime);
                lastSessionStartRef.current = heartbeatTime;
                setLastSessionStart(heartbeatTime);
              }
              setSessionTime(0);
            } else {
              // Session already running - update stored time if needed
              if (lastSessionStartRef.current !== sessionStartTime) {
                lastSessionStartRef.current = sessionStartTime;
                setLastSessionStart(sessionStartTime);
              }
            }
            setIsActive(true);
            setCurrentEditor(editor);
          } else {
            // No recent activity - stop timer but keep session start for potential resume
            setIsActive(false);
            // Don't clear sessionStartTime immediately - keep it for potential resume
            // Only clear if we're sure the session is over (no heartbeat for >1 hour)
            if (lastHeartbeat) {
              const heartbeatTime = new Date(lastHeartbeat);
              const now = new Date();
              const diffMinutes = (now - heartbeatTime) / (1000 * 60);
              if (diffMinutes > 60) {
                // No activity for >1 hour - clear session
                setSessionStartTime(null);
                lastSessionStartRef.current = null;
                setLastSessionStart(null);
                setSessionTime(0);
              }
            }
            
            // Fetch total time today and heartbeats when no live activity
            // Note: We check isActive state here, but don't add it to deps to avoid infinite loops
            // The effect runs on statusResponse changes, which is sufficient
            // Note: Removed all-time data fetching as it's no longer displayed
          }
          
          setWakatimeData({
            success: true,
            editor: editor,
            lastHeartbeat: lastHeartbeat,
            hasEntity: hasEntity
          });
        } else {
          // No data available - fetch last coding time from durations
          if (!isActive) {
            fetchLastCodingTime();
          }
          
          // Check if we haven't had a response for more than 1 hour
          if (lastResponseTimeRef.current) {
            const timeSinceLastResponse = new Date() - lastResponseTimeRef.current;
            if (timeSinceLastResponse > NO_RESPONSE_THRESHOLD) {
              // Stop timer if no response for >1 hour
              setIsActive(false);
              setSessionStartTime(null);
              lastSessionStartRef.current = null;
              setLastSessionStart(null);
              setSessionTime(0);
              setCurrentEditor(null);
            }
          }
        }
      } catch (error) {
        // Only log unexpected errors (not timeouts/network issues)
        if (!error.message?.includes('timeout') && !error.message?.includes('Failed to fetch')) {
          console.error('Failed to fetch WakaTime data:', error);
        }
        // Check if we haven't had a response for more than 1 hour
        if (lastResponseTimeRef.current) {
          const timeSinceLastResponse = new Date() - lastResponseTimeRef.current;
          if (timeSinceLastResponse > NO_RESPONSE_THRESHOLD) {
            // Stop timer if no response for >1 hour
            setIsActive(false);
            setSessionStartTime(null);
            lastSessionStartRef.current = null;
            setLastSessionStart(null);
            setSessionTime(0);
            setCurrentEditor(null);
          }
        }
      }
    };

    // Fetch last coding time from durations (yesterday or today)
    const fetchLastCodingTime = async () => {
      try {
        // Try today first
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        let durationsResponse = await apiService.getWakaTimeDurations(todayStr).catch(() => ({ success: false }));
        
        // If today has no data, try yesterday
        if (!durationsResponse.success || !durationsResponse.data?.data?.data || durationsResponse.data.data.data.length === 0) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          durationsResponse = await apiService.getWakaTimeDurations(yesterdayStr).catch(() => ({ success: false }));
        }
        
        if (durationsResponse.success && durationsResponse.data?.data?.data) {
          const durations = durationsResponse.data.data.data;
          
          // Calculate total coding time from durations
          let totalSeconds = 0;
          durations.forEach(duration => {
            totalSeconds += duration.duration || 0;
          });
          
          if (totalSeconds > 0) {
            // Format time
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            // Determine date
            const dateStr = durationsResponse.data.data.start || durationsResponse.data.data.end;
            const date = dateStr ? new Date(dateStr) : new Date();
            const isToday = date.toDateString() === today.toDateString();
            const isYesterday = date.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
            
            let dateLabel = '';
            if (isToday) {
              dateLabel = 'Today';
            } else if (isYesterday) {
              dateLabel = 'Yesterday';
            } else {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              dateLabel = `${monthNames[date.getMonth()]} ${date.getDate()}`;
            }
            
            setLastCodingTime(timeText);
            setLastCodingDate(dateLabel);
          }
        }
      } catch (error) {
        // Silently fail - durations are optional
        console.warn('Failed to fetch last coding time:', error);
      }
    };

    // Fetch heartbeats every 5 minutes to check for activity
    const fetchHeartbeats = async () => {
      try {
        const heartbeatsResponse = await apiService.getWakaTimeHeartbeats().catch((error) => {
          // Only log non-rate-limit errors
          if (!error?.message?.includes('rate limited') && !error?.message?.includes('429')) {
            console.warn('WakaTime heartbeats fetch failed:', error);
          }
          return { success: false, data: null };
        });
        
        if (heartbeatsResponse.success && heartbeatsResponse.data?.data?.data) {
          const heartbeats = heartbeatsResponse.data.data.data;
          
          // Get the most recent heartbeat
          if (heartbeats.length > 0) {
            // Sort by time (most recent first)
            const sortedHeartbeats = [...heartbeats].sort((a, b) => b.time - a.time);
            const latestHeartbeat = sortedHeartbeats[0];
            const heartbeatTime = new Date(latestHeartbeat.time * 1000); // Convert Unix timestamp to Date
            lastHeartbeatTimeRef.current = heartbeatTime;
            
            // Check if heartbeat is within last hour
            const now = new Date();
            const diffMinutes = (now - heartbeatTime) / (1000 * 60);
            
            // Check if it's a coding heartbeat (category is 'coding' or missing, which usually means coding)
            const isCodingHeartbeat = !latestHeartbeat.category || latestHeartbeat.category === 'coding';
            
            if (diffMinutes > 60) {
              // No heartbeat for more than 1 hour - stop timer
              setIsActive(false);
              setSessionStartTime(null);
              lastSessionStartRef.current = null;
              setLastSessionStart(null);
              setSessionTime(0);
            } else if (diffMinutes <= 10 && isCodingHeartbeat) {
              // Recent coding activity (within 10 minutes) - ensure timer is running
              
              if (!isActive) {
                // Start or resume session
                if (!sessionStartTime) {
                  // Start new session from heartbeat time
                  setSessionStartTime(heartbeatTime);
                  lastSessionStartRef.current = heartbeatTime;
                  setLastSessionStart(heartbeatTime);
                  setSessionTime(0);
                } else {
                  // Resume existing session if within 1 hour
                  const lastSessionStart = getLastSessionStart();
                  if (lastSessionStart) {
                    const timeSinceLastSession = heartbeatTime - lastSessionStart;
                    if (timeSinceLastSession < 60 * 60 * 1000) {
                      // Within 1 hour, resume
                      setSessionStartTime(lastSessionStart);
                      lastSessionStartRef.current = lastSessionStart;
                    } else {
                      // More than 1 hour, start new
                      setSessionStartTime(heartbeatTime);
                      lastSessionStartRef.current = heartbeatTime;
                      setLastSessionStart(heartbeatTime);
                      setSessionTime(0);
                    }
                  }
                }
                setIsActive(true);
              }
              
              // Update editor if available
              if (latestHeartbeat.language) {
                setCurrentEditor(latestHeartbeat.language);
              } else if (latestHeartbeat.entity) {
                // Try to extract editor from entity path
                const entityPath = latestHeartbeat.entity;
                if (entityPath.includes('.')) {
                  const ext = entityPath.split('.').pop().toLowerCase();
                  const languageMap = {
                    'js': 'JavaScript', 'jsx': 'React', 'ts': 'TypeScript', 'tsx': 'React TS',
                    'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C',
                    'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'json': 'JSON'
                  };
                  if (languageMap[ext]) {
                    setCurrentEditor(languageMap[ext]);
                  }
                }
              }
            }
          } else {
            // No heartbeats - check if we should stop timer
            if (lastHeartbeatTimeRef.current) {
              const now = new Date();
              const diffMinutes = (now - lastHeartbeatTimeRef.current) / (1000 * 60);
              if (diffMinutes > 60) {
                setIsActive(false);
                setSessionStartTime(null);
                lastSessionStartRef.current = null;
                setLastSessionStart(null);
                setSessionTime(0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch heartbeats:', error);
      }
    };

    // Fetch Spotify currently playing status
    const fetchSpotifyStatus = async () => {
      try {
        const spotifyResponse = await apiService.getSpotifyCurrentlyPlaying().catch(() => ({ success: false }));
        
        if (spotifyResponse.success && spotifyResponse.isPlaying) {
          // Music is playing
          if (!isMusicPlaying) {
            // Music just started - set start time
            setMusicStartTime(new Date());
          }
          setIsMusicPlaying(true);
        } else {
          // Music stopped or not playing
          if (isMusicPlaying) {
            // Music just stopped - clear start time
            setMusicStartTime(null);
            setMusicTime(0);
          }
          setIsMusicPlaying(false);
        }
      } catch {
        // Silently fail - Spotify status is optional
        setIsMusicPlaying(false);
      }
    };

    // Initial fetch
    fetchWakatime();
    fetchHeartbeats(); // Initial heartbeat fetch
    fetchLastCodingTime(); // Fetch last coding time when not active
    fetchSpotifyStatus(); // Check Spotify status
    
    // Poll status every 30 seconds
    pollIntervalId = setInterval(fetchWakatime, POLL_INTERVAL);
    
    // Poll heartbeats every 5 minutes
    heartbeatPollIntervalId = setInterval(fetchHeartbeats, HEARTBEAT_POLL_INTERVAL);
    
    // Poll Spotify every 30 seconds
    const spotifyPollIntervalId = setInterval(fetchSpotifyStatus, 30000);
    
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
      if (heartbeatPollIntervalId) clearInterval(heartbeatPollIntervalId);
      if (spotifyPollIntervalId) clearInterval(spotifyPollIntervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStartTime]); // isActive is intentionally excluded to avoid infinite loops

  // Format custom tooltip content for WakaTime activity
  const getActivityTooltipContent = () => {
    // If music is playing, show "Working...." with timer (priority over coding)
    if (isMusicPlaying) {
      const musicTimeDisplay = formatTime(musicTime);
      return (
        <div className="space-y-2">
          <div className="text-sm " style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            <span className="font-semibold">Vibing for: {musicTimeDisplay}</span>
          </div>
        </div>
      );
    }
    
    // If currently active, show timer and editor (even if no editor, show timer)
    if (isActive) {
      const editorIcon = getEditorIcon(currentEditor);
      const timeDisplay = formatTime(sessionTime);
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-semibold">Currently coding for: {timeDisplay}</span>
          </div>
          {currentEditor && (
            <div className="flex items-center gap-2 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              {editorIcon || <img src={cursorIcon} alt="cursor icon" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />}
              <span className="font-semibold">{currentEditor}</span>
            </div>
          )}
          <div className="text-xs opacity-75 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            🔄 Timer updates in real-time
          </div>
        </div>
      );
    }
    
    // If we have editor info but not active
    if (currentEditor && wakatimeData?.lastHeartbeat) {
      const lastHeartbeat = new Date(wakatimeData.lastHeartbeat);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastHeartbeat) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }
      
      const editorIcon = getEditorIcon(currentEditor);
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {editorIcon || <img src={cursorIcon} alt="cursor icon" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />}
            <span className="font-semibold">{currentEditor}</span>
          </div>
          <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            Last active: {timeAgo}
          </div>
        </div>
      );
    }
    
    // If we have last heartbeat but no editor, show just the time
    if (wakatimeData?.lastHeartbeat) {
      const lastHeartbeat = new Date(wakatimeData.lastHeartbeat);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastHeartbeat) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }
      
      return (
        <div className="space-y-2">
          <div className="text-sm">
            Last active: {timeAgo}
          </div>
        </div>
      );
    }
    
    // If we have last coding time from durations, show that
    if (lastCodingTime && lastCodingDate) {
      return (
        <div className="space-y-2">
          <div className="text-sm">
            {lastCodingDate}: {lastCodingTime}
          </div>
        </div>
      );
    }
    
    // If no WakaTime data at all, show minimal fallback
    return (
      <div className="space-y-2">
        <div className="text-sm opacity-75">
          No recent activity
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
        {/* Banner Section with Profile Picture Overlay - Full width, no padding */}
        <div className='banner-wrapper -mx-4 lg:mx-0'>
          <div className='banner-image relative w-full h-32 lg:h-48'>
            {/* Banner Image */}
            <img src={bannerImage} alt="banner image" className='w-full h-full object-cover' />
            
            {/* Profile Picture Overlay - positioned at bottom center */}
            <div className="absolute -bottom-12 left-15 transform -translate-x-1/2">
            <div className="relative">
              <img 
                src={profileImage} 
                alt="profile image" 
                className='w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-zinc-950' 
              />
              
              <CustomWakaTip 
                title={getActivityTooltipContent()} 
                placement="right" 
                arrow 
                isDark={isDark}
                enterDelay={200}
                leaveDelay={100}
              >
                <span 
                  className={`absolute bottom-1 right-3 inline-block w-2 h-2 rounded-full ring-2 ring-offset-2 dark:ring-offset-zinc-600 z-10 transition-all duration-300 cursor-pointer ${
                    isMusicPlaying
                      ? 'bg-green-500 ring-green-200 dark:ring-green-700 '
                      : isActive 
                      ? 'bg-green-500 ring-green-200 dark:ring-green-700 ' 
                      : wakatimeData?.lastHeartbeat || lastCodingTime
                      ? 'bg-green-400 ring-green-200 dark:ring-green-600'
                      : 'bg-gray-400 ring-gray-300 dark:ring-gray-600'
                  }`}
                />
              </CustomWakaTip>
            </div>
          </div>
        </div>
        </div>

        {/* Profile Content */}
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-6 mb-4 mt-20'>
                 <div className='w-full inline-flex flex-col justify-center items-start space-y-4'>
                    <div className='mb-1'>
                        
                    <h1 className='text-3xl  dark:text-zinc-200 text-zinc-900 tracking-tight font-bold leading-tight'><span className='font-bold text-zinc-800 dark:text-zinc-200'>Hi, I'm Subham</span> - <Text as='span' className='text-zinc-600 font-bold'>A Full Stack Web Developer.</Text></h1>
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

                    <div className='mt-4 w-full'>
                    <p className='gap-1 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed'>I build interactive and responsive web apps using {" "}  
                     <a href="https://react.dev/" norelopener target="_blank"><TechBadge icon={FaReact} iconClassName='text-blue-500'>React</TechBadge></a>
                    <span>,</span>
                    <a href="https://nextjs.org/" norelopener target="_blank"><TechBadge icon={RiNextjsFill} iconClassName='text-black dark:text-white'>NextJS</TechBadge></a>
                    <span>,</span>
                    <a href="https://tailwindcss.com/" norelopener target="_blank"><TechBadge icon={RiTailwindCssFill} iconClassName='text-blue-800'>TailwindCSS</TechBadge></a>
                    <span>,</span>
                    <a href="https://nodejs.org/" norelopener target="_blank"><TechBadge icon={RiNodejsFill} iconClassName='text-emerald-500'>NodeJs</TechBadge></a>
                    <span>,</span>
                    <span> and </span>
                    <a href="https://www.postgresql.org/" norelopener target="_blank"><TechBadge icon={BiLogoPostgresql} iconClassName='text-blue-800'>PostgreSQL</TechBadge></a>
                     <span>. Focusing on <Text as='span' className='dark:text-white text-black'> <strong>UI/UX Design</strong></Text> and learning <Text as='span' className='dark:text-white text-black'> <strong>Three JS</strong></Text>. Currently keeping a close eye on the latest technologies and trends in web development.</span>
                    
                    </p>
                    <div className='text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-4'>
                        <FaBookOpen className='text-zinc-600 dark:text-zinc-400' />
                        <Text>B.Tech CSE Student at <em>Adamas University</em>, Kolkata, India.</Text>
                    </div>
                    </div>



                    <div className='mb-8 w-full flex justify-start items-center gap-4'>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-white/40 transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BsEnvelopePaper/> Resume/CV
                        </button>
                        <button 
                            onClick={() => navigate('/contact')}
                            className='inline-flex justify-center items-center gap-2 bg-black dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-white dark:text-zinc-900 shadow hover:bg-zinc-100 dark:hover:bg-white transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BiPaperPlane />Get in Touch
                        </button>              
                    </div>

                     <div className='mb-4 flex flex-row justify-center items-center gap-5'>
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