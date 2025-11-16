import React, { useState } from 'react'
import { FaAws, FaGithub, FaGlobe, FaReact, FaLinkedin } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiFigma, SiVercel, SiPostman, SiBun, SiNodedotjs, SiExpress } from 'react-icons/si'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { usePortfolio } from '../contexts/PortfolioContext'
import { useTheme } from '../contexts/ThemeContext'
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { SiMongodb, SiRedis, SiDocker,  } from 'react-icons/si'
import { FaGitAlt, } from 'react-icons/fa'
import LogoBadge from '../components/Common/LogoBadge'

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

// Dummy experience data - COMMENTED OUT - now using backend data
/* const experienceData = [
  {
    company: 'Adamas University',
    logo: 'https://picsum.photos/200',
    role: 'Founding Frontend Engineer',
    status: 'Working',
    featured: true,
    start: 'August 2025',
    end: 'Present',
    location: 'United States (Remote)',
    tech: [
      { name: 'Next.js', icon: <RiNextjsFill className="text-black" /> },
      { name: 'Tailwind CSS', icon: <RiTailwindCssFill className="text-sky-600" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'React', icon: <FaReact className="text-blue-500" /> },
      { name: 'Figma', icon: <SiFigma className="text-pink-500" /> },
      { name: 'Vercel', icon: <SiVercel className="text-black" /> },
      { name: 'AWS', icon: <FaAws className="text-yellow-500" /> },
      { name: 'Postman', icon: <SiPostman className="text-orange-500" /> },
      { name: 'Bun', icon: <SiBun className="text-gray-700" /> },
    ],
    bullets: [
      'Architected and developed the complete frontend infrastructure for the platform, a comprehensive solution for creating and managing promotional campaigns.',
      'Led a comprehensive codebase refactoring initiative that improved maintainability, scalability, and development velocity across the entire platform.',
      'Integrated and optimized backend API connections, implementing efficient data fetching strategies and error handling mechanisms.',
      'Enhanced user experience and interface design through implementation of consistent design systems, accessibility standards, and performance optimizations.'
    ]
  },
  {
    company: 'Upsurge Labs',
    logo: 'https://picsum.photos/201',
    role: 'Backend Developer Intern',
    status: 'Completed',
    featured: true,
    start: 'June 2025',
    end: 'July 2025',
    location: 'Bangalore, India (On-Site)',
    tech: [
      { name: 'React', icon: <FaReact className="text-blue-500" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
      { name: 'Node.js', icon: <SiNodedotjs className="text-green-500" /> },
    ],
    bullets: [
      'Developed and maintained backend services for a fintech platform.',
      'Optimized database queries and improved API response times by 40%.',
      'Collaborated with cross-functional teams to deliver new features.'
    ]
  },
  {
    company: 'Prepeasy',
    logo: 'https://picsum.photos/202',
    role: 'Founding Engineer',
    status: 'Completed',
    featured: true,
    start: 'April 2025',
    end: 'June 2025',
    location: 'Remote (India)',
    tech: [
      { name: 'Next.js', icon: <RiNextjsFill className="text-black" /> },
      { name: 'Tailwind CSS', icon: <RiTailwindCssFill className="text-sky-600" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
    ],
    bullets: [
      'Built MVP for an educational platform from scratch.',
      'Designed and implemented user authentication and authorization systems.',
      'Led technical architecture decisions and mentored junior developers.'
    ]
  },
  {
    company: 'Expelee',
    logo: 'https://picsum.photos/203',
    role: 'SDE-1 (Full Stack) Intern',
    status: 'Completed',
    featured: true,
    start: 'Aug 2023',
    end: 'April 2025',
    location: 'Dubai, UAE (Remote)',
    tech: [
      { name: 'React', icon: <FaReact className="text-blue-500" /> },
      { name: 'Node.js', icon: <SiNodedotjs className="text-green-500" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
    ],
    bullets: [
      'Developed full-stack features for an e-commerce platform.',
      'Implemented real-time chat functionality using WebSockets.',
      'Wrote comprehensive unit and integration tests.'
    ]
  }
] */

const Work = () => {
  const { data } = usePortfolio()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [expandedExperience, setExpandedExperience] = useState(0)
  
  // Use backend data instead of dummy data
  const experienceData = data?.workExperience || []

  // Function to get icon for tech stack
  const getTechIcon = (techName) => {
    if (!techName || typeof techName !== 'string') {
      return <FaReact className="text-gray-500" />
    }
    const tech = techName.toLowerCase();
    switch (tech) {
      case 'react':
        return <FaReact className="text-blue-500" />
      case 'next.js':
      case 'nextjs':
        return <RiNextjsFill className="text-zinc-900" />
      case 'tailwindcss':
      case 'tailwind':
        return <RiTailwindCssFill className="text-sky-500" />
      case 'typescript':
      case 'ts':
        return <SiTypescript className="text-blue-600" />
      case 'postgresql':
      case 'postgres':
        return <SiPostgresql className="text-blue-700" />
      case 'figma':
        return <SiFigma className="text-pink-500" />
      case 'vercel':
        return <SiVercel className="text-black" />
      case 'aws':
        return <FaAws className="text-orange-500" />
      case 'postman':
        return <SiPostman className="text-orange-500" />
      case 'bun':
        return <SiBun className="text-gray-700" />
      case 'node.js':
      case 'nodejs':
      case 'node':
        return <SiNodedotjs className="text-green-500" />
      case 'mongodb':
        return <SiMongodb className="text-green-500" />
      case 'redis':
        return <SiRedis className="text-red-500" />
      case 'docker':
        return <SiDocker className="text-blue-500" />
      case 'express':
      case 'express.js':
      case 'expressjs':
        return <SiExpress className="text-gray-700 dark:text-gray-300" />
      case 'github':
        return <FaGithub className="text-gray-900 dark:text-gray-100" />
      case 'git':
        return <FaGitAlt className="text-orange-500" />
      default:
        return <FaReact className="text-gray-500" />
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mb-8">
        <p className="text-gray-400 dark:text-gray-500 mb-2">Career</p>
        <h1 className="text-black dark:text-white font-bold text-3xl">Work Experience</h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-2">
          My professional journey and the companies I've had the privilege to work with.
        </p>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
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
                            <a href={exp.website || ""} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaGlobe className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="X (Twitter)" placement="top" arrow isDark={isDark}>
                            <a href={exp.twitter || ""} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaSquareXTwitter className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="LinkedIn" placement="top" arrow isDark={isDark}>
                            <a href={exp.linkedin || ""} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                              <FaLinkedin className="w-4 h-4" />
                            </a>
                          </Tip>
                          <Tip title="GitHub" placement="top" arrow isDark={isDark}>
                            <a href={exp.github || ""} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
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
                        <div className="flex flex-wrap gap-3">
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
      </div>
    </section>
  )
}

export default Work