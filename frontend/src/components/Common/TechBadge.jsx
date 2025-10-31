import React from 'react'

const TechBadge = ({ children, icon: Icon, iconClassName }) => {
  return (
    <button className='inline-flex justify-center gap-1 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700 text-black dark:text-zinc-200 font-medium cursor-pointer'>
      {Icon && <Icon className={iconClassName} />}
      <span className='text-sm'>{children}</span>
    </button>
  )
}

export default TechBadge

