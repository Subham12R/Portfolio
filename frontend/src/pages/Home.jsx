import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { getCalApi } from "@calcom/embed-react";
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Spotify from '../components/Products/Spotify'
import { FaArrowLeft, FaArrowRight, FaAws, FaCode, FaGithub, FaGlobe, FaReact, FaNode, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, FaDocker, FaGitAlt, FaLinkedin, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill, RiVuejsFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiFigma, SiVercel, SiPostman,SiMongodb, SiBun, SiExpress, SiNestjs, SiGraphql, SiRedis, SiKubernetes, SiTerraform, SiJest, SiWebpack, SiBabel, SiEslint, SiPrettier, SiSocketdotio, SiStripe, SiChartdotjs, SiAccuweather } from 'react-icons/si'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import AboutMe from '../components/Common/AboutMe'
import Certificates from '../components/Common/Certificates'
import LogoBadge from '../components/Common/LogoBadge'
import { GoGear } from "react-icons/go";
import { usePortfolio } from '../contexts/PortfolioContext';
import Header from '../components/Common/Header'
import { ProjectMediaPlayer } from '../components/Common/VideoPlayer'
// import ScrollProgress from '../components/Common/ScrollProgress'
import Socials from '../components/Products/Socials'
import Tooltip from '@mui/material/Tooltip';

import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { useTheme } from '../contexts/ThemeContext';
import Assistant from '../components/Common/Assistant'
import { usePreloader } from '../contexts/PreloaderContext'
import Snowfall from 'react-snowfall'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar02Icon, EarthIcon, GithubIcon, Linkedin01Icon, NewTwitterRectangleIcon, SourceCodeIcon } from '@hugeicons/core-free-icons';
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

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




