import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useTheme } from '../contexts/ThemeContext';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { toast } from 'sonner';

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

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target);
      formData.append("access_key", "1f32a7c1-b945-4d32-859f-a68184967e86");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Message sent successfully! I'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white dark:bg-zinc-950 w-full h-full lg:max-w-2xl mx-auto px-4 py-4 mb-2'>
      {/* Header Section */}
      <div className='mt-6 mb-6'>
        <p className='text-gray-400 dark:text-gray-500 text-sm'>Get in Touch.</p>
        <h1 className='text-black dark:text-white font-bold text-2xl'>Contact Me</h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1 text-sm'>
          I'd love to hear from you. Send me a message and I'll respond as soon as possible!
        </p>
      </div>

      {/* Contact Information */}
      <div className='mb-6'>
        <h2 className='text-black dark:text-white font-bold text-lg mb-4'>Contact Information</h2>
        
        <div className="flex flex-row justify-start items-center gap-6">
          <Tip title="Send me an email" placement="top" arrow isDark={isDark}>
            <a 
              href="mailto:rikk4335@gmail.com" 
              className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
            >
              <FaEnvelope size={24}/>
            </a>
          </Tip>
          
          <Tip title="Call me" placement="top" arrow isDark={isDark}>
            <a 
              href="tel:+919434474878" 
              className='text-zinc-800 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 transition-all duration-150'
            >
              <FaPhone size={24}/>
            </a>
          </Tip>
          
          <Tip title="Kolkata, West Bengal" placement="top" arrow isDark={isDark}>
            <div className='text-zinc-800 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 cursor-pointer'>
              <FaMapMarkerAlt size={24}/>
            </div>
          </Tip>
        </div>
      </div>

      {/* Social Links */}
      <div className='mb-6'>
        <h2 className='text-black dark:text-white font-bold text-lg mb-4'>Follow Me</h2>
        
        <div className="flex flex-row justify-start items-center gap-6">
          <Tip title="Connect on LinkedIn" placement="top" arrow isDark={isDark}>
            <a 
              href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-800 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150'
            >
              <FaLinkedin size={24}/>
            </a>
          </Tip>
          
          <Tip title="View my GitHub profile" placement="top" arrow isDark={isDark}>
            <a 
              href="https://github.com/Subham12R" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-800 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-150'
            >
              <FaGithub size={24}/>
            </a>
          </Tip>
          
          <Tip title="Follow me on Twitter" placement="top" arrow isDark={isDark}>
            <a 
              href="https://twitter.com/Subham12R" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-800 dark:text-zinc-500 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-150'
            >
              <FaSquareXTwitter size={24}/>
            </a>
          </Tip>
        </div>
      </div>

      {/* Contact Form */}
      <div className='mb-6'>
        <h2 className='text-black dark:text-white font-bold text-lg mb-4'>Send me a Message</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
              placeholder="Tell me about your project or just say hello!"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Message</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
