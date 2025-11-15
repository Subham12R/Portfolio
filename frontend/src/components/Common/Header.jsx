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
import cursorIcon from '../../assets/logo/cursor.webp';
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
  const lastResponseTimeRef = useRef(null); // Track when we last got a successful response
  const lastSessionStartRef = useRef(null); // Track last session start time for resuming
  
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

  // Fetch WakaTime data and manage timer
  useEffect(() => {
    let pollIntervalId = null;
    const POLL_INTERVAL = 30000; // Poll every 30 seconds
    const NO_RESPONSE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

    const fetchWakatime = async () => {
      try {
        // Fetch current status
        const statusResponse = await apiService.getWakaTimeStatus().catch(() => ({ success: false, data: null }));
        
        if (statusResponse.success && statusResponse.data?.data) {
          const statusData = statusResponse.data.data;
          const lastHeartbeat = statusData.last_heartbeat_at;
          const editor = statusData.editor;
          const hasEntity = statusData.entity; // Entity means actively coding
          
          // Update last response time
          lastResponseTimeRef.current = new Date();
          
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
          }
          
          setWakatimeData({
            success: true,
            editor: editor,
            lastHeartbeat: lastHeartbeat,
            hasEntity: hasEntity
          });
        } else {
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
        console.error('Failed to fetch WakaTime data:', error);
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

    // Initial fetch
    fetchWakatime();
    
    // Poll every 30 seconds
    pollIntervalId = setInterval(fetchWakatime, POLL_INTERVAL);
    
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [sessionStartTime]);

  // Format custom tooltip content for WakaTime activity
  const getActivityTooltipContent = () => {
    // If currently active, show timer and editor
    if (isActive && currentEditor) {
      const editorIcon = getEditorIcon(currentEditor);
      const timeDisplay = formatTime(sessionTime);
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-semibold">Currently Coding</span>
          </div>
          <div className="flex items-center gap-2 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            {editorIcon || <img src={cursorIcon} alt="cursor icon" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />}
            <span className="font-semibold">{currentEditor}</span>
            <span className="font-semibold">• {timeDisplay}</span>
          </div>
          <div className="text-xs opacity-75 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            🔄 Timer updates in real-time
          </div>
        </div>
      );
    }
    
    // If we have editor info but not active
    if (currentEditor && wakatimeData?.lastHeartbeat) {
      const editorIcon = getEditorIcon(currentEditor);
      const lastHeartbeat = new Date(wakatimeData.lastHeartbeat);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastHeartbeat) / (1000 * 60));
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {editorIcon || <img src={cursorIcon} alt="cursor icon" className="inline-block mr-1.5" style={{ width: '18px', height: '18px' }} />}
            <span className="font-semibold">{currentEditor}</span>
          </div>
          <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
            Last activity {diffMinutes < 60 ? `${diffMinutes}m ago` : `${Math.floor(diffMinutes / 60)}h ago`}
          </div>
        </div>
      );
    }

    // Default: no activity
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          <span className="font-medium text-gray-500 dark:text-gray-400">No recent activity</span>
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
                                                : wakatimeData?.lastHeartbeat
                                                ? 'bg-green-400 ring-green-200 dark:ring-green-600'
                                                : 'bg-gray-400 ring-gray-300 dark:ring-gray-600'
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