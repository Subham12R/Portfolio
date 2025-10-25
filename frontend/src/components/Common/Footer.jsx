import React from 'react'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className='flex flex-col justify-center items-center max-w-2xl mx-auto border-t mb-2 border-gray-300'>
      <p className='text-sm tracking-tighter font-medium mt-4 text-gray-500'>Designed And Developed by Subham12R</p>
      <p className='text-sm tracking-tighter font-medium text-gray-500'>© {year}. All rights reserved</p>
      
    </footer>
  )
}

export default Footer