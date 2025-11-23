import React from 'react'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { FaYoutube } from 'react-icons/fa6'
import { HiArrowUpRight } from 'react-icons/hi2'

const Socials = () => {
  const socialLinks = [
    {
      name: 'X (Formerly Twitter)',
      handle: '@Subham12R',
      url: 'https://twitter.com/Subham12R',
      icon: FaXTwitter,
      iconColor: 'text-white',
      bgColor: 'bg-black'
    },
    {
      name: 'GitHub',
      handle: 'Subham12R',
      url: 'https://github.com/Subham12R',
      icon: FaGithub,
      iconColor: 'text-white',
      bgColor: 'bg-black'
    },
    {
      name: 'LinkedIn',
      handle: 'subham-karmakar-663b1031b',
      url: 'https://www.linkedin.com/in/subham-karmakar-663b1031b/',
      icon: FaLinkedin,
      iconColor: 'text-white',
      bgColor: 'bg-[#0077b5]'
    },

    {
      name: 'YouTube',
      handle: '@SubhamX8',
      url: 'https://youtube.com/@SubhamX8',
      icon: FaYoutube,
      iconColor: 'text-white',
      bgColor: 'bg-[#FF0000]'
    }
  ]

  return (
    <div className='w-full mb-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {socialLinks.map((social, index) => {
          const IconComponent = social.icon
          return (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className='group flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5'
            >
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                {/* Icon */}
                <div className={`${social.bgColor} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                  <IconComponent className={`${social.iconColor} text-lg`} />
                </div>
                
                {/* Text Content */}
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                    {social.name}
                  </h3>
                  <p className='text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5'>
                    {social.handle}
                  </p>
                </div>
              </div>
              
              {/* Arrow Icon */}
              <HiArrowUpRight className='w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0 ml-2 transition-colors' />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default Socials
