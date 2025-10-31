import React, { useState, useEffect } from 'react';
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
    return <DiVisualstudio size={18} className="inline-block mr-1.5" />;
  }
  
  // Default: try VS Code icon
  return <DiVisualstudio size={18} className="inline-block mr-1.5" />;
};

const Header = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [wakatimeData, setWakatimeData] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // Fetch WakaTime data for activity status
  useEffect(() => {
    const fetchWakatime = async () => {
      try {
        const statusData = await apiService.getWakaTimeStatusBar();
        // Fetch all time since today to get total time
        const allTimeData = await apiService.getWakaTimeAllTimeSinceToday();
        
        if (statusData.success) {
          // Check if actively coding (from backend detection)
          const isCodingNow = statusData.isCurrentlyCoding === true;
          setIsActive(isCodingNow);
          
          // Combine status data with all time data
          setWakatimeData({
            ...statusData,
            allTime: allTimeData.success ? allTimeData.data : null
          });
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
        }
      } catch (error) {
        console.error('Failed to fetch WakaTime data:', error);
        setIsActive(false);
      }
    };

    fetchWakatime();
    // Refresh more frequently for real-time updates - every 30 seconds
    const interval = setInterval(fetchWakatime, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format custom tooltip content for WakaTime activity
  const getActivityTooltipContent = () => {
    // If currently coding, show current session info
    if (isActive && wakatimeData?.currentStatus?.entity) {
      const current = wakatimeData.currentStatus;
      const editor = current.editor || wakatimeData.data?.data?.editor;
      const editorIcon = getEditorIcon(editor);
      const timeToday = wakatimeData.data?.data?.text || '0 secs';
      
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
            </div>
          )}
          {current.project && (
            <div className="text-sm opacity-90">
              Project: <span className="font-medium">{current.project}</span>
            </div>
          )}
          {current.language && (
            <div className="text-sm opacity-90">
              Language: <span className="font-medium">{current.language}</span>
            </div>
          )}
          {current.entity && (
            <div className="text-sm opacity-90">
              File: <span className="font-medium">{current.entity}</span>
            </div>
          )}
        </div>
      );
    }

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
        let lastActivityText = 'recent';
        if (allTimeData.range) {
          const rangeText = allTimeData.range.text || allTimeData.range.start || '';
          if (rangeText.includes('today') || rangeText.includes('Today')) {
            lastActivityText = 'today';
          } else if (rangeText.includes('yesterday') || rangeText.includes('Yesterday')) {
            lastActivityText = 'yesterday';
          } else {
            try {
              const rangeDate = new Date(rangeText);
              if (!isNaN(rangeDate.getTime())) {
                const now = new Date();
                const diffTime = Math.abs(now - rangeDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                  lastActivityText = 'yesterday';
                } else if (diffDays <= 7) {
                  lastActivityText = `${diffDays} days ago`;
                } else {
                  lastActivityText = rangeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
              } else {
                lastActivityText = rangeText;
              }
            } catch {
              lastActivityText = rangeText;
            }
          }
        }
        
        // Try to get editor from last activity if available
        const editor = wakatimeData.data?.data?.editor;
        const editorIcon = getEditorIcon(editor);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {editorIcon || <DiVisualstudio size={18} className="inline-block mr-1.5" />}
              <span className="font-medium">{editor || 'Last Activity'}</span>
              <span style={{ opacity: 0.8 }}>:</span>
              <span className="font-semibold">{allTimeData.text}</span>
            </div>
            <div className="text-sm opacity-90 border-t pt-2" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}}>
              Last activity: <span className="font-medium">{lastActivityText}</span>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-2">
        <div className="text-sm opacity-90">No coding activity detected</div>
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
                                            className={`absolute bottom-1 right-3 inline-block w-2 h-2 rounded-full ring-2 ring-offset-2 dark:ring-offset-zinc-950 z-10 transition-all duration-300 ${
                                              isActive 
                                                ? 'bg-green-500 ring-green-200 dark:ring-green-700 animate-pulse' 
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