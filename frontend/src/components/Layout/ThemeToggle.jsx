"use client";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import clickSound from "../../assets/audio/click.mp3";
import { useThemeToggle } from "./useThemeToggle";

export const ThemeToggleButton = ({
  className = "",
}) => {
  const { isDark, toggleTheme } = useThemeToggle();
  const [rotation, setRotation] = React.useState(0);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(clickSound);
    audioRef.current.volume = 0.5; // Set volume to 50%
  }, []);

  // Handle click with sound
  const handleToggle = () => {
    // Play click sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(error => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
        console.warn('Could not play click sound:', error);
      });
    }
    // Toggle theme
    toggleTheme();
  };

  React.useEffect(() => {
    setRotation(prev => prev + 360);
  }, [isDark]);

  return (
    <motion.button
      type="button"
      className={cn(
        "size-10 cursor-pointer active:scale-95 rounded-md p-2 flex items-center justify-center transition-all duration-300",
        isDark ? "bg-transparent text-white" : "bg-transparent text-black",
        className,
      )}
      onClick={handleToggle}
      aria-label="Toggle theme"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: rotation }}
      transition={{
        rotate: {
          duration: 0.6,
          ease: [0.65, 0, 0.35, 1],
        },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 17,
        },
      }}
    >
      <span className="sr-only">Toggle theme</span>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-full h-full"
        animate={{
          scale: isDark ? [1, 1.1, 1] : [1, 0.9, 1],
        }}
        transition={{
          duration: 0.6,
          ease: [0.65, 0, 0.35, 1],
        }}
      >
                 <clipPath id="skiper-btn-theme">
           <motion.path
             animate={{ y: isDark ? 14 : 0, x: isDark ? -11 : 0 }}
             transition={{ ease: [0.65, 0, 0.35, 1], duration: 0.6 }}
             d="M0-11h25a1 1 0 0017 13v30H0Z"
           />
         </clipPath>
         <g clipPath="url(#skiper-btn-theme)">
           <motion.circle
             animate={{ r: isDark ? 10 : 8 }}
             transition={{ 
               type: "spring",
               stiffness: 300,
               damping: 20,
               duration: 0.6 
             }}
             cx="16"
             cy="16"
           />
           <motion.g
             animate={{
               scale: isDark ? 0.5 : 1,
               opacity: isDark ? 0 : 1,
               rotate: isDark ? 90 : 0,
             }}
             transition={{ 
               ease: [0.65, 0, 0.35, 1], 
               duration: 0.6 
             }}
             stroke="currentColor"
             strokeWidth="1.5"
           >
            <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
          </motion.g>
        </g>
      </motion.svg>
    </motion.button>
  );
};
