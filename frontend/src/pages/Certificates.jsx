import React, { useState } from 'react'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { usePortfolio } from '../contexts/PortfolioContext'
import LogoBadge from '../components/Common/LogoBadge'

// Dummy certificate data - COMMENTED OUT - now using backend data
/* const certificateData = [
  {
    id: 1,
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: 'January 2025',
    credentialId: 'AWS-CSA-123456',
    credentialUrl: 'https://example.com/verify/123456',
    image: 'https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d847de41ad6/image.png',
    description: 'Earned by demonstrating expertise in designing distributed systems on AWS.',
    skills: ['Cloud Architecture', 'AWS Services', 'System Design', 'Infrastructure']
  },
  {
    id: 2,
    name: 'Meta Front-End Developer',
    issuer: 'Meta (Coursera)',
    issueDate: 'December 2024',
    credentialId: 'META-FED-789012',
    credentialUrl: 'https://example.com/verify/789012',
    image: 'https://picsum.photos/400/300',
    description: 'Comprehensive front-end development covering React, JavaScript, and modern web development practices.',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Web Development']
  },
  {
    id: 3,
    name: 'Google Cloud Professional Developer',
    issueDate: 'November 2024',
    issuer: 'Google Cloud',
    credentialId: 'GCP-PD-345678',
    credentialUrl: 'https://example.com/verify/345678',
    image: 'https://picsum.photos/401/301',
    description: 'Validates expertise in developing and deploying applications on Google Cloud Platform.',
    skills: ['Google Cloud', 'Kubernetes', 'Cloud Functions', 'DevOps']
  },
  {
    id: 4,
    name: 'Full Stack Web Development',
    issuer: 'freeCodeCamp',
    issueDate: 'August 2024',
    credentialId: 'FCC-FSW-901234',
    credentialUrl: 'https://example.com/verify/901234',
    image: 'https://picsum.photos/402/302',
    description: 'Coverage of front-end and back-end technologies including React, Node.js, and databases.',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs']
  },
  {
    id: 5,
    name: 'The Complete 2024 Web Development Bootcamp',
    issuer: 'Udemy',
    issueDate: 'June 2024',
    credentialId: 'UDEMY-WEB-567890',
    credentialUrl: 'https://example.com/verify/567890',
    image: 'https://picsum.photos/403/303',
    description: 'Complete web development course covering HTML, CSS, JavaScript, and various frameworks.',
    skills: ['HTML5', 'CSS3', 'Bootstrap', 'JavaScript', 'jQuery']
  }
] */

const Certificates = () => {
  // Set the first certificate (most recent) as expanded by default
  const [expandedCertificate, setExpandedCertificate] = useState(0)
  const { data } = usePortfolio()
  
  // Use backend data instead of dummy data
  const certificateData = data?.certificates || []

  const toggleCertificate = (index) => {
    if (expandedCertificate === index) {
      setExpandedCertificate(null)
    } else {
      setExpandedCertificate(index)
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mb-8">
        <p className="text-gray-400 dark:text-gray-500 mb-2">Certifications</p>
        <h1 className="text-black dark:text-white font-bold text-3xl">My Certificates</h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-2">
          Professional certifications and achievements in software development and cloud technologies.
        </p>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
          Total Certificates: {certificateData.length}
        </p>
      </div>

      <div className="space-y-3">
        {certificateData.map((certificate, index) => {
          const isExpanded = expandedCertificate === index
          
          return (
            <div
              key={certificate.id}
                                   className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Certificate Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleCertificate(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-black dark:text-white">
                      {certificate.name}
                    </h3>
                    {!isExpanded && (
                      <button
                        className="text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCertificate(index)
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
                          toggleCertificate(index)
                        }}
                      >
                        <HiChevronUp className="text-xl" />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    {certificate.issuer}
                  </div>
                </div>
                <div className="text-sm text-gray-400 dark:text-zinc-500 text-right">
                  {certificate.issueDate}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-zinc-700">
                  {/* Certificate Image */}
                  {certificate.image && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                      <img
                        src={certificate.image}
                        alt={certificate.name}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Credential ID and Verification */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">Credential ID</p>
                        <p className="text-sm font-mono text-gray-800 dark:text-zinc-200">
                          {certificate.credentialId}
                        </p>
                      </div>
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Verify Credential
                        <FaExternalLinkAlt className="text-xs" />
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-zinc-400 leading-relaxed">
                      {certificate.description}
                    </p>
                  </div>

                  {/* Skills/Topics Covered */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                      Key Topics Covered
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {certificate.skills.map((skill, i) => (
                        <div key={i} title={skill} className="cursor-pointer">
                          <LogoBadge name={skill} size='sm'>
                            <span className="text-[0.65rem] font-semibold text-blue-700 dark:text-blue-300">
                              {skill?.charAt(0) || '?' }
                            </span>
                          </LogoBadge>
                        </div>
                      ))}
                    </div>
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

export default Certificates
