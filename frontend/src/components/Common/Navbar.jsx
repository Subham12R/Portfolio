import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/profile.png'
import { FaTimes, FaBars } from 'react-icons/fa'
import { ThemeToggleButton } from '../Layout/ThemeToggle'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/work', label: 'Work' },
  { to: '/gears', label: 'Gears' },
  { to: '/setup', label: 'Setup' },
]

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLinkClick = (path) => {
    navigate(path)
    setIsSidebarOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800/50 w-full lg:max-w-2xl mx-auto flex justify-between items-center px-4 py-4">
        <div className='flex items-center justify-center py-2'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FaBars className="text-xl text-gray-700 dark:text-zinc-300" />
            </button>

            {/* Desktop Logo */}
            <Link to='/' className='hidden md:flex items-center gap-2 font-semibold'>
                <img src={logo} alt="" className='w-10 h-10 rounded object-cover shadow'/>
            </Link>

            

            {/* Desktop Navigation */}
            <ul className='hidden md:flex justify-center gap-1 md:gap-2 items-center md:text-md font-medium ml-2'>
                <li>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `px-1 py-2 cursor-pointer ${isActive ? 'text-blue-900 dark:text-blue-400 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}`
                        }
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/projects" 
                        className={({ isActive }) => 
                            `px-1 py-3 cursor-pointer ${isActive ? 'text-zinc-800 dark:text-zinc-200 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}` 
                        }
                    >
                        Projects
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/certificates" 
                        className={({ isActive }) => 
                            `px-1 py-3 cursor-pointer ${isActive ? 'text-zinc-800 dark:text-zinc-200 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}`
                        }
                    >
                        Certificates
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/work" 
                        className={({ isActive }) => 
                            `px-1 py-3 cursor-pointer ${isActive ? 'text-zinc-800 dark:text-zinc-200 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}`
                        }
                    >
                        Work
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/gears" 
                        className={({ isActive }) => 
                            `px-1 py-3 cursor-pointer ${isActive ? 'text-zinc-800 dark:text-zinc-200 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}`
                        }
                    >
                        Gears
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/setup" 
                        className={({ isActive }) => 
                            `px-2 py-3 cursor-pointer ${isActive ? 'text-zinc-800 dark:text-zinc-200 font-semibold' : 'hover:text-gray-600 dark:hover:text-zinc-300 text-gray-700 dark:text-zinc-300'}`
                        }
                    >
                        Setup
                    </NavLink>
                </li>
            </ul>
        </div>

        <div>
            <div>
                <ThemeToggleButton className="shadow-lg" />
            </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-950 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                
                <span className="font-semibold text-lg text-gray-900 dark:text-zinc-100">Menu</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl text-gray-700 dark:text-zinc-300" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <button
                      onClick={() => handleLinkClick(link.to)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100 flex items-center gap-3"
                    >
                      <span className="text-sm">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
      </>
    </>
  )
}

export default Navbar