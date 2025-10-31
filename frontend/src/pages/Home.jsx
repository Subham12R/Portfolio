import React, { useState, useEffect } from 'react'
import Spotify from '../components/Products/Spotify'
import { FaArrowLeft, FaArrowRight, FaAws, FaCode, FaGithub, FaGlobe, FaReact, FaNode, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, FaDocker, FaGitAlt, FaLinkedin, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill, RiVuejsFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiFigma, SiVercel, SiPostman,SiMongodb, SiBun, SiExpress, SiNestjs, SiGraphql, SiRedis, SiKubernetes, SiTerraform, SiJest, SiWebpack, SiBabel, SiEslint, SiPrettier, SiSocketdotio, SiStripe, SiChartdotjs, SiAccuweather } from 'react-icons/si'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import AboutMe from '../components/Common/AboutMe'
import Certificates from '../components/Common/Certificates'
import { GoGear } from "react-icons/go";
import { usePortfolio } from '../contexts/PortfolioContext';
import Header from '../components/Common/Header'
import { ProjectMediaPlayer } from '../components/Common/VideoPlayer'

import Tooltip from '@mui/material/Tooltip';

import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { useTheme } from '../contexts/ThemeContext';
import { FaSquareXTwitter } from 'react-icons/fa6'
import Assistant from '../components/Common/Assistant'

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

// Random quotes data
const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  },
  {
    text: "The most disastrous thing that you can ever learn is your first programming language.",
    author: "Alan Kay"
  }
];

// Dummy data - now using backend data via PortfolioContext
// const experienceData = [...]
// const projectData = [...]

