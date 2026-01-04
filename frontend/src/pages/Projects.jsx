import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { FaReact, FaAws, FaNode, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, FaDocker, FaGitAlt, FaGithub } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill, RiNodejsFill, RiVuejsFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiVercel, SiMongodb, SiExpress, SiNestjs, SiGraphql, SiRedis, SiKubernetes, SiTerraform, SiJest, SiWebpack, SiBabel, SiEslint, SiPrettier, SiSocketdotio, SiStripe, SiChartdotjs, SiAccuweather, SiFigma, SiPostman, SiBun } from 'react-icons/si'
import { usePortfolio } from '../contexts/PortfolioContext'
import { ProjectMediaPlayer } from '../components/Common/VideoPlayer'
import LogoBadge from '../components/Common/LogoBadge'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HugeiconsIcon } from '@hugeicons/react'
import { EarthIcon, GithubIcon } from '@hugeicons/core-free-icons'
import { Return } from '../components/Products/Return'
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Dummy project data - COMMENTED OUT - now using backend data
/* const projectData = [
  {
    id: 1,
    name: 'E-Commerce Platform',
    category: 'Full Stack',
    date: 'January 2025',
    image: 'https://picsum.photos/800/400',
    description: 'A comprehensive e-commerce platform with user authentication, product management, shopping cart, and payment integration. Built with modern tech stack for scalability and performance.',
    github: 'https://github.com/username/project1',
    liveUrl: 'https://project1-demo.vercel.app',
    tech: [
      { name: 'Next.js', icon: <RiNextjsFill className="text-black" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'Tailwind CSS', icon: <RiTailwindCssFill className="text-sky-600" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
      { name: 'Vercel', icon: <SiVercel className="text-black" /> },
    ],
    features: [
      'User authentication and authorization',
      'Product catalog with search and filters',
      'Shopping cart and checkout process',
      'Payment integration with Stripe',
      'Admin dashboard for product management',
      'Order tracking and history'
    ]
  },
  {
    id: 2,
    name: 'Real-time Chat Application',
    category: 'Full Stack',
    date: 'December 2024',
    image: 'https://picsum.photos/801/401',
    description: 'A real-time messaging application with group chat, file sharing, and user presence indicators. Features include message reactions, typing indicators, and message search.',
    github: 'https://github.com/username/project2',
    liveUrl: 'https://project2-demo.vercel.app',
    tech: [
      { name: 'React', icon: <FaReact className="text-blue-500" /> },
      { name: 'Node.js', icon: <RiNodejsFill className="text-emerald-500" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
    ],
    features: [
      'Real-time messaging with WebSocket',
      'Group chat functionality',
      'File and image sharing',
      'Online/offline status indicators',
      'Message reactions and emoji support',
      'Dark mode support'
    ]
  },
  {
    id: 3,
    name: 'Cloud Storage Service',
    category: 'Backend',
    date: 'November 2024',
    image: 'https://picsum.photos/802/402',
    description: 'A cloud storage service similar to Dropbox with file upload, organization, sharing, and collaboration features. Secure file storage with encryption.',
    github: 'https://github.com/username/project3',
    liveUrl: 'https://project3-demo.vercel.app',
    tech: [
      { name: 'Next.js', icon: <RiNextjsFill className="text-black" /> },
      { name: 'AWS', icon: <FaAws className="text-yellow-500" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
    ],
    features: [
      'File upload and organization',
      'Shared folders and collaboration',
      'Version control for files',
      'End-to-end encryption',
      'File preview and download',
      'Activity logs and audit trail'
    ]
  },
  {
    id: 4,
    name: 'Task Management Tool',
    category: 'Frontend',
    date: 'October 2024',
    image: 'https://picsum.photos/803/403',
    description: 'A Kanban-style task management application with boards, lists, and cards. Features drag-and-drop functionality and team collaboration.',
    github: 'https://github.com/username/project4',
    liveUrl: 'https://project4-demo.vercel.app',
    tech: [
      { name: 'React', icon: <FaReact className="text-blue-500" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'Tailwind CSS', icon: <RiTailwindCssFill className="text-sky-600" /> },
    ],
    features: [
      'Drag and drop cards',
      'Multiple boards and lists',
      'Task assignment and due dates',
      'Comments and attachments',
      'Activity tracking',
      'Real-time updates'
    ]
  },
  {
    id: 5,
    name: 'Social Media Dashboard',
    category: 'Full Stack',
    date: 'September 2024',
    image: 'https://picsum.photos/804/404',
    description: 'A social media analytics dashboard that aggregates data from multiple platforms and provides insights, metrics, and reporting features.',
    github: 'https://github.com/username/project5',
    liveUrl: 'https://project5-demo.vercel.app',
    tech: [
      { name: 'Next.js', icon: <RiNextjsFill className="text-black" /> },
      { name: 'TypeScript', icon: <SiTypescript className="text-blue-500" /> },
      { name: 'PostgreSQL', icon: <SiPostgresql className="text-blue-700" /> },
    ],
    features: [
      'Multi-platform integration',
      'Real-time analytics',
      'Customizable reports',
      'Scheduled posts',
      'Engagement metrics',
      'Trending content insights'
    ]
  }
] */

