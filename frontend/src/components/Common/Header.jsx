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
import { FaSquareXTwitter, FaPinterestP } from "react-icons/fa6";
import { FaEnvelope, FaBookOpen } from "react-icons/fa";
import { RiClipboardFill, RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";

import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";
import Tooltip from '@mui/material/Tooltip';
import { Text } from '@radix-ui/themes';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import TechBadge from './TechBadge';


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
                        
                    <h1 className='text-3xl font-bold mb-2 dark:text-zinc-200 text-zinc-900 tracking-tight'>Hi, I'm Subham - <Text as='span' className='text-blue-500 font-bold'>A Full Stack Web Developer.</Text></h1>
                    {/* <DecryptedText
                        text="A Full Stack Web Developer."
                        speed={100}
                        animateOn='view'
                        maxIterations={20}
                        characters="101010</>?"
                        className="revealed text-xl md:text-3xl font-bold text-blue-500 tracking-tighter"
                        parentClassName="all-letters text-xl  md:text-3xl font-bold text-blue-200 tracking-tighter"
                        encryptedClassName="encrypted"
                    />
                    */}
                    </div> 

                    <div className=' mt-2 w-full '>
                    <p className='gap-1 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 dark:text-zinc-400 font-medium '>I build interactive and responsive web apps using {" "}  
                     <TechBadge icon={FaReact} iconClassName='text-blue-500'>React</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiNextjsFill} iconClassName='text-black dark:text-white'>NextJS</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiTailwindCssFill} iconClassName='text-blue-800'>TailwindCSS</TechBadge>
                    <span>,</span>
                    <TechBadge icon={RiNodejsFill} iconClassName='text-emerald-500'>NodeJs</TechBadge>
                    <span>,</span>
                    <span> and </span>
                    <TechBadge icon={BiLogoPostgresql} iconClassName='text-blue-800'>PostgreSQL</TechBadge>
                     <span>. Focusing on <Text as='span' className='dark:text-white text-black'> <strong>UI/UX Design</strong></Text> and learning <Text as='span' className='dark:text-white text-black'> <strong>Three JS</strong></Text>. Currently keeping a close eye on the latest technologies and trends in web development.</span>
                    
                    </p>
                    <div className='text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-2'>
                        <FaBookOpen className='text-zinc-600 dark:text-zinc-400' />
                        <Text>B.Tech CSE Student at <em>Adamas University</em>, Kolkata, India.</Text>
                    </div>
                    </div>



                    <div className='mb-6 w-full flex justify-start items-center gap-4'>
                    <Tip title="Download Resume" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-white/40 transition-all ease-in-out duration-300 py-1 px-2 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <RiClipboardFill/> Resume/CV
                        </button>
                    </Tip>
                    <Tip title="Contact Me" placement="top" arrow isDark={isDark}>
                        <button 
                            onClick={() => navigate('/contact')}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-black shadow hover:bg-zinc-100 dark:hover:bg-white transition-all ease-in-out duration-300 py-1 px-2 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
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
                        <Tip title="Follow me on Pinterest" placement="top" arrow isDark={isDark}>
                            <a 
                                href="https://twitter.com/Subham12R" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className='text-zinc-800 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
                            >
                                <FaPinterestP size={20}/>
                            </a>
                        </Tip>
                    </div>
                </div>

        </div>

    </header>
  )
}

export default Header