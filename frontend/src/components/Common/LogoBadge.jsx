import React from 'react'

import { getLogoAsset } from './logoAssets'

const sizeStyles = {
  sm: { container: 'w-8 h-8', image: 'w-5 h-5' },
  md: { container: 'w-10 h-10', image: 'w-6 h-6' },
  lg: { container: 'w-12 h-12', image: 'w-8 h-8' },
}

const LogoBadge = ({ name, size = 'md', className = '', imageClassName = '', children = null }) => {
  const logo = getLogoAsset(name)

  const { container, image } = sizeStyles[size] || sizeStyles.md

  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 shadow-sm overflow-hidden ${container} ${className}`.trim()}
    >
      {logo ? (
        <img
          src={logo.src}
          alt={`${logo.alt} logo`}
          className={`object-cover w-full h-full  rounded-md ${image} ${imageClassName}`.trim()}
          loading='lazy'
        />
      ) : (
        children
      )}
    </div>
  )
}

export default LogoBadge