const Home = () => {
  // Initialize Cal.com embed
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"30min"});
      cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);
  const [expandedExperience, setExpandedExperience] = useState(0);

  const { data } = usePortfolio();
  const { theme } = useTheme();
  const { isPreloaderComplete } = usePreloader();
  const isDark = theme === 'dark';

  // GSAP Refs
  const mainRef = useRef(null);
  const headerRef = useRef(null);
  const experienceRef = useRef(null);
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);
  const certificatesRef = useRef(null);
  const meetingRef = useRef(null);
  const setupRef = useRef(null);

  // GSAP Animations
  useLayoutEffect(() => {
    if (!isPreloaderComplete) return;

    const ctx = gsap.context(() => {
      // Header section animation
      gsap.fromTo('#home > *', 
        { 
          opacity: 0, 
          y: 30 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out'
        }
      );

      // Experience section
      gsap.fromTo(experienceRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: experienceRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Experience cards stagger
      gsap.fromTo('#experience + div > div',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#experience',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Projects section
      gsap.fromTo(projectsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: projectsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Project cards grid animation
      gsap.fromTo('.project-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.project-card',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // About section
      gsap.fromTo(aboutRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Certificates section
      gsap.fromTo(certificatesRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: certificatesRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Meeting CTA
      gsap.fromTo(meetingRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: meetingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Setup section cards
      gsap.fromTo('.setup-card',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: setupRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

    }, mainRef);

    return () => ctx.revert();
  }, [isPreloaderComplete]);



  // Function to get icon for tech stack
  const getTechIcon = (techName) => {
    // Handle different data types - ensure we have a string
    if (!techName || typeof techName !== 'string') {
      return <FaCode className="text-gray-500" />
    }
    const tech = techName.toLowerCase();
    switch (tech) {
      // Frontend Frameworks
      case 'react':
        return <FaReact className="text-blue-500" />
      case 'next.js':
      case 'nextjs':
        return <RiNextjsFill className="text-zinc-900" />
      case 'vue.js':
      case 'vuejs':
        return <RiVuejsFill className="text-green-500" />
      
      // Styling
      case 'tailwindcss':
      case 'tailwind':
        return <RiTailwindCssFill className="text-sky-500" />
      case 'css':
      case 'css3':
        return <FaCss3Alt className="text-blue-500" />
      case 'html':
      case 'html5':
        return <FaHtml5 className="text-orange-500" />
      
      // Languages
      case 'javascript':
      case 'js':
        return <FaJs className="text-yellow-500" />
      case 'typescript':
      case 'ts':
        return <SiTypescript className="text-blue-600" />
      case 'python':
        return <FaPython className="text-yellow-600" />
      case 'java':
        return <FaJava className="text-red-500" />
      
      // Backend
      case 'node.js':
      case 'nodejs':
      case 'node':
        return <FaNode className="text-green-600" />
      case 'express':
        return <SiExpress className="text-gray-700 dark:text-gray-300" />
      case 'nestjs':
        return <SiNestjs className="text-red-600" />
      
      // Databases
      case 'postgresql':
      case 'postgres':
        return <SiPostgresql className="text-blue-700" />
      case 'mongodb':
      case 'mongo':
        return <SiMongodb className="text-green-500" />
      case 'redis':
        return <SiRedis className="text-red-500" />
      
      // Cloud & DevOps
      case 'aws':
        return <FaAws className="text-orange-500" />
      case 'docker':
        return <FaDocker className="text-blue-500" />
      case 'kubernetes':
      case 'k8s':
        return <SiKubernetes className="text-blue-600" />
      case 'terraform':
        return <SiTerraform className="text-purple-500" />
      
      // Tools & Services
      case 'vercel':
        return <SiVercel className="text-black" />
      case 'figma':
        return <SiFigma className="text-pink-500" />
      case 'git':
        return <FaGitAlt className="text-orange-500" />
      case 'github':
        return <FaGithub className="text-gray-900 dark:text-gray-100" />
      case 'postman':
        return <SiPostman className="text-orange-500" />
      case 'bun':
        return <SiBun className="text-gray-700" />
      case 'express.js':
      case 'expressjs':
        return <SiExpress className="text-gray-700 dark:text-gray-300" />
      
      // Testing & Build Tools
      case 'jest':
        return <SiJest className="text-red-500" />
      case 'webpack':
        return <SiWebpack className="text-blue-500" />
      case 'babel':
        return <SiBabel className="text-yellow-500" />
      case 'eslint':
        return <SiEslint className="text-purple-500" />
      case 'prettier':
        return <SiPrettier className="text-pink-500" />
      
      // APIs & Services
      case 'socket.io':
      case 'socketio':
        return <SiSocketdotio className="text-black" />
      case 'stripe':
        return <SiStripe className="text-blue-600" />
      case 'chart.js':
      case 'chartjs':
        return <SiChartdotjs className="text-orange-500" />
      case 'openweather api':
      case 'openweathermap':
        return <SiAccuweather  className="text-blue-500" />
      
      // State Management
      case 'zustand':
        return <SiTypescript className="text-blue-600" />
      case 'graphql':
        return <SiGraphql className="text-pink-500" />
      
      default:
        return <FaCode className="text-gray-500" />
    }
  };

  // Use backend data instead of dummy data
  const experienceData = data?.workExperience?.filter(exp => exp.featured) || [];
  const projectData = (data?.projects || []).slice(0, 6); // Show only 6 projects on main page
  
  // Debug: Log data to see what we're receiving
  console.log('Home page data:', data)
  console.log('Projects data:', projectData)

    return (
     <div ref={mainRef} className='relative bg-white dark:bg-zinc-950 w-full h-full max-w-2xl mx-auto px-4 lg:px-0 mb-4 overflow-x-hidden'>
       {/* Bottom fade overlay for smoother scroll feel */}
        <Snowfall />
       
       <div className='fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-40 bg-linear-to-t from-white/80 via-white/40 to-transparent dark:from-zinc-950/80 dark:via-zinc-950/40 dark:to-transparent backdrop-blur-[2px]' />
       
       <div id="home" ref={headerRef}>
        <Header />
        <Socials />
        <Spotify />
      </div>


   

      {/* Work */}
      <div id="experience" ref={experienceRef} className='mt-12 mb-2'>
        
        <p className='text-gray-400 dark:text-gray-500 '>Featured.</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Experience</h1>
      </div>
      <div className="mb-8 space-y-6">
        {experienceData.map((exp, idx) => {
          const isExpanded = expandedExperience === idx;
          const isCurrentJob = exp.status === 'Working' || exp.status === 'Current';
          return (
            <div key={exp.id || idx} className="bg-white dark:bg-zinc-950">
              <div className="flex items-start gap-6 py-6">
                {/* Company Logo */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" 
                     style={{ backgroundColor: idx === 0 ? '#ffffff' : idx === 1 ? '#ffffff' : idx === 2 ? '#ffffff' : '#374151' }}>
                  {exp.logo ? (
                    <img src={exp.logo} alt={exp.company} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-black font-bold">{exp.company[0]}</span>
                  )}
                </div>
                
                {/* Main Content */}
                <div className="flex-1 min-w-0 ">
                  <div className="flex flex-col  sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-black dark:text-white truncate">{exp.company}</h3>
                        
                        {isCurrentJob && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white self-start">
                            Working
                          </span>
                        )}
                        <div className="flex items-center gap-2 sm:ml-auto">
                          <Tip title="Website" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors'>
                              <HugeiconsIcon icon={EarthIcon} size={16} />
                            </a>
                          </Tip>
                          <Tip title="X (Twitter)" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors'>
                              <HugeiconsIcon icon={NewTwitterRectangleIcon} size={16} />
                            </a>
                          </Tip>
                          <Tip title="LinkedIn" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors'>
                              <HugeiconsIcon icon={Linkedin01Icon} size={16} />
                            </a>
                          </Tip>
                          <Tip title="GitHub" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors'>
                              <HugeiconsIcon icon={GithubIcon} size={16} />
                            </a>
                          </Tip>
                          <button
                            onClick={() => setExpandedExperience(isExpanded ? null : idx)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                          >
                            {isExpanded ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                        <h4 className="text-zinc-600 dark:text-zinc-600 text-sm font-medium wrap-break-word">{exp.role}</h4>
                    </div>
                    
                    {/* Date and Location */}
                    <div className="md:text-right text-sm text-gray-500 dark:text-gray-400 shrink-0 w-full sm:w-auto gap-2 flex md:flex-col flex-row items-end justify-start ">
                      <div className="font-medium whitespace-nowrap">{exp.start} - {exp.end}</div>
                      <div className="text-xs whitespace-nowrap">{exp.location}</div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-6">
                      {/* Technologies & Tools */}
                      <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 text-sm">Technologies & Tools</h5>
                        <div className="flex flex-wrap gap-4">
                          {exp.tech?.map((tech, i) => {
                            const techValue = typeof tech === 'string' ? tech : tech.icon || tech.name
                            const techLabel = typeof tech === 'string' ? tech : tech.name || tech.icon

                            return (
                              <Tip key={i} title={techLabel} placement="top" arrow isDark={isDark}>
                                <div>
                                  <LogoBadge name={techValue}>
                                    {getTechIcon(techValue)}
                                  </LogoBadge>
                                </div>
                              </Tip>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Responsibilities */}
                      <div>
                        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-400">
                          {exp.bullets?.map((bullet, i) => (
                            <li key={i} className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-3 shrink-0"></span>
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className='w-full flex justify-center items-center mt-8'>
            <Link to="/work" className='text-zinc-900 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100'>Show all Work Experiences </Link>
        </div>
      </div>

    {/* Project */}
    <div id="projects" ref={projectsRef}>

     <div className='mt-12 mb-2'>
        <p className='text-gray-400 dark:text-gray-500'>Featured.</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Projects</h1>
      </div>
      
  

  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 '>
    {projectData.map((project, idx) => (
      <div key={project.id || idx} className='project-card  overflow-hidden backdrop-blur-2xl border-2 shadow-sm hover:shadow-lg border-zinc-200 rounded-3xl p-2 transition-all transform duration-500 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800'>
        
        {/* Project Media */}
        <div className='h-48 w-full  rounded-2xl overflow-hidden outline-1 outline-gray-200 dark:outline-zinc-700 mb-2 cursor-pointer'>
          <ProjectMediaPlayer
            mediaUrl={project.image}
            mediaType={project.mediaType || 'image'}
            alt={project.name}
            className="w-full h-full"
            projectId={project.id || idx}
          />
        </div>

        {/* Project Info */}
        <div className='py-4 px-4'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='font-semibold  text-gray-900 dark:text-white truncate text-xl'>{project.name}</h2>
            {/* Links */}
            <div className='flex items-center gap-2 text-gray-400 dark:text-gray-500'>
              <Tip title="GitHub" placement="top" arrow isDark={isDark}>
                <a href={project.github} target="_blank" rel="noopener noreferrer" className='hover:text-black dark:hover:text-white transition'>
                  <HugeiconsIcon icon={GithubIcon} size={16} />
                </a>
              </Tip>
              <Tip title="Live Demo" placement="top" arrow isDark={isDark}>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className='hover:text-black dark:hover:text-white transition'>
                  <HugeiconsIcon icon={EarthIcon} size={16} />
                </a>
              </Tip>
            </div>
          </div>

          {/* Description - 2 lines max */}
          <p className='text-zinc-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3'>
            {project.description}
          </p>

          {/* Tech Stack - limited */}
          <div className='flex flex-wrap gap-2 mb-3'>
            {project.tech?.slice(0, 4).map((tech, i) => {
              const techValue = typeof tech === 'string' ? tech : tech.icon || tech.name
              const techLabel = typeof tech === 'string' ? tech : tech.name || tech.icon

              return (
                <Tip key={i} title={techLabel} placement="top" arrow isDark={isDark}>
                  <div>
                    <LogoBadge name={techValue}>
                      {getTechIcon(techValue)}
                    </LogoBadge>
                  </div>
                </Tip>
              )
            })}
            {project.tech?.length > 4 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{project.tech.length - 4}</span>
            )}
          </div>

          <span className="text-xs px-2 py-1 rounded-md bg-green-400 dark:bg-green-700 outline-emerald-500 text-green-700 dark:text-emerald-200 font-medium outline-dashed outline-1 shadow-[inset_0_0_10px_rgba(132,204,22,0.8)]">{project.status || 'Live'}</span>
        </div>
      </div>
    ))}
  </div>
          <div className='w-full flex justify-center items-center mt-8'>
            <Link to="/projects" className='text-zinc-900 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100'>Show all Projects</Link>
        </div>
    </div>


    <div id="about" ref={aboutRef} className='mt-8 mb-8'>
        <p className='text-gray-400 dark:text-gray-500'>About</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Me</h1>
      </div>
      <div className='mb-8'>
        <AboutMe />
      </div>

      <div id="certificates" ref={certificatesRef} className='mt-16 mb-8'>
        <p className='text-gray-400 dark:text-gray-500 '>Certificates</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Certificates</h1>
      </div>
      <div className='mb-16'>
        <Certificates />
      </div>




      <div ref={meetingRef} className='mt-8 mb-2'>
        <div className='w-full flex flex-col justify-center items-center p-4 gap-4 border border-gray-200 dark:border-zinc-700 rounded-md border-dashed bg-zinc-100 dark:bg-zinc-900'>
            <p className='text-black dark:text-zinc-200'>Don't be shy to say hello! and give some feedbacks.</p>
            <button 
              data-cal-namespace="30min"
              data-cal-link="subham12r/30min"
              data-cal-config='{"layout":"month_view"}'
              className='text-zinc-900 dark:text-zinc-200 border px-4 py-1 border-dashed border-zinc-200 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800 
                         hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.3),inset_0_0_30px_rgba(255,255,255,0.2)] 
                         dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.1),inset_0_0_30px_rgba(255,255,255,0.1)]
                         hover:border-white/80 dark:hover:border-white/80
                         transition-all duration-300 cursor-pointer flex items-center gap-2 group'
            >
              <HugeiconsIcon icon={Calendar02Icon} size={16}/>
  
          
              Book a Meeting
            </button>
        </div>
      </div>

      <div id="setup" ref={setupRef} className='mt-16 mb-8'>
      <p className='text-gray-400 dark:text-gray-500'>Setup</p>
      <h1 className='text-black dark:text-white font-bold text-3xl'>Development</h1>
        <Link to="/gears">
        <div className='setup-card flex justify-between items-start mt-8 hover:-translate-y-1 hover:shadow-md transition ease-in-out duration-300'>
          <div className='flex bg-transparent border border-gray-200 dark:border-zinc-700 w-full p-2 rounded-xl gap-4'>
            <div className='h-full p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center'>
              <GoGear size={30} className='text-gray-900 dark:text-zinc-200'/>
            </div>
            <div className='ml-2'>
              <h1 className='text-lg font-semibold tracking-tighter dark:text-white'>Gears Used</h1>
              <p className='text-sm tracking-tighter dark:text-zinc-400'>Tools and the setup i use to get the work done.</p>
            </div>
            <div className='ml-auto p-4'>
              <FaArrowRight className='text-sm text-gray-400 dark:text-zinc-500 hover:translate-x-2 transition duration-200 ease-in-out'/>
            </div>
          </div>
        </div>
        </Link>

        <Link to="/setup">
        <div className='setup-card flex justify-between items-start mt-6 hover:-translate-y-1 hover:shadow-md transition ease-in-out duration-300'>
          <div className='flex bg-transparent border border-gray-200 dark:border-zinc-700 w-full p-2 rounded-xl gap-4'>
            <div className='p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl h-full flex items-center justify-center'>
              <HugeiconsIcon icon={SourceCodeIcon} size={30} className='text-gray-900 dark:text-zinc-200'/>
            </div>
            <div className='ml-2'>
              <h1 className='text-lg font-semibold tracking-tighter dark:text-white'>Cursor Setup</h1>
              <p className='text-sm tracking-tighter dark:text-zinc-400'>My IDE setup for my development environment.</p>
            </div>
            <div className='ml-auto p-4'>
              <FaArrowRight className='text-sm text-gray-400 dark:text-zinc-500 hover:translate-x-2 transition duration-200 ease-in-out'/>
            </div>
          </div>
        </div>
        </Link>
      </div>
      
  
    {isPreloaderComplete && <Assistant />}
    {/* <ScrollProgress /> */}
    </div>
  )
}

export default Home