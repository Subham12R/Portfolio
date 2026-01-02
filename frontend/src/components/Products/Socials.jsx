import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon, NewTwitterRectangleIcon, Linkedin01Icon, YoutubeIcon, InstagramIcon, PinterestIcon, Mail01Icon } from '@hugeicons/core-free-icons'

const Socials = () => {
  const socialLinks = [
    {
      name: 'X (Formerly Twitter)',
      url: 'https://x.com/Subham12R',
      icon: NewTwitterRectangleIcon
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/subham-karmakar-663b1031b/',
      icon: Linkedin01Icon
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Subham12R',
      icon: GithubIcon
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@SubhamX8',
      icon: YoutubeIcon
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/subham_karmakar',
      icon: InstagramIcon
    },
    {
      name: 'Pinterest',
      url: 'https://pinterest.com/subhamkarmakar',
      icon: PinterestIcon
    },
    {
      name: 'Email',
      url: 'mailto:contact@subham.dev',
      icon: Mail01Icon
    }
  ]

  return (
    <div className='flex items-center justify-start gap-2 mb-8 mt-2'>
      {socialLinks.map((social, index) => (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className='text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200'
        >
          <HugeiconsIcon icon={social.icon} size={24} color="currentColor" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  )
}

export default Socials
