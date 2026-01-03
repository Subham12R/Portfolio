import React from 'react'
const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className='flex flex-col justify-center items-center max-w-2xl mx-auto border-t pb-32 mt-2 py-4 border-gray-300 dark:border-zinc-700'>

      <p className='text-sm tracking-tighter font-medium text-gray-500 dark:text-zinc-400'>Developed by Subham12R</p>
      <p className='text-sm tracking-tighter font-medium text-gray-500 dark:text-zinc-400'>© {year}. All rights reserved</p>
    </footer>
  )
}

export default Footer