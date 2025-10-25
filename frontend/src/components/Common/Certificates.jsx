import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { usePortfolio } from '../../contexts/PortfolioContext'

// Dummy certificate data - now using backend data via PortfolioContext
// const certificateData = [...]

const Certificates = () => {
  const [expandedCertificate, setExpandedCertificate] = useState(0)
  const { data, isLoading, error } = usePortfolio()

  // Use backend data instead of dummy data
  const certificateData = data?.certificates || []

  const toggleCertificate = (index) => {
    if (expandedCertificate === index) {
      setExpandedCertificate(null)
    } else {
      setExpandedCertificate(index)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading certificates...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">Error loading certificates: {error}</div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      {certificateData.map((certificate, index) => {
        const isExpanded = expandedCertificate === index
        return (
          <div key={certificate.id} className="bg-white rounded-xl mb-2">
            <div className="flex items-center justify-between p-2 cursor-pointer">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-black">{certificate.name}</span>
                  {!isExpanded && (
                    <button
                      onClick={() => setExpandedCertificate(index)}
                      className="text-gray-400 hover:text-black transition"
                    >
                      <HiChevronDown className="text-xl" />
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      onClick={() => setExpandedCertificate(null)}
                      className="text-gray-400 hover:text-black transition"
                    >
                      <HiChevronUp className="text-xl" />
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">{certificate.issuer}</div>
              </div>
              <div className="text-xs text-gray-400 text-right">
                {certificate.issueDate}
              </div>
            </div>
            {isExpanded && (
              <div className="px-2 pb-2">
                {/* Certificate Image */}
                {certificate.image && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={certificate.image}
                      alt={certificate.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                
                {/* Description */}
                <div className="mb-3">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {certificate.description}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <div className="font-semibold text-gray-700 mb-2 text-md">Key Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200 cursor-pointer text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
      
      <div className="w-full flex justify-center items-center mt-4">
        <Link
          to="/certificates"
          className="text-zinc-900 border border-gray-100 px-4 py-2 rounded-md bg-gray-50 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] transition-all duration-100"
        >
          View all Certificates
        </Link>
      </div>
    </div>
  )
}

export default Certificates
