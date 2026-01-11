import React, { useEffect } from 'react';
import { getCalApi } from "@calcom/embed-react";
import profileImage from '../../assets/pfp.jpeg';
import ResumePdf from '../../assets/Resume.pdf';
import {FaLocationArrow, FaReact, FaClock, FaCalendar} from 'react-icons/fa';
import {RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";
import { BsEnvelopePaper } from "react-icons/bs";
import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";
import { Text } from '@radix-ui/themes';
import TechBadge from './TechBadge';
import bannerImage from '../../assets/banner.gif';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location03Icon } from '@hugeicons/core-free-icons';
import GitHubCalendar from 'react-github-calendar';
import { useTheme } from '../../contexts/ThemeContext';
import Socials from '../Products/Socials';

// Import tech stack logos
import jsLogo from '../../assets/logo/js.png';
import typescriptLogo from '../../assets/logo/typescript.png';
import htmlLogo from '../../assets/logo/html.png';
import cssLogo from '../../assets/logo/css.png';
import reactLogo from '../../assets/logo/react.png';
import nextjsLogo from '../../assets/logo/nextjs.jpeg';
import tailwindLogo from '../../assets/logo/tailwindcss.jpeg';
import nodejsLogo from '../../assets/logo/nodejs.png';
import mongodbLogo from '../../assets/logo/mongodb.png';
import supabaseLogo from '../../assets/logo/supabase.jpeg';
import githubLogo from '../../assets/logo/github.png';
import figmaLogo from '../../assets/logo/figma.png';
import gsapLogo from '../../assets/logo/gsap.svg';
import Tooltip from '@mui/material/Tooltip';


const Header = () => {
  // Initialize Cal.com embed
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"30min"});
      cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, []);

const { theme } = useTheme();
  return (
    <header className="border-gray-200">
        <div className="">
            <img src={bannerImage} alt="banner" className='w-full h-32 sm:h-40 lg:h-48 object-cover mb-4 shadow-md'/>
          </div>
        {/* Profile Content with horizontal layout */}
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-6'>
        
          {/* Profile Section - Horizontal Layout */}
          <div className='w-full flex items-start gap-4 mb-6 px-2'>
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img 
                src={profileImage} 
                alt="profile image" 
                className='w-32 h-32 rounded-3xl outline outline-2 outline-offset-2 outline-zinc-300 dark:outline-zinc-700 object-cover shadow-lg border-4 border-white dark:border-zinc-950' 
              />
            </div>
            
            {/* Profile Content */}
            <div className='flex-1 justify-baseline items-baseline min-w-0'>
              <div className='flex flex-col '>
                <h1 className='dark:text-white text-zinc-900 text-2xl sm:text-3xl tracking-tighter font-bold'>
                  Subham Karmakar.
                </h1>
                <span className='text-zinc-400 tracking-tighter text-base sm:text-lg font-bold'> 
                  A FullStack Web Developer.
                </span> 
                <span className='tracking-tighter font-medium flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400'> 
                  <HugeiconsIcon icon={Location03Icon} size={14} /> 
                  Kolkata, India.
                </span>
              </div>
              
          
            </div>
            </div>
     <div className='mt-3'>
                <p className='text-zinc-600 font-medium dark:text-zinc-300 text-sm leading-relaxed tracking-tight'>
                  Building scalable and efficient <strong>web applications</strong> with a passion for crafting seamless user experiences.
                </p>
              </div>

<Socials />
                    <div className='mb-2 mt-4  md:w-full lg:w-1/2 flex flex-row justify-center items-center gap-2'>
                        <Link 
                            to="/resume"
                            className='active:scale-95 inline-flex  flex-1  justify-center items-center gap-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-zinc-400/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ease-in-out duration-300 py-2.5 px-4 rounded-xl cursor-pointer text-sm font-medium hover:shadow-md'
                        >
                            <BsEnvelopePaper className='text-sm'/> <span className='hidden xs:inline'>Resume/CV</span><span className='xs:hidden'>Resume</span>
                        </Link>
                        <Link to="/contact"
                            className='active:scale-95 inline-flex flex-1 justify-center items-center gap-2 bg-black dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-white dark:text-zinc-900 shadow hover:bg-zinc-900 dark:hover:bg-white transition-all ease-in-out duration-300 py-2.5 px-4 rounded-xl cursor-pointer text-sm font-medium hover:shadow-md'
                        >
                            <BiPaperPlane className='text-sm'/>Get in Touch
                        </Link>              
                    </div>

                    
              <div className='w-full mt-8 border p-4 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] bg-transparent '>
              <div className="w-full flex justify-center">
                <div className="max-w-full overflow-x-auto">
                  <div style={{ minWidth: 320, width: '100%' }}>
                    <GitHubCalendar 
                      username="subham12r" 
                      hideMonthLabels={false}
                      blockSize={12}
                      blockRadius={2}
                      blockMargin={2}
                      colorScheme={theme}
                      year={2026}
                      fontSize={14}
                      style={{ width: '100%', minWidth: 320 }}
                    />
                  </div>
                </div>
              </div>

              
            </div>

            {/* Tech Stack Section */}
            <div className='w-full mt-6'>
              <div className='w-full flex justify-start items-center mb-3 sm:mb-4 mt-6 sm:mt-8 underline-offset-4 underline decoration-dashed'>
                <h2 className='text-zinc-900 dark:text-white font-bold text-2xl sm:text-3xl tracking-tight'>Tech Stack.</h2>
              </div>
              <div className='w-full rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 p-4 shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)]'>
                <div className='flex flex-wrap gap-2 justify-center items-center'>
                  {/* Programming Languages */}
                  <Tooltip title="JavaScript" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={jsLogo} alt="JavaScript" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="TypeScript" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={typescriptLogo} alt="TypeScript" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="HTML" placement="top" arrow >
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                      <img src={htmlLogo} alt="HTML" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="CSS" placement="top" arrow >
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                      <img src={cssLogo} alt="CSS" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  {/* Frontend Frameworks */}
                  <Tooltip title="React" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={reactLogo} alt="React" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="Next.js" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={nextjsLogo} alt="Next.js" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="Tailwind CSS" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={tailwindLogo} alt="Tailwind CSS" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  {/* Backend & Database */}
                  <Tooltip title="Node.js" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={nodejsLogo} alt="Node.js" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="MongoDB" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={mongodbLogo} alt="MongoDB" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="Supabase" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                      <img src={supabaseLogo} alt="Supabase" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  {/* Tools & Services */}
                  <Tooltip title="GitHub" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                      <img src={githubLogo} alt="GitHub" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  <Tooltip title="Figma" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                      <img src={figmaLogo} alt="Figma" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                  {/* Animation & Libraries */}
                  <Tooltip title="GSAP" placement="top" arrow>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:scale-110 bg-black transition-transform'>
                      <img src={gsapLogo} alt="GSAP" className='w-full h-full object-cover' />
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
        </div>
    </header>
  )
}

export default Header
