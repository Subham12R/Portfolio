import React from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaSquareXTwitter } from 'react-icons/fa'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className='flex flex-col justify-center items-center max-w-2xl mx-auto border-t mb-2 border-gray-300 dark:border-zinc-700'>
      {/* Social Links */}
      <div className='flex flex-row justify-center items-center gap-4 mt-4 mb-2'>
        <a 
          href="mailto:rikk4335@gmail.com" 
          className='text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
          title="Send me an email"
        >
          <FaEnvelope size={20}/>
        </a>
        <a 
          href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
          target="_blank" 
          rel="noopener noreferrer"
          className='text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
          title="Connect on LinkedIn"
        >
          <FaLinkedin size={20}/>
        </a>
        <a 
          href="https://github.com/Subham12R" 
          target="_blank" 
          rel="noopener noreferrer"
          className='text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-150'
          title="View my GitHub profile"
        >
          <FaGithub size={20}/>
        </a>
        <a 
          href="https://twitter.com/Subham12R" 
          target="_blank" 
          rel="noopener noreferrer"
          className='text-gray-400 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
          title="Follow me on Twitter"
        >
          <FaSquareXTwitter size={20}/>
        </a>
      </div>
      
      <p className='text-sm tracking-tighter font-medium text-gray-500 dark:text-zinc-400'>Designed And Developed by Subham12R</p>
      <p className='text-sm tracking-tighter font-medium text-gray-500 dark:text-zinc-400'>© {year}. All rights reserved</p>
    </footer>
  )
}

export default Footer