import React from 'react'
import { 
  FaLaptop, 
  FaDesktop, 
  FaKeyboard, 
  FaMouse, 
  FaHeadphones, 
  FaMobileAlt,
  FaChrome,
  FaGripLinesVertical,
  FaTablet,
  FaTabletAlt
} from 'react-icons/fa'
import { FaComputer } from 'react-icons/fa6'
import { usePortfolio } from '../contexts/PortfolioContext'

// Dummy devices data - COMMENTED OUT - now using backend data
/* const devices = [
  {
    icon: <FaLaptop className="text-2xl text-gray-700" />,
    name: 'Asus VivoBook S16 OLED',
    specs: 'Intel Core Ultra 7 32GB 1TB'
  },
  {
    icon: <FaComputer className="text-2xl text-gray-700" />,
    name: 'Custom Built',
    specs: 'CPU-Ryzen 7 7800x3D, GPU-RTX 4070S, RAM-32GB'
  },
  {
    icon: <FaDesktop className="text-2xl text-gray-700" />,
    name: 'Samsung Odyssey G4',
    specs: '24 inch'
  },
  {
    icon: <FaKeyboard className="text-2xl text-gray-700" />,
    name: 'Royal Kludge M65',
    specs: ''
  },
  {
    icon: <FaMouse className="text-2xl text-gray-700" />,
    name: 'Logitech SuperLight 2 Pro',
    specs: ''
  },
  {
    icon: <FaHeadphones className="text-2xl text-gray-700" />,
    name: 'Simgot IEMs',
    specs: 'Special Edition'
  },
  {
    icon: <FaMobileAlt className="text-2xl text-gray-700" />,
    name: 'Iphone 16',
    specs: '256 GB'
  },
  {
    icon: <FaTabletAlt className="text-2xl text-gray-700" />,
    name: 'Ipad Air M3 13"',
    specs: 'M3 128 GB'
  }
]

const extensions = [
  { name: 'Unhook', link: 'https://chrome.google.com/webstore' },
  { name: 'uBlock Origin', link: 'https://chrome.google.com/webstore' },
  { name: 'React Developer Tools', link: 'https://chrome.google.com/webstore' },
  { name: 'daily.dev', link: 'https://chrome.google.com/webstore' },
  { name: 'Grammarly', link: 'https://chrome.google.com/webstore' },
  { name: 'LastPass', link: 'https://chrome.google.com/webstore' },
  { name: 'Wappalyzer', link: 'https://chrome.google.com/webstore' }
] */

const Gears = () => {
  const { data } = usePortfolio()
  
  // Use backend data instead of dummy data
  const gearsData = data?.gears || { devices: [], extensions: [] }
  
  // Transform backend data to match frontend format
  const devices = (gearsData.devices || [])
    .map(gear => {
      // Map gear type to appropriate icon
      const getIcon = (type) => {
        switch (type) {
          case 'laptop':
            return <FaLaptop className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'desktop':
            return <FaComputer className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'monitor':
            return <FaDesktop className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'keyboard':
            return <FaKeyboard className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'mouse':
            return <FaMouse className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'headphones':
            return <FaHeadphones className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'tablet':
            return <FaTablet className="text-2xl text-gray-700 dark:text-zinc-300" />
          case 'mobile':
            return <FaMobileAlt className="text-2xl text-gray-700 dark:text-zinc-300" />
          default:
            return <FaLaptop className="text-2xl text-gray-700 dark:text-zinc-300" />
        }
      }

      return {
        icon: getIcon(gear.type),
        name: gear.name,
        specs: gear.specs
      }
    })
  
  const extensions = (gearsData.extensions || [])
    .map(gear => ({
      name: gear.name,
      link: gear.link || '#'
    }))

  // Show empty state
  if (devices.length === 0 && extensions.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
        <div className="text-center">
          <h1 className="text-black dark:text-white font-bold text-4xl mb-2">Gears</h1>
          <p className="text-gray-600 dark:text-zinc-400 mb-8">
            My gears and tools I use to get my work done.
          </p>
          <p className="text-gray-500 dark:text-zinc-500">No gears data available.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-black dark:text-white font-bold text-4xl mb-2">Gears</h1>
        <p className="text-gray-600 dark:text-zinc-400">
          My gears and tools I use to get my work done.
        </p>
      </div>

      {/* Devices Section */}
      {devices.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Devices</h2>
          <div className="space-y-3">
            {devices.map((device, index) => (
              <div
                key={index}
                                 className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  {device.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                  {device.specs && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">{device.specs}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Extensions Section */}
      {extensions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4 flex items-center gap-2">
            <FaGripLinesVertical className="text-gray-400 dark:text-zinc-500" />
            <span>Web Extensions</span>
          </h2>
          <ol className="space-y-3">
            {extensions.map((extension, index) => (
              <li key={index}>
                <a
                  href={extension.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 flex items-center gap-3 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                    {extension.name}
                  </span>
                  <span className="ml-auto text-gray-400 dark:text-zinc-500 group-hover:text-blue-600">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

export default Gears
