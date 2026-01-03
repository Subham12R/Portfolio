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
        {/* Banner Section with Profile Picture Overlay - Full width, no padding */}
        <div className='banner-wrapper -mx-4 lg:mx-0'>
          <div className='banner-image relative w-full h-32 lg:h-48'>
            {/* Banner Image */}
            <img src={bannerImage} alt="banner image" className='w-full h-full object-cover' />
            
            {/* Profile Picture Overlay - positioned at bottom center */}
            <div className="absolute -bottom-12 left-15 transform -translate-x-1/2">
            <div className="relative">
              <img 
                src={profileImage} 
                alt="profile image" 
                className='w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-zinc-950' 
              />
            </div>
          </div>
        </div>
        </div>

        {/* Profile Content */}
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-6  mt-10'>
                 <div className='w-full inline-flex flex-col justify-center items-start '>
                  <div className='w-full flex justify-start items-start leading-none '><h1 className='dark:text-white text-zinc-900 text-4xl tracking-tighter  font-bold'>Hi, I'm Subham.</h1></div>
                  <div className='w-full  text-md  text-zinc-600 gap-2 '>

                    <div className='flex justify-between items-center text-center w-full mb-2 flex-col sm:flex-row gap-2'>
                     <span className=' text-zinc-400 tracking-tighter text-lg font-bold'> A FullStack Web Developer.</span> 

                    <span className='tracking-tighter w-full sm:w-auto font-medium flex justify-center sm:justify-end items-center gap-1'> <HugeiconsIcon icon={Location03Icon} size={16} /> Kolkata, India.</span></div>
                    </div>
                    <div className=' w-full'>
                   <p className='text-zinc-600 font-medium dark:text-zinc-300 text-sm leading-relaxed tracking-tight font-medium'>
                     Building scalable and efficient  <strong> web applications</strong>  with a passion for crafting seamless user experiences.
                     </p>
                    {/* <div className='text-zinc-600 dark:text-zinc-400 flex items-center gamt-4'>
                        <FaBookOpen className='text-zinc-600 dark:text-zinc-400' />
                        <Text>B.Tech CSE Student at <em>Adamas University</em>, Kolkata, India.</Text>
                    </div> */}
                    </div>



                    <div className='mb-2 mt-4 w-full flex justify-start items-center gap-4'>
                        <Link 
                            to="/resume"
                            className='active:scale-95 inline-flex justify-center items-center gabg-black/10 dark:bg-white/10 border border-black/20 dark:border-zinc-400/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ease-in-out duration-300 py-2 px-2 rounded-xl cursor-pointer text-sm font-medium hover:shadow-md'
                        >
                            <BsEnvelopePaper/> Resume/CV
                        </Link>
                        <Link to="/contact"
                            className='active:scale-95 inline-flex justify-center items-center  bg-black dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-white dark:text-zinc-900 shadow hover:bg-zinc-900 dark:hover:bg-white transition-all ease-in-out duration-300 py-2 px-2 rounded-xl cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BiPaperPlane />Get in Touch
                        </Link>              
                    </div>

                      <Socials />

                      
              <div className='w-full rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 p-4 shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)] flex justify-center items-center'>
              <div className='github-calendar-coverer w-full flex justify-center'>
                <GitHubCalendar 
                  username="subham12r" 
                  showWeekdayLabels={false}
                  hideTotalCount={false}
                  fontSize={10}
                  blockSize={8}
                  blockMargin={2}
                  colorScheme={theme}
                />
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className='w-full mt-6'>
              <div className='w-full flex justify-start items-center mb-4 mt-8 mb-2 underline-offset-4 underline decoration-dashed'>
                <h2 className='text-zinc-900 dark:text-white font-bold text-3xl tracking-tight'>Tech Stack.</h2>
              </div>
              <div className='w-full rounded-lg border border-dashed border-gray-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-950 p-4 shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_2px_0_rgba(255,255,255,0.1)]'>
                <div className='grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3'>
                  {/* Programming Languages */}
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/js.png" alt="JavaScript" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/typescript.png" alt="TypeScript" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform '>
                    <img src="/src/assets/logo/html.png" alt="HTML" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                    <img src="/src/assets/logo/css.png" alt="CSS" className='w-full h-full object-cover' />
                  </div>
                  
                  {/* Frontend Frameworks */}
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/react.png" alt="React" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/nextjs.jpeg" alt="Next.js" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/tailwindcss.jpeg" alt="Tailwind CSS" className='w-full h-full object-cover' />
                  </div>
                  
                  {/* Backend & Database */}
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/nodejs.png" alt="Node.js" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden '>
                    <img src="/src/assets/logo/mongodb.png" alt="MongoDB" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/supabase.jpeg" alt="Supabase" className='w-full h-full object-cover' />
                  </div>
                  
                  {/* Tools & Services */}
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                    <img src="/src/assets/logo/github.png" alt="GitHub" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform'>
                    <img src="/src/assets/logo/figma.png" alt="Figma" className='w-full h-full object-cover' />
                  </div>
                  {/* Animation & Libraries */}
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 bg-black transition-transform'>
                    <img src="/src/assets/logo/gsap.svg" alt="GSAP" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/framer.jpeg" alt="Framer Motion" className='w-full h-full object-cover' />
                  </div>
                  <div className='w-10 h-10  rounded-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden'>
                    <img src="/src/assets/logo/lenis.png" alt="Lenis" className='w-full h-full object-cover' />
                  </div>
                  
       
                  
              
                </div>
              </div>
            </div>
           </div>



        </div>

    </header>
  )
}

export default Header
