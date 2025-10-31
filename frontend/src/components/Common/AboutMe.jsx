import React, { useState, useEffect } from 'react'
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

  // Fetch WakaTime data
  useEffect(() => {
    const fetchWakatime = async () => {
      try {
        const statusData = await apiService.getWakaTimeStatusBar()
        const allTimeData = await apiService.getWakaTimeAllTimeSinceToday()
        
        setWakatimeData({
          ...statusData,
          allTime: allTimeData.success ? allTimeData.data : null
        })
      } catch (error) {
        console.error('Failed to fetch WakaTime data:', error)
      } finally {
        setWakatimeLoading(false)
      }
    }

    fetchWakatime()
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchWakatime, 30000)
    
    return () => clearInterval(interval)
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
              ) : wakatimeData?.isCurrentlyCoding && wakatimeData.currentStatus ? (
                <span className='inline-flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1'></span>
                  {getEditorIcon(wakatimeData.currentStatus.editor || wakatimeData.data?.data?.editor)}
                  <span className='font-semibold text-green-600 dark:text-green-400'>Currently coding</span>
                  <span>:</span>
                  {wakatimeData.data?.data?.text && (
                    <span className='font-semibold'>{wakatimeData.data.data.text}</span>
                  )}
                  {wakatimeData.currentStatus.project && (
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
                <span className='inline-flex items-center gap-1'>
                  {getEditorIcon(wakatimeData.data?.data?.editor) || <DiVisualstudio size={16} className="inline-block mr-1.5" />}
                  <span className='font-semibold'>Last Activity</span>
                  <span>:</span>
                  <span className='font-semibold'>{wakatimeData.allTime.data.text}</span>
                  {wakatimeData.allTime.data.range && (
                    <span className='opacity-75'> ({wakatimeData.allTime.data.range.text || 'recent'})</span>
                  )}
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