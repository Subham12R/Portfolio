import React from 'react';
import { useNavigate } from 'react-router-dom';
import profileImage from '../../assets/profile.png';
import ResumePdf from '../../assets/Resume.pdf';
import {FaReact} from 'react-icons/fa';
import {RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";
import { BsEnvelopePaper } from "react-icons/bs";
import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";
import { Text } from '@radix-ui/themes';
import TechBadge from './TechBadge';
import bannerImage from '../../assets/banner.gif';

const Header = () => {
  const navigate = useNavigate();

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
        <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto py-6  mt-20'>
                 <div className='w-full inline-flex flex-col justify-center items-start space-y-4'>
                    <div className='mb-1'>
                        
                    <h1 className='text-3xl  dark:text-zinc-200 text-zinc-900 tracking-tight font-bold leading-tight'><span className='font-bold text-zinc-800 dark:text-zinc-200'>Hi, I'm Subham</span> - <Text as='span' className='text-zinc-600 font-bold'>A Full Stack Web Developer.</Text></h1>
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

                    <div className='mt-4 w-full'>
                    <p className='gap-1 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed'>I build interactive and responsive web apps using {" "}  
                     <a href="https://react.dev/" norelopener target="_blank"><TechBadge icon={FaReact} iconClassName='text-blue-500'>React</TechBadge></a>
                    <span>,</span>
                    <a href="https://nextjs.org/" norelopener target="_blank"><TechBadge icon={RiNextjsFill} iconClassName='text-black dark:text-white'>NextJS</TechBadge></a>
                    <span>,</span>
                    <a href="https://tailwindcss.com/" norelopener target="_blank"><TechBadge icon={RiTailwindCssFill} iconClassName='text-blue-800'>TailwindCSS</TechBadge></a>
                    <span>,</span>
                    <a href="https://nodejs.org/" norelopener target="_blank"><TechBadge icon={RiNodejsFill} iconClassName='text-emerald-500'>NodeJs</TechBadge></a>
                    <span>,</span>
                    <span> and </span>
                    <a href="https://www.postgresql.org/" norelopener target="_blank"><TechBadge icon={BiLogoPostgresql} iconClassName='text-blue-800'>PostgreSQL</TechBadge></a>
                     <span>. Focusing on <Text as='span' className='dark:text-white text-black'> <strong>UI/UX Design</strong></Text> and learning <Text as='span' className='dark:text-white text-black'> <strong>Three JS</strong></Text>. Currently keeping a close eye on the latest technologies and trends in web development.</span>
                    
                    </p>
                    {/* <div className='text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-4'>
                        <FaBookOpen className='text-zinc-600 dark:text-zinc-400' />
                        <Text>B.Tech CSE Student at <em>Adamas University</em>, Kolkata, India.</Text>
                    </div> */}
                    </div>



                    <div className='mb-2 w-full flex justify-start items-center gap-4'>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/30 backdrop-blur-sm text-zinc-900 dark:text-white shadow hover:bg-zinc-100 dark:hover:bg-white/40 transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BsEnvelopePaper/> Resume/CV
                        </button>
                        <button 
                            onClick={() => navigate('/contact')}
                            className='inline-flex justify-center items-center gap-2 bg-black dark:bg-white/80 border border-black/20 dark:border-white/30 backdrop-blur-sm text-white dark:text-zinc-900 shadow hover:bg-zinc-900 dark:hover:bg-white transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer text-sm font-medium hover:shadow-md '
                        >
                            <BiPaperPlane />Get in Touch
                        </button>              
                    </div>
                </div>

        </div>

    </header>
  )
}

export default Header
