import React, { useState, useEffect } from 'react'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { FaGithub, FaGlobe, FaReact, FaAws, FaNode, FaHtml5, FaCss3Alt, FaJs, FaPython, FaJava, FaDocker, FaGitAlt } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill, RiNodejsFill, RiVuejsFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiVercel, SiMongodb, SiExpress, SiNestjs, SiGraphql, SiRedis, SiKubernetes, SiTerraform, SiJest, SiWebpack, SiBabel, SiEslint, SiPrettier, SiSocketdotio, SiStripe, SiChartdotjs, SiAccuweather, SiFigma, SiPostman, SiBun } from 'react-icons/si'
import { usePortfolio } from '../contexts/PortfolioContext'

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
  const [expandedProject, setExpandedProject] = useState(0)
  const { data, isLoading, error } = usePortfolio()
  
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
  
  // Use backend data instead of dummy data
  const projectData = data?.projects || []
  
  // Debug: Log project data to see what we're receiving
  console.log('Project data from backend:', projectData)
  console.log('First project image URL:', projectData[0]?.image)
  console.log('First project status:', projectData[0]?.status)

  const toggleProject = (index) => {
    if (expandedProject === index) {
      setExpandedProject(null)
    } else {
      setExpandedProject(index)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading projects...</p>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading projects: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mb-8">
        <p className="text-gray-400 dark:text-gray-500 mb-2">Portfolio</p>
        <h1 className="text-black dark:text-white font-bold text-3xl">My Projects</h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-2">
          A collection of web applications and projects I've built using modern technologies.
        </p>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
          Total Projects: {projectData.length}
        </p>
      </div>

      <div className="space-y-3">
        {projectData.map((project, index) => {
          const isExpanded = expandedProject === index
          
          return (
            <div
              key={project.id}
                                   className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Project Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleProject(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-black dark:text-white">
                      {project.name}
                    </h3>
                    {project.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Working' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {project.status}
                      </span>
                    )}
                    {!isExpanded && (
                      <button
                        className="text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProject(index)
                        }}
                      >
                        <HiChevronDown className="text-xl" />
                      </button>
                    )}
                    {isExpanded && (
                      <button
                        className="text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProject(index)
                        }}
                      >
                        <HiChevronUp className="text-xl" />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    {project.category}
                  </div>
                </div>
                <div className="text-sm text-gray-400 dark:text-zinc-500 text-right">
                  {project.date}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                  {/* Project Image */}
                  {project.image && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-auto object-cover"
                        onLoad={() => console.log('Image loaded successfully:', project.image)}
                        onError={(e) => console.error('Image failed to load:', project.image, e)}
                      />
                    </div>
                  )}
                  {!project.image && (
                    <div className="mb-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg text-center text-gray-500 dark:text-zinc-400">
                      No image available for this project
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-4 mb-4">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-sm font-medium"
                    >
                      <FaGithub className="text-lg" />
                      View Code
                    </a>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-sm font-medium"
                    >
                      <FaGlobe className="text-lg" />
                      Live Demo
                    </a>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-zinc-400 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                      Technologies & Tools
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                          {getTechIcon(tech)}
                          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{tech}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                      Key Features
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 dark:text-zinc-400 text-sm leading-relaxed space-y-1">
                      {project.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Projects
