import React, { useEffect } from 'react'
import { FaAws, FaGithub, FaGlobe, FaReact } from 'react-icons/fa'
import { RiNextjsFill, RiTailwindCssFill } from 'react-icons/ri'
import { SiTypescript, SiPostgresql, SiFigma, SiVercel, SiPostman, SiBun, SiNodedotjs } from 'react-icons/si'
import { usePortfolio } from '../contexts/PortfolioContext'

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
  const { data, isLoading, error } = usePortfolio()
  
  // Use backend data instead of dummy data
  const experienceData = data?.workExperience || []

  // Show loading state
  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work experience...</p>
        </div>
      </section>
    )
  }

  // Show error state
  if (error) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600">Error loading work experience: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-gray-400 mb-2">Career</p>
        <h1 className="text-black font-bold text-3xl">Work Experience</h1>
        <p className="text-gray-600 mt-2">
          My professional journey and the companies I've had the privilege to work with.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline Items */}
        <div className="space-y-8">
          {experienceData.map((exp, index) => (
            <div key={index} className="relative pl-16">
              {/* Timeline Dot */}
              <div className="absolute left-4 top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-md z-10"></div>

              {/* Content Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="flex items-center gap-3 mb-3 p-4">
                  {/* Logo */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {exp.logo ? (
                      <img src={exp.logo} alt={exp.company} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <span className="text-xl font-bold">{exp.company[0]}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg text-black">{exp.company}</span>
                      <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium border border-green-200">
                        {exp.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{exp.role}</div>
                  </div>

                  <div className="text-xs text-gray-400 text-right hidden sm:block">
                    <div>{exp.start} - {exp.end}</div>
                  </div>
                </div>

                {/* Date (mobile) */}
                <div className="px-4 pb-2 sm:hidden">
                  <div className="text-xs text-gray-400">{exp.start} - {exp.end}</div>
                  <div className="text-xs text-gray-400">{exp.location}</div>
                </div>

                {/* Details */}
                <div className="px-4 pb-4">
                  <div className="text-xs text-gray-400 mb-3 hidden sm:block">{exp.location}</div>
                  
                  {/* Technologies */}
                  <div className="mb-3">
                    <div className="font-semibold text-gray-700 mb-2 text-sm">Technologies & Tools</div>
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md border border-dashed cursor-pointer text-xs font-medium text-gray-700"
                        >
                          {tech.icon}
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Accomplishments */}
                  <div>
                    <div className="font-semibold text-gray-700 mb-2 text-sm">Key Accomplishments</div>
                    <ul className="list-disc pl-5 text-gray-600 text-sm leading-relaxed space-y-1">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Work