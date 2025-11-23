import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiArrowUpRight } from 'react-icons/hi2'
import { FaAward, FaCertificate, FaGraduationCap } from 'react-icons/fa'
import { usePortfolio } from '../../contexts/PortfolioContext'
import hackerrankLogo from '../../assets/logo/hackerrank.svg'
import udemyLogo from '../../assets/logo/udemy.png'

const Certificates = () => {
  const { data, isLoading, error } = usePortfolio()
  const navigate = useNavigate()

  // Use backend data instead of dummy data
  const certificateData = data?.certificates || []

  // Helper function to format date (DD.MM.YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch {
      // If date parsing fails, try to format common formats
      if (dateString.includes('.')) return dateString
      // Try to parse "January 2025" format
      const months = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
      }
      const parts = dateString.toLowerCase().split(' ')
      if (parts.length === 2 && months[parts[0]]) {
        return `01.${months[parts[0]]}.${parts[1]}`
      }
      return dateString
    }
  }

  // Get logo for certificate based on issuer
  const getCertificateLogo = (issuer) => {
    if (!issuer) return null
    
    const issuerLower = issuer.toLowerCase()
    
    if (issuerLower.includes('hackerrank') || issuerLower.includes('hacker rank')) {
      return { type: 'svg', src: hackerrankLogo, alt: 'HackerRank' }
    }
    
    if (issuerLower.includes('udemy')) {
      return { type: 'image', src: udemyLogo, alt: 'Udemy' }
    }
    
    return null
  }

  // Get fallback icon for certificate
  const getCertificateIcon = (index) => {
    const icons = [FaAward, FaCertificate, FaGraduationCap, FaAward, FaCertificate]
    return icons[index % icons.length]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 dark:text-zinc-400">Loading certificates...</div>
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

  if (certificateData.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
        {certificateData.map((certificate, index) => {
          const IconComponent = getCertificateIcon(index)
          const logo = getCertificateLogo(certificate.issuer)
          const isLast = index === certificateData.length - 1
          
          return (
            <div
              key={certificate.id || index}
              onClick={() => navigate('/certificates')}
              className={`group flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                !isLast ? 'border-b border-gray-200 dark:border-zinc-800' : ''
              }`}
            >
              {/* Left Icon/Logo */}
              <div className="w-10 h-10 rounded-lg bg-zinc-800 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                {logo ? (
                  logo.type === 'svg' ? (
                    <img src={logo.src} alt={logo.alt} className="w-full h-full object-cover " />
                  ) : (
                    <img src={logo.src} alt={logo.alt} className="w-full h-full object-cover " />
                  )
                ) : (
                  <IconComponent className="text-white text-lg" />
                )}
              </div>
              
              {/* Main Text Block */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                  {certificate.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                  @{certificate.issuer || 'Certificate Issuer'}
                </p>
              </div>
              
              {/* Date */}
              <div className="text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap shrink-0">
                {formatDate(certificate.issueDate)}
              </div>
              
              {/* Right Arrow Icon */}
              <HiArrowUpRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0 transition-colors" />
            </div>
          )
        })}
      </div>
      
      <div className="w-full flex justify-center items-center mt-4">
        <Link
          to="/certificates"
          className="text-zinc-900 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-md bg-gray-50 dark:bg-zinc-900 hover:shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] transition-all duration-100"
        >
          View all Certificates
        </Link>
      </div>
    </div>
  )
}

export default Certificates
