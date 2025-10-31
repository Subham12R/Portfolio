/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import { RiRobot2Fill, RiSendPlaneFill, RiCloseFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    "What technologies do you work with?",
    "Tell me about your recent projects",
    "How can I contact you for work?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQuickQuestion = (question) => {
    // Handle quick question click
    console.log('Quick question:', question);
    setInputMessage(question);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).replace(' ', ' ');
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 350,
              damping: 30,
              duration: 0.3
            }}
            style={{ transformOrigin: "bottom right" }}
            className='fixed md:bottom-8 md:right-20 bottom-4 right-4 w-96 h-[500px] bg-gradient-to-br from-black/95 to-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden z-50'
          >
            {/* Header */}
            <div className='bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 backdrop-blur-md p-4 flex items-center justify-between border-b border-zinc-700/60'>
              <div className='flex items-center gap-3'>
                {/* Avatar */}
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center relative shadow-lg'>
                  <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Head */}
                    <circle cx="50" cy="50" r="40" fill="#D97706"/>
                    {/* Beard */}
                    <path d="M 50 75 Q 60 65 65 75 Q 65 85 50 85 Q 35 85 35 75 Q 40 65 50 75" fill="#78350F"/>
                    {/* Glasses */}
                    <circle cx="40" cy="45" r="10" stroke="#1F2937" strokeWidth="3" fill="none"/>
                    <circle cx="60" cy="45" r="10" stroke="#1F2937" strokeWidth="3" fill="none"/>
                    <line x1="50" y1="45" x2="50" y2="45" stroke="#1F2937" strokeWidth="3"/>
                    <line x1="30" y1="45" x2="25" y2="42" stroke="#1F2937" strokeWidth="3"/>
                    <line x1="70" y1="45" x2="75" y2="42" stroke="#1F2937" strokeWidth="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className='text-white font-semibold text-base tracking-tight'>Portfolio Assistant</h3>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'></span>
                    <p className='text-green-400 text-xs font-medium'>Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800'
                aria-label="Close chat"
              >
                <RiCloseFill size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-zinc-950/50'>
              {/* Assistant's Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='flex justify-start'
              >
                <div className='flex gap-3 max-w-[85%]'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md'>
                    <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="40" fill="#D97706"/>
                      <path d="M 50 75 Q 60 65 65 75 Q 65 85 50 85 Q 35 85 35 75 Q 40 65 50 75" fill="#78350F"/>
                      <circle cx="40" cy="45" r="10" stroke="#1F2937" strokeWidth="3" fill="none"/>
                      <circle cx="60" cy="45" r="10" stroke="#1F2937" strokeWidth="3" fill="none"/>
                      <line x1="50" y1="45" x2="50" y2="45" stroke="#1F2937" strokeWidth="3"/>
                      <line x1="30" y1="45" x2="25" y2="42" stroke="#1F2937" strokeWidth="3"/>
                      <line x1="70" y1="45" x2="75" y2="42" stroke="#1F2937" strokeWidth="3"/>
                    </svg>
                  </div>
                  <div className='bg-zinc-800/90 rounded-2xl p-3 text-white shadow-lg'>
                    <p className='text-sm leading-relaxed'>
                      Hello! I'm your Portfolio Assistant. How can I help you?
                    </p>
                    <p className='text-xs text-zinc-400 text-right mt-2 font-mono'>{getCurrentTime()}</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Questions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mt-6'
              >
                <p className='text-white text-sm mb-3 font-semibold tracking-wide uppercase'>Quick questions:</p>
                <div className='space-y-2'>
                  {quickQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='w-full bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm rounded-xl px-4 py-3 text-left transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600 hover:shadow-lg'
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className='p-3 border-t border-zinc-700/60 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 backdrop-blur-md'>
              <div className='flex items-center gap-2'>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder='Ask me about my work and experience...'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim()) {
                      e.preventDefault();
                      setInputMessage('');
                    }
                  }}
                  className='flex-1 bg-zinc-800/90 border border-zinc-700/60 px-4 py-2.5 rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200'
                />
                <motion.button
                  onClick={() => {
                    if (inputMessage.trim()) {
                      setInputMessage('');
                    }
                  }}
                  disabled={!inputMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border border-yellow-600 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none'
                >
                  <RiSendPlaneFill className='text-white' size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 360 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className='fixed md:bottom-8 md:right-20 bottom-4 right-4 bg-gradient-to-br from-yellow-500 to-yellow-600 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 z-50'
        aria-label="Toggle chat assistant"
      >
        <RiRobot2Fill size={24} className='text-white' />
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg'
          />
        )}
      </motion.button>
    </>
  )
}

export default Assistant
