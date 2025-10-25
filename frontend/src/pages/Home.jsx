import React, { useState, useEffect } from 'react'
import Spotify from '../components/Products/Spotify'
import { FaArrowLeft, FaArrowRight, FaAws, FaCode, FaGithub, FaGlobe, FaReact, FaNode, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, FaDocker, FaGitAlt } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill, RiVuejsFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiFigma, SiVercel, SiPostman, SiBun, SiMongodb, SiExpress, SiNestjs, SiGraphql, SiRedis, SiKubernetes, SiTerraform, SiJest, SiWebpack, SiBabel, SiEslint, SiPrettier, SiSocketdotio, SiStripe, SiChartdotjs, SiAccuweather } from 'react-icons/si'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import AboutMe from '../components/Common/AboutMe'
import Certificates from '../components/Common/Certificates'
import { GoGear } from "react-icons/go";
import { usePortfolio } from '../contexts/PortfolioContext';
import Header from '../components/Common/Header'
// Dummy data - now using backend data via PortfolioContext
// const experienceData = [...]
// const projectData = [...]

const Home = () => {
  const [expandedExperience, setExpandedExperience] = useState(0);
  const [expandedProjects, setExpandedProjects] = useState({});
  const { data, isLoading, error } = usePortfolio();

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
        return <RiNextjsFill className="text-black" />
      case 'vue.js':
      case 'vuejs':
        return <RiVuejsFill className="text-green-500" />
      
      // Styling
      case 'tailwind css':
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
        return <SiExpress className="text-gray-600" />
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
      case 'postman':
        return <SiPostman className="text-orange-500" />
      case 'bun':
        return <SiBun className="text-gray-700" />
      
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
      <div className="mb-4">
        {experienceData.map((exp, idx) => {
          const isExpanded = expandedExperience === idx;
          return (
                              <div key={exp.id || idx} className="bg-white dark:bg-zinc-950 rounded-xl mb-2 border border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-3 mb-2 p-2">
                {/* Logo */}
                <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xl font-bold">
                  {exp.logo ? <img src={exp.logo} alt={exp.company} className="w-10 h-10 object-cover rounded" /> : exp.company[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-black dark:text-white">{exp.company}</span>
                    <a href="" className='text-gray-500 dark:text-gray-400 text-lg hover:text-black dark:hover:text-white transition'><FaGlobe /></a>
                    <a href="" className='text-gray-500 dark:text-gray-400 text-lg hover:text-black dark:hover:text-white transition'><FaGithub /></a>
                    {!isExpanded && (
                      <button
                      onClick={() => setExpandedExperience(idx)}
                      className="text-gray-400 hover:text-black transition "
                      >
                        <HiChevronDown className="text-xl" />
                      </button>
                    )}
                    {isExpanded && (
                      <button
                      onClick={() => setExpandedExperience(null)}
                      className="text-gray-400 hover:text-black transition "
                      >
                        <HiChevronUp className="text-xl" />
                      </button>
                    )}
                    {isExpanded && <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium border border-green-200">{exp.status}</span>}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{exp.role}</div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
                  <div>{exp.start} - {exp.end}</div>
                  <div>{exp.location}</div>
                </div>
              </div>
              {isExpanded && (
                <div className="px-2 pb-2">
                  <div className="mb-2">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-md">Technologies &amp; Tools</div>
                    <div className="flex flex-wrap gap-2">
                      {exp.tech?.map((tech, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                          {getTechIcon(tech.name || tech)}
                          <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{tech.name || tech}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-1">
                    {exp.bullets?.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
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
      <div key={project.id || idx} className='rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-zinc-950 dark:border-zinc-800'>
        
        {/* Project Image */}
        <div className='h-48 w-full bg-gray-100 dark:bg-zinc-800'>
          <img
            src={project.image || 'https://picsum.photos/200'}
            alt={project.name}
            className='w-full h-full object-cover'
            onLoad={() => console.log('Home page image loaded:', project.image || 'fallback')}
            onError={(e) => console.error('Home page image failed to load:', project.image, e)}
          />
        </div>

        {/* Project Info */}
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <h2 className='font-semibold text-xl text-gray-900 dark:text-white'>{project.name}</h2>
                 {/* Links */}
          <div className='flex items-center gap-3 text-gray-400 dark:text-gray-500 text-lg'>
            <a href={project.github} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 hover:text-black dark:hover:text-white transition'>
              <FaGithub />
            </a>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 hover:text-black dark:hover:text-white transition'>
              <FaGlobe /> 
            </a>
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
          <div className='flex flex-wrap gap-2 mb-3'>
            <p className='text-gray-600 dark:text-gray-400 text-sm w-full'>Technologies &amp; Tools</p>
            {project.tech?.map((tech, i) => (
              <span key={i} className='inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors'>
                {getTechIcon(tech.name || tech)}
                <span className='text-sm font-medium text-gray-700 dark:text-zinc-300'>{tech.name || tech}</span>
              </span>
            ))}
          </div>

             <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium border border-green-200">{project.status || 'Completed'}</span>
     
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
            <p className='text-black dark:text-zinc-200'>Hey,hope you enjoyed my portfolio. Lets Talk.</p>
            <button className='text-zinc-900 dark:text-zinc-200 border  px-4 py-1 border-dashed border-zinc-200 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-800 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100 cursor-pointer'>Get in Touch</button>
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


    </div>
  )
}

export default Home