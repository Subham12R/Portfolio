import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import profileImage from '../../assets/profile.png';
import ResumePdf from '../../assets/Resume.pdf';
import DecryptedText from './DecryptedText';
import { useTheme } from '../../contexts/ThemeContext';
import {FaReact} from 'react-icons/fa';
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";
import { RiClipboardFill, RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";
import { SiExpress } from "react-icons/si";
import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";

import Tooltip from '@mui/material/Tooltip';

import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

const Tip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ isDark }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: isDark ? '#ffffff' : '#000000',
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: isDark 
        ? '#ffffff' 
        : '#000000',

      color: isDark ? '#000000' : '#ffffff',
      fontSize: '0.7rem',
      fontWeight: '400',
      padding: '2px 4px',
    },
  }));

const Header = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Function to download resume from assets
  const downloadResume = () => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = ResumePdf;
      link.download = 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <header className="border-gray-200">


        {/* Profile Content */}
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-4 mb-2'>
                    <div className='w-full flex justify-between items-start mb-10 mt-6'>
                                    <div className="relative">
                                        <img src={profileImage} alt="profile image" className='w-24 h-24 rounded-full object-cover shadow-md ' />

                                        <span className="absolute bottom-1 right-3 inline-block w-2 h-2 bg-green-500 rounded-full ring-2 ring-green-200 dark:ring-green-700 ring-offset-2 dark:ring-offset-zinc-950 z-10"></span>
                                    </div>

                            </div>
                 <div className='w-full inline-flex flex-col justify-center items-start space-y-2'>
                    <div className='mb-2'>
                        
                    <h1 className='text-3xl font-bold mb-2 dark:text-white'>Hi, I'm <span className='text-zinc-800 dark:text-zinc-200 font-bold '>Subham Karmakar.{" "} </span></h1>
                    <DecryptedText
                        text="A Full Stack Web Developer."
                        speed={100}
                        animateOn='view'
                        maxIterations={20}
                        characters="101010</>?"
                        className="revealed text-xl md:text-3xl font-bold text-blue-500 tracking-tighter"
                        parentClassName="all-letters text-xl  md:text-3xl font-bold text-blue-200 tracking-tighter"
                        encryptedClassName="encrypted"
                    />
                    </div>

                    <div className=' mb-6 w-full leading-normal '>
                    <p className='gap-2 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 dark:text-zinc-400 font-medium '>I build interactive and responsive web apps using {" "}  
                     <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5  rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><FaReact className='text-blue-500'/>React</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><RiNextjsFill  className='text-black dark:text-white'/>NextJS</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><RiTailwindCssFill  className='text-blue-800'/>TailwindCSS</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><RiNodejsFill  className='text-emerald-500'/>NodeJs</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><SiExpress className='text-red-800'/>Express</button>
                    <span>, and </span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 dark:bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  px-2 py-0.5 rounded-md border-dashed border dark:border-zinc-700  text-black dark:text-zinc-200 font-semibold cursor-pointer'><BiLogoPostgresql  className='text-blue-800'/>PostgreSQL</button>
                     <span>. </span>
                    With a focus on UI design and user experience. Currently keeping a close eye on the latest technologies and trends in web development.
                    </p>
                    </div>

                    <div className='mb-6 w-full flex justify-start items-center gap-4'>
                    <Tip title="Download Resume" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black dark:bg-white text-white dark:text-black shadow hover:bg-zinc-800 dark:hover:bg-gray-200  transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer'
                        >
                            <RiClipboardFill/> Resume/CV
                        </button>
                    </Tip>
                    <Tip title="Contact Me" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={() => navigate('/contact')}
                            className='inline-flex justify-center items-center gap-2 bg-transparent dark:bg-transparent py-2 px-4 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]  text-black dark:text-zinc-200 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] dark:hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]  transition-all ease-in-out duration-300 cursor-pointer'
                        >
                            <BiPaperPlane />Get in Touch
                        </button>
                     </Tip>               
                    </div>

                     <div className='mb-2 flex flex-row justify-center items-center gap-4'>
                        <Tip title="Send me an email" placement="top" arrow isDark={isDark}>
                            <a 
                                href="mailto:rikk4335@gmail.com" 
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
                            >
                                <FaEnvelope size={20}/>
                            </a>
                        </Tip>
                        <Tip title="Connect on LinkedIn" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
                            >
                                <FaLinkedin size={20}/>
                            </a>
                        </Tip>
                        <Tip title="View my GitHub profile" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://github.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-150'
                            >
                                <FaGithub size={20}/>
                            </a>
                        </Tip>
                        <Tip title="Follow me on Twitter" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://twitter.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
                            >
                                <FaSquareXTwitter size={20}/>
                            </a>
                        </Tip>
                    </div>
                </div>

        </div>

    </header>
  )
}

export default Header