/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import { RiRobot2Fill, RiSendPlaneFill, RiCloseFill, RiLoader4Fill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import apiService from '../../services/api';

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 👋 I\'m your AI assistant. I can help you learn about this portfolio, answer questions about the developer\'s skills and projects, or guide you through the site. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call the API
      const response = await apiService.chatWithAssistant(userMessage, conversationHistory);
      
      // Add assistant response to chat
      const assistantMessage = { role: 'assistant', content: response.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your connection.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='fixed md:bottom-8 md:right-20 bottom-4 right-4 z-50'>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0, 
              y: 0,
              x: 0
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              x: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0,
              y: 0,
              x: 0
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.5,
              duration: 0.4
            }}
            style={{
              transformOrigin: "bottom right"
            }}
            className='absolute bottom-10 right-0 md:bottom-12 md:right-5 w-80 h-[500px] bg-zinc-400/20 dark:bg-zinc-800/30 backdrop-blur-lg rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-zinc-300/30 dark:border-zinc-700/30 flex flex-col overflow-hidden'
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className='bg-zinc-300/20 dark:bg-zinc-700/30 backdrop-blur-md p-3 flex items-center justify-between border-b border-zinc-300/30 dark:border-zinc-700/30'
            >
              <div className='flex items-center gap-2'>
                <RiRobot2Fill className='text-zinc-900 dark:text-white' size={20} />
                <h3 className='text-zinc-900 dark:text-white font-semibold text-sm'>AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors'
              >
                <RiCloseFill size={18} />
              </button>
            </motion.div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-3 space-y-3'>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                        : 'bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <p className='text-xs leading-relaxed whitespace-pre-wrap'>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-zinc-200/50 dark:bg-zinc-700/50 rounded-lg px-3 py-2 flex items-center gap-2'>
                    <RiLoader4Fill className='animate-spin text-zinc-700 dark:text-zinc-300' size={14} />
                    <p className='text-xs text-zinc-700 dark:text-zinc-300'>Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className='absolute bottom-0 right-0 left-0 p-2 border-t border-zinc-300/30 dark:border-zinc-700/30 bg-zinc-300/20 dark:bg-zinc-700/20 backdrop-blur-md'
            >
              <div className='flex items-center gap-2'>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder='Ask me anything...'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className='flex-1 bg-zinc-900 dark:bg-white px-3 py-2 rounded-md border-none outline-none text-white dark:text-black text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className='bg-zinc-900 dark:bg-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 hover:bg-zinc-200 transition duration-300 ease-in disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? (
                    <RiLoader4Fill className='animate-spin text-white dark:text-black' size={16} />
                  ) : (
                    <RiSendPlaneFill className='text-white dark:text-black' size={16} />
                  )}
                </button>
              </div>
            </motion.div>
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
        className='bg-zinc-900 dark:bg-white w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg'
      >
        <RiRobot2Fill size={20} className='text-white dark:text-black' />
      </motion.button>
    </div>
  )
}

export default Assistant
