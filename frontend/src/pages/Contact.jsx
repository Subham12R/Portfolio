import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, Call02Icon, Location01Icon, Linkedin01Icon, GithubIcon, NewTwitterIcon, ArrowRight01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { useTheme } from '../contexts/ThemeContext';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { toast } from 'sonner';
import { Return } from '../components/Products/Return';

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
    phone: '',
    company: '',
    services: '',
    budget: '',
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
        setFormData({ name: '', email: '', phone: '', company: '', services: '', budget: '', message: '' });
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
    <div className='bg-white dark:bg-zinc-950 w-full min-h-screen lg:max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-8 mb-4 dark:text-white relative overflow-hidden'>
      
      

      <Return />
      {/* Header Section */}
      <div className='relative z-10 mt-4 sm:mt-8 mb-8 sm:mb-12'>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
          <div className="mb-6 sm:mb-0">
            <h1 className='text-zinc-900 dark:text-white font-bold text-6xl  lg:text-8xl mb-4 leading-tight'>
              Let's work<br />together!
            </h1>
          </div>
        </div>
        <p className='text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-full sm:max-w-md'>
          Let us help you become even greater at what you do.<br />
          Fill out the following form and we will get back to you in the next 24 hours.
        </p>
      </div>

      {/* Contact Information - Mobile */}
      <div className='relative z-10 mb-8 block md:hidden'>
        <div className='grid grid-cols-2 gap-6 text-xs text-zinc-700 dark:text-zinc-300'>
          <div>
            <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">CALL US</h3>
            <p>+91 94344 74878</p>
          </div>
          <div>
            <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">Email</h3>
            <p>rikk4335@gmail.com</p>
          </div>
          
          <div>
            <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">ADDRESS</h3>
            <p>Kolkata, India</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-3 tracking-wider uppercase text-xs">SOCIALS</h3>
          <div className='flex gap-4'>
            <Tip title="Connect on LinkedIn" placement="top" arrow isDark={isDark}>
              <a 
                href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
              >
                <HugeiconsIcon icon={Linkedin01Icon} size={20} />
              </a>
            </Tip>
            
            <Tip title="Follow me on Twitter" placement="top" arrow isDark={isDark}>
              <a 
                href="https://twitter.com/Subham12R" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
              >
                <HugeiconsIcon icon={NewTwitterIcon} size={20} />
              </a>
            </Tip>
            
            <Tip title="View my GitHub profile" placement="top" arrow isDark={isDark}>
              <a 
                href="https://github.com/Subham12R" 
                target="_blank" 
                rel="noopener noreferrer"
                className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
              >
                <HugeiconsIcon icon={GithubIcon} size={20} />
              </a>
            </Tip>
          </div>
        </div>
      </div>

      {/* Contact Information Sidebar - Desktop */}
      <div className='absolute top-30 right-8 space-y-6 text-xs text-zinc-600 dark:text-zinc-300 z-10 hidden md:block'>
        <div>
          <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">CALL US</h3>
          <p>+91 94344 74878</p>

        </div>
        
        <div>
          <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">EMAIL</h3>
          <p>rikk4335@gmail.com</p>

        </div>
        
        
        <div>
          <h3 className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">ADDRESS</h3>
          <p>Kolkata,</p>
          <p>India</p>
        </div>

        <div className="flex justify-center flex-col space-x-4 ">
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold mb-2 tracking-wider uppercase">Socials</span>
          <div className='flex gap-2'>
          <Tip title="Connect on LinkedIn" placement="top" arrow isDark={isDark}>
            <a 
              href="https://www.linkedin.com/in/subham-karmakar-663b1031b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
            >
              <HugeiconsIcon icon={Linkedin01Icon} size={16} />
            </a>
          </Tip>
          
          <Tip title="Follow me on Twitter" placement="top" arrow isDark={isDark}>
            <a 
              href="https://twitter.com/Subham12R" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
            >
              <HugeiconsIcon icon={NewTwitterIcon} size={16} />
            </a>
          </Tip>
          
          <Tip title="View my GitHub profile" placement="top" arrow isDark={isDark}>
            <a 
              href="https://github.com/Subham12R" 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all duration-150'
            >
              <HugeiconsIcon icon={GithubIcon} size={16} />
            </a>
          </Tip>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className='relative z-10 w-full max-w-full sm:max-w-md'>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Name */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">01</span>
              <label htmlFor="name" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What's your name?
              </label>
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none py-2 sm:py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors text-sm sm:text-base"
              placeholder="Type your full name"
            />
          </div>

          {/* Email */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">02</span>
              <label htmlFor="email" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What's your email address?
              </label>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none py-2 sm:py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors text-sm sm:text-base"
              placeholder="example@email.com"
            />
          </div>

          {/* Phone */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">03</span>
              <label htmlFor="phone" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What's your phone number?
              </label>
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none py-2 sm:py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors text-sm sm:text-base"
              placeholder="+1 2222 333544"
            />
          </div>

          {/* Company */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">04</span>
              <label htmlFor="company" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What's your company/organization name?
              </label>
            </div>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none py-2 sm:py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors text-sm sm:text-base"
              placeholder="Type your company/organization name"
            />
          </div>

          {/* Services */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">05</span>
              <label htmlFor="services" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What's services are you looking for?
              </label>
            </div>
            <select
              id="services"
              name="services"
              value={formData.services}
              onChange={handleInputChange}
              className="w-full border-b border-zinc-400 dark:border-zinc-600 outline-none py-2 sm:py-3 bg-white dark:bg-zinc-950 backdrop-blur-2xl text-zinc-900 dark:text-white transition-colors cursor-pointer text-sm sm:text-base"
            >
              <option value="" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Choose from a list here...</option>
              <option value="web-development" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Web Development</option>
              <option value="mobile-app" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Mobile App Development</option>
              <option value="ui-ux-design" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">UI/UX Design</option>
              <option value="consulting" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Technical Consulting</option>
              <option value="other" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Other</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">06</span>
              <label htmlFor="budget" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                What have you budgeted for this project?
              </label>
            </div>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full border-b border-zinc-400 dark:border-zinc-600 outline-none py-2 sm:py-3 bg-white dark:bg-zinc-950 backdrop-blur-2xl text-zinc-900 dark:text-white transition-colors cursor-pointer text-sm sm:text-base"
            >
              <option value="" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Choose from a list here...</option>
              <option value="under-5k" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Under $5,000</option>
              <option value="5k-15k" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">$5,000 - $15,000</option>
              <option value="15k-30k" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">$15,000 - $30,000</option>
              <option value="30k-50k" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">$30,000 - $50,000</option>
              <option value="over-50k" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200">Over $50,000</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-start flex-col items-start space-y-2">
              <span className="text-zinc-600 dark:text-zinc-200 rounded-full flex items-center justify-center text-sm">07</span>
              <label htmlFor="message" className="text-zinc-800 dark:text-zinc-200 font-medium text-base sm:text-lg">
                Tell us about your project
              </label>
            </div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={2}
              className="w-full bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:border-zinc-600 dark:focus:border-zinc-400 outline-none py-2 sm:py-3 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 transition-colors resize-none text-sm sm:text-base"
              placeholder="Please type your project description"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full sm:w-auto px-6 py-3 sm:py-2 bg-transparent border border-zinc-400 dark:border-zinc-500 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm uppercase tracking-wider"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-800 dark:border-zinc-200 border-t-transparent rounded-full animate-spin" />
                <span>SENDING...</span>
              </>
            ) : (
              <>
                <span>SEND MESSAGE</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