const Projects = () => {
  const [expandedProject, setExpandedProject] = useState(null)
  const { data, loading, error } = usePortfolio()
  
  // GSAP Refs
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsContainerRef = useRef(null)
  const expandedRefs = useRef([])

  // Use backend data instead of dummy data
  const projectData = data?.projects || []
  const hasProjects = projectData && projectData.length > 0

  // Initialize refs array
  useEffect(() => {
    expandedRefs.current = expandedRefs.current.slice(0, projectData.length)
  }, [projectData.length])

  // GSAP Animations
  useLayoutEffect(() => {
    // Only run animations if we have projects data
    if (!hasProjects || loading) return

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Ensure elements are visible first
        gsap.set([headerRef.current, '.project-card'], { opacity: 1 });
        
        // Header animation
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
          }
        );

        // Project cards stagger animation - check if cards exist
        const projectCards = document.querySelectorAll('.project-card');
        if (projectCards.length > 0) {
          gsap.fromTo('.project-card',
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: cardsContainerRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

      }, sectionRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [hasProjects, loading])
  
  // Function to get icon for tech stack
  const getTechIcon = (techName) => {
    // Handle different data types - ensure we have a string
    if (!techName || typeof techName !== 'string') {
      return <FaReact className="text-gray-500" />
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
        return <SiAccuweather className="text-blue-500" />
      
      // State Management
      case 'zustand':
        return <SiTypescript className="text-blue-600" />
      case 'graphql':
        return <SiGraphql className="text-pink-500" />
      
      default:
        return <FaReact className="text-gray-500" />
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <Return />
        <div className="mb-12">
          <p className="text-gray-400 dark:text-gray-500 mb-2">Portfolio</p>
          <h1 className="text-black dark:text-white font-bold text-3xl mb-2 underline-offset-4 underline decoration-dashed">My Projects</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-3 leading-relaxed">
            Loading projects...
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden animate-pulse">
              <div className="bg-gray-200 dark:bg-zinc-800 h-48 w-full"></div>
              <div className="p-4">
                <div className="bg-gray-200 dark:bg-zinc-800 h-6 w-2/3 rounded mb-2"></div>
                <div className="bg-gray-200 dark:bg-zinc-800 h-4 w-1/3 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <Return />
        <div className="mb-12">
          <p className="text-gray-400 dark:text-gray-500 mb-2">Portfolio</p>
          <h1 className="text-black dark:text-white font-bold text-3xl mb-2 underline-offset-4 underline decoration-dashed">My Projects</h1>
          <p className="text-red-600 dark:text-red-400 mt-3 leading-relaxed">
            Error loading projects. Please try again later.
          </p>
        </div>
      </section>
    )
  }

  // Show empty state
  if (!hasProjects) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <Return />
        <div className="mb-12">
          <p className="text-gray-400 dark:text-gray-500 mb-2">Portfolio</p>
          <h1 className="text-black dark:text-white font-bold text-3xl mb-2 underline-offset-4 underline decoration-dashed">My Projects</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-3 leading-relaxed">
            No projects available at the moment.
          </p>
        </div>
      </section>
    )
  }
  const toggleProject = (index) => {
    const targetElement = expandedRefs.current[index]
    if (!targetElement) return

    if (expandedProject === index) {
      // Collapse animation
      gsap.to(targetElement, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          setExpandedProject(null)
        }
      })
    } else {
      // Collapse any currently expanded project first
      if (expandedProject !== null) {
        const currentExpanded = expandedRefs.current[expandedProject]
        if (currentExpanded) {
          gsap.to(currentExpanded, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
          })
        }
      }

      // Expand animation
      setExpandedProject(index)
      
      // Set initial state and get natural height
      gsap.set(targetElement, {
        height: 'auto'
      })
      const naturalHeight = targetElement.scrollHeight
      
      // Animate to expanded state
      gsap.fromTo(targetElement, 
        {
          height: 0,
          opacity: 0
        },
        {
          height: naturalHeight,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        }
      )
    }
  }

  return (
    <section ref={sectionRef} className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <Return />
      
      <div ref={headerRef} className="mb-12">

        <p className="text-gray-400 dark:text-gray-500 mb-2">Portfolio</p>
        <h1 className="text-black dark:text-white font-bold text-3xl mb-2 underline-offset-4 underline decoration-dashed">My Projects</h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-3 leading-relaxed">
          A collection of web applications and projects I've built using modern technologies.
        </p>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
          Total Projects: {projectData.length}
        </p>
      </div>

      <div ref={cardsContainerRef} className="space-y-6">
        {projectData.map((project, index) => {
          const isExpanded = expandedProject === index
          
          return (
            <div
              key={project.id}
              className="project-card bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden opacity-100"
              style={{ visibility: 'visible' }}
            >
              {/* Project Media - Always visible */}
              <div className="rounded-t-xl overflow-hidden border-b border-gray-200 dark:border-zinc-700">
                <ProjectMediaPlayer
                  mediaUrl={project.image}
                  mediaType={project.mediaType || 'image'}
                  alt={project.name}
                  className="w-full h-auto"
                  projectId={project.id}
                />
              </div>

              {/* Project Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-black dark:text-white truncate">
                      {project.name}
                    </h3>
                    {project.status && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                        project.status === 'Working' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {project.status}
                      </span>
                    )}
                  </div>
                  
                  {/* Links on right */}
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        title="View Code"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HugeiconsIcon icon={GithubIcon} size={20} />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        title="Live Demo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HugeiconsIcon icon={EarthIcon} size={20} />
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Category and Date */}
                <div className="flex items-center justify-between mt-1 text-sm text-gray-500 dark:text-zinc-500">
                  <span>{project.category}</span>
                  <span>{project.date}</span>
                </div>

                {/* Read More Button */}
                <button
                  className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  onClick={() => toggleProject(index)}
                >
                  {isExpanded ? (
                    <>
                      <span>Show Less</span>
                      <HiChevronUp className="text-lg transition-transform duration-300" />
                    </>
                  ) : (
                    <>
                      <span>Read More</span>
                      <HiChevronDown className="text-lg transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              <div 
                ref={el => expandedRefs.current[index] = el}
                className="overflow-hidden"
                style={{ height: 0, opacity: 0 }}
              >
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-zinc-400 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
                      Technologies & Tools
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {project.tech && Array.isArray(project.tech) ? project.tech.map((tech, i) => {
                        const techValue = typeof tech === 'string' ? tech : tech?.icon || tech?.name || 'Unknown'
                        const techLabel = typeof tech === 'string' ? tech : tech?.name || tech?.icon || 'Unknown'

                        return (
                          <div key={i} title={techLabel} className="cursor-pointer">
                            <LogoBadge name={techValue}>
                              {getTechIcon(techValue)}
                            </LogoBadge>
                          </div>
                        );
                      }) : (
                        <div className="text-sm text-gray-500">No tech stack information available</div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
                      Key Features
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-zinc-400 text-sm leading-relaxed space-y-2">
                      {project.features && Array.isArray(project.features) ? project.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      )) : (
                        <li className="text-gray-500">No features information available</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Projects
