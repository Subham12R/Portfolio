import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import profileImage from '../../assets/pfp.jpeg'
import csImage from '../../assets/cs.jpeg'
import ctrlsImage from '../../assets/ctrls.jpeg'
import devfestImage from '../../assets/devfest.jpeg'
import { SiJavascript, SiExpress, SiPostgresql } from 'react-icons/si'
import { DiVisualstudio } from 'react-icons/di'
import GitHubCalendar from 'react-github-calendar';
import { usePortfolio } from '../../contexts/PortfolioContext';
import LogoBadge from './LogoBadge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon, NewTwitterRectangleIcon, Linkedin01Icon, YoutubeIcon, InstagramIcon, PinterestIcon, Mail01Icon } from '@hugeicons/core-free-icons'


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Helper to check if editor is Cursor


const AboutMe = () => {
  const { data, isLoading, error } = usePortfolio()
  
  const slideImagesRef = useRef([]);
  
  // Animation for sliding images
  useEffect(() => {
    const slideImages = slideImagesRef.current.filter(el => el !== null);
    if (!slideImages.length) return;

    // Set initial state
    gsap.set(slideImages, {
      y: 50,
      opacity: 0
    });

    // Create the animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".slide-container",
        start: "top 85%",
        end: "bottom 20%",
        toggleActions: "play none none none",
        markers: false
      }
    });

    // Animate images sliding up when in view
    tl.to(slideImages, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out"
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  





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
            <img src={profileImage} alt="profile image" className='w-64 h-full rounded object-cover shadow-md ' />
        </div>

        <div className=' w-full flex flex-col justify-start items-start gap-4'>
            <h1 className='text-3xl font-bold dark:text-white'>{aboutMeData.name}</h1>
            <p className='text-gray-600 dark:text-zinc-400 text-md '>{aboutMeData.bio}</p>
              <div id="setup" >
       
        
        {/* Gear Used and IDE Setup */}
        <div className='mt-2'>

          <p className='text-base leading-relaxed dark:text-zinc-400 text-zinc-600 max-w-3xl'>
            I believe that having the right tools and environment is crucial for productive development work. 
            My <Link to="/gears" className='text-zinc-900 hover:text-zinc-400 dark:text-zinc-200 dark:hover:text-zinc-300 underline text-sm transition-colors'>gear</Link> includes 
            my go to requirements.
            Additionally, my IDE <Link to="/setup" className='text-zinc-900 hover:text-zinc-400 dark:text-zinc-200 dark:hover:text-zinc-300 underline text-sm transition-colors'>setup</Link> is 
            tailored to enhance efficiency, with extensions and configurations that support my coding style and project requirements.
          </p>
        </div>
      </div>
            {/* Social Media Links */}
            <div className='flex gap-2 mt-2'>
              <a 
                href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className='flex items-center gap-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors'
              >
                <HugeiconsIcon icon={Linkedin01Icon} size={24} />
                
              </a>
              <a 
                href="https://x.com/Subham12R" 
                target="_blank" 
                rel="noopener noreferrer"
                className='flex items-center gap-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors'
              >
                <HugeiconsIcon icon={NewTwitterRectangleIcon} size={24} />
                
              </a>
              <a 
                href="https://www.instagram.com/5ubhamkarmakar" 
                target="_blank" 
                rel="noopener noreferrer"
                className='flex items-center gap-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors'
              >
                <HugeiconsIcon icon={InstagramIcon} size={24} />
                
              </a>
            </div>
            </div>
        </div>

        {/* Year in a Nutshell Section */}
        <div className='slide-container mt-8 w-full'>
          <h2 className='text-2xl font-bold dark:text-white mb-2 '>2025 In a Wrap.</h2>
          <div className='w-full h-px bg-gray-200 dark:bg-zinc-700 mb-6'></div>
          
          <div className='space-2'>
            {/* Item 1 - Full width */}
            <div 
              ref={el => slideImagesRef.current[0] = el}
              className='h-64 w-full rounded-lg overflow-hidden flex items-stretch'
            >
              <div className='flex-1 py-6 pr-6 flex flex-col justify-start items-start'>
                <h3 className='text-xl font-semibold dark:text-white mb-2'>Visited some lovely kids.</h3>
                <p className='text-zinc-600 dark:text-zinc-400'>Visited a ngo for some community service and support along with my friends.</p>
                <p className='text-sm text-zinc-400 dark:text-zinc-500 mt-2'>March 2025</p>
              </div>
              <div className='w-1/2 h-full py-4 flex items-center justify-center'>
                <img src={csImage} alt="CS Conference" className='w-full h-full object-cover rounded-xl border-2 border-gray-300 dark:border-zinc-600' />
              </div>
            </div>
            
            <div 
              ref={el => slideImagesRef.current[1] = el}
              className='h-64 w-full rounded-lg overflow-hidden flex items-stretch'
            >
              <div className='w-1/2 h-full py-4 flex items-center justify-center'>
                <img src={ctrlsImage} alt="CTRLS Event" className='w-full h-full object-cover rounded-xl border-2 border-gray-300 dark:border-zinc-600' />
              </div>
              <div className='flex-1 py-6 pl-6 flex flex-col justify-start items-start'>
                <h3 className='text-xl font-semibold dark:text-white mb-2'>CTRLS Event</h3>
                <p className='text-zinc-600 dark:text-zinc-400'>Participated in CTRLS tech event, exploring latest trends in software development.</p>
                <p className='text-sm text-zinc-400 dark:text-zinc-500 mt-2'>August 2025</p>
              </div>
            </div>
            
            {/* Item 3 - DevFest */}
            <div 
              ref={el => slideImagesRef.current[2] = el}
              className='h-64 w-full rounded-lg overflow-hidden flex items-stretch'
            >
              <div className='flex-1 py-6 pr-6 flex flex-col justify-start items-start'>
                <h3 className='text-xl font-semibold dark:text-white mb-2'>DevFest 2025</h3>
                <p className='text-gray-600 dark:text-zinc-400'>Joined Google DevFest to learn about cutting-edge technologies and connect with developers.</p>
                <p className='text-sm text-gray-400 dark:text-zinc-500 mt-2'>October 2025</p>
              </div>
              <div className='w-1/2 h-full py-4 flex items-center justify-center'>
                <img src={devfestImage} alt="DevFest 2025" className='w-full h-full object-cover rounded-xl border-2 border-gray-300 dark:border-zinc-600' />
              </div>
            </div>
          </div>
        </div>

 
    </div>
  )
}

export default AboutMe