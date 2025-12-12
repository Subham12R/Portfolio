"use client";

import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { BiPaperPlane } from "react-icons/bi";
import { RiCloseFill, RiAddFill } from "react-icons/ri";
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';
import profileImage from '../../assets/pfp.jpg';

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Subham's Portfolio Assistant. How can I help you?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const clickTimeoutRef = useRef(null);

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
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQuickQuestion = async (question) => {
    setInputMessage('');
    await sendMessage(question);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for API (excluding the initial greeting)
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || msg.content !== "Hello! I'm Subham's Portfolio Assistant. How can I help you?")
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Send to API
      const response = await apiService.sendAssistantMessage(messageText, conversationHistory);

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get assistant response:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputMessage.trim()) {
      const message = inputMessage.trim();
      setInputMessage('');
      await sendMessage(message);
    }
  };


  return (
    <>
      {/* Gooey Filter Provider */}
      <SkiperGooeyFilterProvider />

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            style={{
              filter: "url(#SkiperGooeyFilter)",
            }}
            className={`fixed md:bottom-20 md:right-12 bottom-20 right-4 w-[480px] max-w-[calc(100vw-2rem)] h-[600px] rounded-lg border  border-zinc-300 dark:border-zinc-700 shadow-sm flex flex-col overflow-hidden z-[100] ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
                : 'bg-white border-zinc-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
            }`}
          >
            {/* Header */}
            <div className={`p-3 flex items-center justify-between border-b ${
              isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'
            }`}>
              <div className='flex items-center gap-3'>
                {/* Avatar */}
                <div className='relative'>
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className='w-10 h-10 rounded-full object-cover border-2 border-zinc-300 dark:border-zinc-700'
                  />
                  {/* Online Status Indicator */}
                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse'></span>
                </div>
                <div>
                  <h3 className={`font-semibold text-sm tracking-tight ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}>
                    Subham's Portfolio Assistant
                  </h3>
                  <div className='flex items-center gap-1.5 mt-0.5'>
                    <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                    <p className='text-green-500 text-[10px] font-medium'>Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`transition-colors p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                aria-label="Close chat"
              >
                <RiCloseFill size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${
              isDark ? 'bg-zinc-950' : 'bg-zinc-50'
            }`}>
              {/* Messages */}
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden border-2 ${
                        isDark ? 'border-zinc-700' : 'border-zinc-300'
                      }`}>
                        <img 
                          src={profileImage} 
                          alt="Assistant" 
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <div className={`rounded-lg p-2.5 shadow-sm ${
                      message.role === 'user'
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        : isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 border border-zinc-200'
                    }`}>
                      <p className='text-xs leading-relaxed whitespace-pre-wrap'>
                        {message.content}
                      </p>
                      <p className={`text-[10px] text-right mt-1.5 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex justify-start'
                >
                  <div className='flex gap-3 max-w-[85%]'>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 overflow-hidden border-2 ${
                      isDark ? 'border-zinc-700' : 'border-zinc-300'
                    }`}>
                      <img 
                        src={profileImage} 
                        alt="Assistant" 
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className={`rounded-lg p-2.5 shadow-sm ${
                      isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 border border-zinc-200'
                    }`}>
                      <div className='flex gap-1'>
                        <span className='w-2 h-2 bg-zinc-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                        <span className='w-2 h-2 bg-zinc-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></span>
                        <span className='w-2 h-2 bg-zinc-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Questions - Only show when chat just opened (only initial message) */}
              {messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='mt-3'
                >
                  <p className={`text-xs mb-2 font-semibold ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    Quick questions:
                  </p>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-1.5'>
                    {quickQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`text-[10px] rounded-md px-2 py-1.5 text-left transition-all duration-200 leading-tight ${
                          isDark
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                            : 'bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200'
                        }`}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-2.5 border-t ${
              isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'
            }`}>
              <div className='flex items-center gap-2'>
                {/* Add Button */}
                
                
                {/* Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder='Ask me about my work and experience...'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim()) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-zinc-800 border border-zinc-700 text-white focus:ring-blue-500/50 focus:border-blue-500/50'
                      : 'bg-white border border-zinc-200 text-zinc-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                />
                
                {/* Send Button */}
                <motion.button
                  onClick={handleSend}
                  disabled={!inputMessage.trim()}
                  whileHover={{ scale: inputMessage.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: inputMessage.trim() ? 0.95 : 1 }}
                  className={`p-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                    inputMessage.trim()
                      ? isDark
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      : isDark
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <BiPaperPlane size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={(event, info) => {
          dragStartPos.current = { x: info.point.x, y: info.point.y };
          hasDragged.current = false;
          // Clear any pending click timeout
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
        }}
        onDrag={(event, info) => {
          const deltaX = Math.abs(info.point.x - dragStartPos.current.x);
          const deltaY = Math.abs(info.point.y - dragStartPos.current.y);
          if (deltaX > 5 || deltaY > 5) {
            hasDragged.current = true;
            // Clear click timeout if dragging
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }
          }
        }}
        onDragEnd={() => {
          // Use a small delay to check if it was a click
          clickTimeoutRef.current = setTimeout(() => {
            if (!hasDragged.current) {
              setIsOpen(!isOpen);
            }
            hasDragged.current = false;
            clickTimeoutRef.current = null;
          }, 100);
        }}
        onTap={() => {
          // onTap works better with drag - fires on tap/click without drag
          if (!hasDragged.current) {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          filter: "url(#SkiperGooeyFilter)",
        }}
        className={`fixed md:bottom-5 md:right-5 bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 z-[101] border-2 cursor-grab active:cursor-grabbing ${
          isDark
            ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
            : 'bg-white hover:bg-zinc-50 border-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chat assistant"
      >
        <div className='relative pointer-events-none'>
          <img 
            src={profileImage} 
            alt="Chat" 
            className='w-8 h-8 rounded-full object-cover'
          />
          {!isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900'
            />
          )}
        </div>
      </motion.button>
    </>
  );
};

// Gooey Filter Provider Component
const SkiperGooeyFilterProvider = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 pointer-events-none"
      version="1.1"
      style={{ width: 0, height: 0 }}
    >
      <defs>
        <filter id="SkiperGooeyFilter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
            result="SkiperGooeyFilter"
          />
          <feBlend in="SourceGraphic" in2="SkiperGooeyFilter" />
        </filter>
      </defs>
    </svg>
  );
};

export default Assistant;