const Home = () => {
  const [expandedExperience, setExpandedExperience] = useState(0);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [randomQuote, setRandomQuote] = useState(null);
  const { data, isLoading, error } = usePortfolio();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Select a random quote on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomIndex]);
  }, []);


  // Function to toggle project description
  const toggleProjectDescription = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };


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
  const projectData = data?.projects || []; // Show all projects for now
  
  // Debug: Log data to see what we're receiving
  console.log('Home page data:', data)
  console.log('Projects data:', projectData)

  if (isLoading) {
    return (
      <div className='bg-white w-full h-full lg:max-w-2xl mx-auto px-4 py-4 mb-2'>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white w-full h-full lg:max-w-2xl mx-auto px-4 py-4 mb-2'>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading portfolio data: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto px-4 py-4 mb-2'>
      <Header />
      <Spotify />
  

      {/* Work */}
      <div className='mt-8 mb-8'>
        <p className='text-gray-400 dark:text-gray-500'>Featured.</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Experience</h1>
      </div>
      <div className="mb-4 space-y-4">
        {experienceData.map((exp, idx) => {
          const isExpanded = expandedExperience === idx;
          const isCurrentJob = exp.status === 'Working' || exp.status === 'Current';
          return (
            <div key={exp.id || idx} className="bg-white dark:bg-zinc-950">
              <div className="flex items-start gap-4 py-4">
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
                <div className="flex-1 min-w-0">
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
                            <a href="" className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaGlobe className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="X (Twitter)" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaSquareXTwitter className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="LinkedIn" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaLinkedin className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="GitHub" placement="top" arrow isDark={isDark}>
                            <a href="" className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaGithub className="w-4 h-4" />
                            </a>
                          </Tip>
                          <button
                            onClick={() => setExpandedExperience(isExpanded ? null : idx)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {isExpanded ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                        <h4 className="text-gray-600 dark:text-gray-400 text-sm font-medium break-words">{exp.role}</h4>
                    </div>
                    
                    {/* Date and Location */}
                    <div className="md:text-right text-sm text-gray-500 dark:text-gray-400 shrink-0 w-full sm:w-auto gap-2 flex md:flex-col flex-row items-end justify-start ">
                      <div className="font-medium whitespace-nowrap">{exp.start} - {exp.end}</div>
                      <div className="text-xs whitespace-nowrap">{exp.location}</div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      {/* Technologies & Tools */}
                      <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">Technologies & Tools</h5>
                        <div className="flex flex-wrap gap-2">
                          {exp.tech?.map((tech, i) => (
                            <span key={i} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-500/20 border border-dashed border-gray-200 dark:border-zinc-700  px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300">
                              {getTechIcon(tech.name || tech)}
                              <span>{tech.name || tech}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Responsibilities */}
                      <div>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
        
        <div className='w-full flex justify-center items-center mt-4'>
            <Link to="/work" className='text-zinc-900 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-md bg-gray-50 dark:bg-zinc-900 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100'>Show all Work Experiences </Link>
        </div>
      </div>

    {/* Project */}
    <div>

     <div className='mt-8 mb-8'>
        <p className='text-gray-400 dark:text-gray-500'>Featured.</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Projects</h1>
      </div>
      
  

  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 cursor-pointer'>
    {projectData.map((project, idx) => (
      <div key={project.id || idx} className='rounded-xl overflow-hidden border border-gray-200  shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-950 dark:border-zinc-800'>
        
        {/* Project Media */}
        <div className='h-48 w-full bg-gray-100 dark:bg-zinc-800'>
          <ProjectMediaPlayer
            mediaUrl={project.image}
            mediaType={project.mediaType || 'image'}
            alt={project.name}
            className="w-full h-full"
            projectId={project.id || idx}
          />
        </div>

        {/* Project Info */}
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <h2 className='font-semibold text-xl text-gray-900 dark:text-white'>{project.name}</h2>
                 {/* Links */}
          <div className='flex items-center gap-3 text-gray-400 dark:text-gray-500 text-lg'>
            <Tip title="View github repository" placement="top" arrow isDark={isDark}>
            <a href={project.github} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 hover:text-black dark:hover:text-white transition'>
              <FaGithub />
            </a>
            </Tip>
            <Tip title="View project website" placement="top" arrow isDark={isDark}>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 hover:text-black dark:hover:text-white transition'>
              <FaGlobe /> 
            </a>
            </Tip>
          </div>
           
          </div>

          <div className='mt-1 mb-3'>
            <p className='text-gray-600 dark:text-gray-400 text-md font-medium'>
              {expandedProjects[project.id] 
                ? project.description 
                : project.description?.length > 100 
                  ? `${project.description.substring(0, 100)}...` 
                  : project.description
              }
            </p>
            {project.description?.length > 100 && (
              <button
                onClick={() => toggleProjectDescription(project.id)}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 transition-colors'
              >
                {expandedProjects[project.id] ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Tech Stack */}
          <div className='flex flex-wrap gap-2 mb-4'>
            <p className='text-gray-600 dark:text-gray-400 text-sm w-full'>Technologies &amp; Tools</p>
            {project.tech?.map((tech, i) => (
              <span key={i} className='flex items-center justify-center flex-col gap-4 text-3xl px-1 '>
                {getTechIcon(tech.name || tech)}
               
              </span>
            ))}
          </div>

             <span className="text-xs px-2 py-1 rounded-md bg-green-500 text-emerald-900 font-medium ">{project.status || 'Completed'}</span>
     
        </div>
      </div>
    ))}
  </div>
          <div className='w-full flex justify-center items-center mt-4'>
            <Link to="/projects" className='text-zinc-900 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-md bg-gray-50 dark:bg-zinc-900 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100'>Show all Projects</Link>
        </div>
    </div>


    <div className='mt-8 mb-8'>
        <p className='text-gray-400 dark:text-gray-500'>About</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Me</h1>
      </div>
      <AboutMe />

      <div className='mt-8 mb-8'>
        <p className='text-gray-400 dark:text-gray-500'>Certificates</p>
        <h1 className='text-black dark:text-white font-bold text-3xl'>Certificates</h1>
      </div>
      <Certificates />




      <div className='mt-8 mb-8'>
        <div className='w-full flex flex-col justify-center items-center p-10 gap-2 border border-gray-200 dark:border-zinc-700 rounded-md border-dashed bg-white dark:bg-zinc-900'>
            <p className='text-black dark:text-zinc-200'>Hey Scrolled So Far? Lets Connect!</p>
            <Tip title="Checkout my Topmate profile" placement="top" arrow isDark={isDark}>
            <a href="https://topmate.io/subham12r" target="_blank" rel="noopener noreferrer" className='text-zinc-900 dark:text-zinc-200 border  px-4 py-1 border-dashed border-zinc-200 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100 cursor-pointer'>
            Get in Touch
            </a>
            </Tip>
        </div>
      </div>

      <div className='mt-8 mb-8'>
      <p className='text-gray-400 dark:text-gray-500'>Setup</p>
      <h1 className='text-black dark:text-white font-bold text-3xl'>Development</h1>
        <Link to="/gears">
        <div className='flex justify-between items-start mt-6 hover:-translate-y-1 hover:shadow-md transition ease-in-out duration-300'>
          <div className='flex bg-transparent border border-gray-200 dark:border-zinc-700 w-full p-4 rounded-md'>
            <div className='h-full p-2 bg-gray-100 dark:bg-zinc-800 rounded'>
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
        <div className='flex justify-between items-start mt-6 hover:-translate-y-1 hover:shadow-md transition ease-in-out duration-300'>
          <div className='flex bg-transparent border border-gray-200 dark:border-zinc-700 w-full p-4 rounded-md'>
            <div className='h-full p-2 bg-gray-100 dark:bg-zinc-800 rounded'>
              <FaCode size={30} className='text-gray-900 dark:text-zinc-200'/>
            </div>
            <div className='ml-2'>
              <h1 className='text-lg font-semibold tracking-tighter dark:text-white'>IDE Setup</h1>
              <p className='text-sm tracking-tighter dark:text-zinc-400'>This VSCODE / Cursor setup helps me complete my workflow swiftly.</p>
            </div>
            <div className='ml-auto p-4'>
              <FaArrowRight className='text-sm text-gray-400 dark:text-zinc-500 hover:translate-x-2 transition duration-200 ease-in-out'/>
            </div>
          </div>
        </div>
        </Link>
      </div>
      
      {/* Random Quote Section */}
      {randomQuote && (
        <div className='mt-8 mb-8 relative'>
          <div className='relative p-8 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700'>
            {/* Large quotation mark background */}
            <div className='absolute top-5 left-12 text-8xl text-gray-300 dark:text-zinc-700 font-serif opacity-30 select-none pointer-events-none'>
              <FaQuoteLeft size={40} className='text-gray-300 dark:text-zinc-700' />
            </div>
            
            {/* Quote content */}
            <div className='relative z-10 text-center justify-center items-center'>
              <blockquote className='text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-medium'>
                {randomQuote.text}
              </blockquote>
              <cite className='text-sm text-gray-600 dark:text-gray-400 font-normal not-italic'>
                — {randomQuote.author}
              </cite>
            </div>
          </div>
        </div>
      )}
    {/* <Assistant /> */}

    </div>
  )
}

export default Home