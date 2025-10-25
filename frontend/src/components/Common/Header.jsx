import React, { useState } from 'react';
import Navbar from './Navbar';
import profileImage from '../../assets/profile.png';
import DecryptedText from './DecryptedText';
import ContactModal from './ContactModal';
import {FaReact} from 'react-icons/fa';
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";
import { RiClipboardFill, RiNextjsFill, RiNodejsFill, RiTailwindCssFill } from "react-icons/ri";
import { SiExpress } from "react-icons/si";
import { BiLogoPostgresql, BiPaperPlane } from "react-icons/bi";

const Header = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Function to download resume
  const downloadResume = async () => {
    try {
      const response = await fetch('https://portfolio-fqur.vercel.app/api/upload/resume');
      const data = await response.json();
      
      if (data.success) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = data.filename || 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Resume not found. Please upload a resume first.');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <header className="border-gray-200">
        {/* Navbar - Already sticky */}
        <Navbar />

        {/* Profile Content */}
        <div className='bg-white w-full h-full lg:max-w-2xl mx-auto px-4 py-4 mb-2'>
                    <div className='w-full flex justify-between items-start mb-10 mt-6'>
                                    <div className="relative">
                                        <img src={profileImage} alt="profile image" className='w-24 h-24 rounded-full object-cover shadow-md ' />

                                        <span className="absolute bottom-1 right-3 inline-block w-2 h-2 bg-green-500 rounded-full ring-2 ring-green-200 ring-offset-2 z-10"></span>
                                    </div>

                            </div>
                 <div className='w-full inline-flex flex-col justify-center items-start space-y-2'>
                    <div className='mb-2'>
                        
                    <h1 className='text-3xl font-bold mb-2'>Hi, I'm <span className='text-zinc-800 font-bold '>Subham Karmakar.{" "} </span></h1>
                    <DecryptedText
                        text="A Full Stack Web Developer."
                        speed={200}
                        animateOn='view'
                        maxIterations={20}
                        characters="101010</>?"
                        className="revealed text-xl md:text-3xl font-bold text-zinc-500 tracking-tighter"
                        parentClassName="all-letters text-xl  md:text-3xl font-bold text-gray-500 tracking-tighter"
                        encryptedClassName="encrypted"
                    />
                    </div>

                    <div className=' mb-6 w-full leading-normal '>
                    <p className='gap-2 inline-flex flex-wrap justify-start items-center text-md text-zinc-600 font-medium '>I build interactive and responsive web apps using {" "}  
                     <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5  rounded-md border-dashed border  text-black font-semibold cursor-pointer'><FaReact className='text-blue-500'/>React</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5 rounded-md border-dashed border  text-black font-semibold cursor-pointer'><RiNextjsFill  className='text-black'/>NextJS</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5 rounded-md border-dashed border  text-black font-semibold cursor-pointer'><RiTailwindCssFill  className='text-blue-800'/>TailwindCSS</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5 rounded-md border-dashed border  text-black font-semibold cursor-pointer'><RiNodejsFill  className='text-emerald-500'/>NodeJs</button>
                    <span>, {" "}</span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5 rounded-md border-dashed border  text-black font-semibold cursor-pointer'><SiExpress className='text-red-800'/>Express</button>
                    <span>, and </span>
                    <button className='inline-flex justify-center gap-2 items-center bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  px-2 py-0.5 rounded-md border-dashed border  text-black font-semibold cursor-pointer'><BiLogoPostgresql  className='text-blue-800'/>PostgreSQL</button>
                     <span>. </span>
                    With a focus on UI design and user experience. Currently keeping a close eye on the latest technologies and trends in web development.
                    </p>
                    </div>

                    <div className='mb-6 w-full flex justify-start items-center gap-4'>
                        <button 
                            onClick={downloadResume}
                            className='inline-flex justify-center items-center gap-2 bg-black text-white shadow hover:bg-zinc-800  transition-all ease-in-out duration-300 py-2 px-4 rounded-md cursor-pointer'
                        >
                            <RiClipboardFill/> Resume/CV
                        </button>
                        <button 
                            onClick={() => setIsContactModalOpen(true)}
                            className='inline-flex justify-center items-center gap-2 bg-transparent py-2 px-4 border border-zinc-200 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]  text-black hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]  transition-all ease-in-out duration-300 cursor-pointer'
                        >
                            <BiPaperPlane />Get in Touch
                        </button>
                        
                    </div>

                     <div className='mb-2 flex flex-row justify-center items-center gap-4'>
                        <a href="#" className='text-zinc-400 hover:text-zinc-900 transition-all duration-150'><FaEnvelope size={30}/></a>
                        <a href="#" className='text-zinc-400 hover:text-zinc-900 transition-all duration-150'><FaLinkedin size={30}/></a>
                        <a href="#" className='text-zinc-400 hover:text-zinc-900 transition-all duration-150'><FaGithub size={30}/></a>
                        <a href="#" className='text-zinc-400 hover:text-zinc-900 transition-all duration-150'><FaSquareXTwitter size={30}/></a>
                    </div>
                </div>

        </div>

        {/* Contact Modal */}
        <ContactModal 
          isOpen={isContactModalOpen} 
          onClose={() => setIsContactModalOpen(false)} 
        />
    </header>
  )
}

export default Header