import React from 'react'
import profileImage from '../../assets/pfp.jpeg'
import { FaReact } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill } from 'react-icons/ri'
import { SiTypescript, SiJavascript, SiExpress, SiPostgresql } from 'react-icons/si'
import GitHubCalendar from 'react-github-calendar';
import { usePortfolio } from '../../contexts/PortfolioContext';

const AboutMe = () => {
  const { data, isLoading, error } = usePortfolio()
  
  // Use backend data instead of hardcoded data
  const aboutMeData = data?.aboutMe || {
    name: 'Subham Karmakar',
    title: 'Full Stack Web Developer',
    bio: 'I am a Full Stack Web Developer with a passion for building web applications. Currently, I am a student at Adamas University, pursuing a Bachelor of Technology in Computer Science and Engineering.'
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='bg-white w-full h-full lg:max-w-2xl mx-auto py-2 mb-2'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className='bg-white w-full h-full lg:max-w-2xl mx-auto py-2 mb-2'>
        <div className="text-center">
          <p className="text-red-600">Error loading profile: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white w-full h-full lg:max-w-2xl mx-auto  py-2 mb-2'>
    <div className='flex lg:flex-row flex-col justify-start items-start gap-2'>
        <div className='w-full'>
            <img src={profileImage} alt="profile image" className='w-64 h-64 rounded object-cover shadow-md ' />
        </div>

        <div className='flex flex-col justify-start items-start gap-4'>
            <h1 className='text-3xl font-bold'>{aboutMeData.name}</h1>
            <p className='text-gray-600 text-md '>{aboutMeData.bio}</p>

            <div className='flex flex-col justify-center items-start gap-2 mt-4'>
                <h1 className='text-xl font-bold'>Skills</h1>
                <div className='flex justify-start items-center gap-2'>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><FaReact className='text-blue-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><RiNextjsFill className='text-black' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><RiTailwindCssFill className='text-blue-800' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiTypescript className='text-blue-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiJavascript className='text-yellow-500' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiExpress className='text-red-800' /></span>
                    <span className='inline-flex items-center gap-2 py-2 text-3xl'><SiPostgresql className='text-blue-700' /></span>
                </div>
            </div>
            </div>
        </div>
        <div className='mt-8'>
            <h1 className='text-2xl font-bold'>Github Activity</h1>
            <p className='text-gray-600 text-sm tracking-tighter'><span className='font-bold tracking-tighter'>Subham12R's</span> journey over the years. </p>
        </div>
        <div className='mt-2 '>
            <div className='w-full h-full p-4 border border-gray-200 border-dashed rounded-md overflow-x-auto'>
                <GitHubCalendar username="subham12r" />
            </div>
        </div>
    </div>
  )
}

export default AboutMe