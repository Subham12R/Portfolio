import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import { ThemeToggleButton } from '../Layout/ThemeToggle'
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { RiSideBarFill } from "react-icons/ri";

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/contact', label: 'Contact' },
  { to: '/work', label: 'Work' },
  { to: '/gears', label: 'Gears' },
  { to: '/setup', label: 'Setup' },
  { to: '/blog', label: 'Blog' },
]

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const iconRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!dropdownRef.current || !dropdownContentRef.current) return;

    if (isDropdownOpen) {
      // Get the scroll height for smooth animation
      const targetHeight = dropdownContentRef.current.scrollHeight;
      
      // Set initial state
      gsap.set(dropdownRef.current, {
        height: 0,
        opacity: 0,
        y: -20,
      });

      // Animate dropdown expanding downward with translateY effect
      gsap.to(dropdownRef.current, {
        height: targetHeight,
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      // Animate content with stagger
      gsap.fromTo(
        dropdownContentRef.current.children,
        {
          y: -20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.1,
        }
      );

      // Animate icon fill increase
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          scale: 1.2,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    } else {
      // Animate dropdown collapsing upward
      gsap.to(dropdownRef.current, {
        height: 0,
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power3.inOut",
      });

      // Animate icon fill decrease
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          scale: 1,
          opacity: 0.7,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    }
  }, [isDropdownOpen]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        dropdownContainerRef.current &&
        buttonRef.current &&
        !dropdownContainerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const navigate = useNavigate()

  const handleLinkClick = (path) => {
    navigate(path)
    setIsDropdownOpen(false)
  }


  return (
    <>
      <div className="sticky top-0 z-[100] w-full lg:max-w-2xl mx-auto ">
        <nav className="bg-white  dark:bg-zinc-950 backdrop-blur-md border-b  border-gray-200/50 dark:border-zinc-800/50 w-full flex justify-between items-center px-2 relative">
          <div className='flex items-center justify-center py-2'>
            {/* Menu Button - Works for both mobile and desktop */}
            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="font-sora"
            >
              <span  className="inline-block border border-gray-200 dark:border-zinc-800/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] p-2 rounded">
                <RiSideBarFill 
                  size={20} 
                  className="text-xl text-gray-900 dark:text-zinc-100" 
                />
              </span>
            </button>

          </div>

  

          <div>
            <ThemeToggleButton className="border shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]" blur={true} />
          </div>

          {/* DROPDOWN PANEL - Absolutely positioned to overlay content */}
          <div ref={dropdownContainerRef} className="absolute top-full left-0 right-0">
            <div
              ref={dropdownRef}
              className="w-full overflow-hidden bg-white dark:bg-zinc-950 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800/50 relative "
              style={{ height: 0 }}
            >
              <div
                ref={dropdownContentRef}
                className="leading-tight px-4 py-6 mb-4 flex flex-col w-full relative z-10 items-center gap-3"
              >
                {navLinks.map((link, i) => {
                  const index = String(i + 1).padStart(2, '0');
                  return (
                    <button
                      key={i}
                      onClick={() => handleLinkClick(link.to)}
                      className="group relative flex items-center justify-center text-base md:text-lg font-semibold dark:text-zinc-300 text-zinc-950 tracking-tighter leading-tight cursor-pointer font-sora before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:origin-left hover:before:scale-x-100"
                    >
                      <span className="relative tracking-tight">
                        {link.label.toUpperCase()}
                        <span className="absolute -top-1 -right-3 text-[9px] md:text-[10px] font-medium text-red-500/50 dark:text-red-400/50 tracking-tight">{index}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}

export default Navbar