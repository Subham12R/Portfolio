import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// Smoke particle component
const SmokeParticle = ({ particle }) => {
  const rad = (particle.rotation * Math.PI) / 180;
  const driftOffset = Math.cos(rad + Math.PI / 2) * 30; // Perpendicular drift
  
  return (
    <motion.div
      initial={{
        x: particle.x,
        y: particle.y,
        opacity: 0.8,
        scale: 0.5,
      }}
      animate={{
        x: particle.x + driftOffset + (Math.random() - 0.5) * 20,
        y: particle.y - 40 + (Math.random() - 0.5) * 15,
        opacity: 0,
        scale: 1.5,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1,
        ease: 'easeOut',
      }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        style={{
          imageRendering: 'crisp-edges',
          WebkitImageRendering: 'pixelated',
        }}
      >
        {/* Pixelated smoke puff */}
        <circle cx="6" cy="6" r="5" fill="#94A3B8" opacity="0.7" />
        <circle cx="4" cy="5" r="3" fill="#CBD5E1" opacity="0.6" />
        <circle cx="8" cy="7" r="2.5" fill="#E2E8F0" opacity="0.5" />
        <rect x="3" y="3" width="1" height="1" fill="#64748B" />
        <rect x="8" y="4" width="1" height="1" fill="#64748B" />
        <rect x="5" y="8" width="1" height="1" fill="#64748B" />
      </svg>
    </motion.div>
  );
};

const PixelCar = () => {
  const [isStopped, setIsStopped] = useState(false);
  const initialX = typeof window !== 'undefined' ? window.innerWidth / 2 : 100;
  const initialY = typeof window !== 'undefined' ? window.innerHeight / 2 : 100;
  const [mousePosition, setMousePosition] = useState({ x: initialX, y: initialY });
  const [smokeParticles, setSmokeParticles] = useState([]);
  const [rotation, setRotation] = useState(0);
  const carRef = useRef(null);
  const smokeIdRef = useRef(0);
  const prevPosRef = useRef({ x: initialX, y: initialY });
  const rotationRef = useRef(0);
  
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  
  // Smooth spring animation for drifting effect
  const springConfig = { damping: 15, stiffness: 100 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  // Create smoke particles when moving
  useEffect(() => {
    if (!isStopped && carRef.current) {
      const interval = setInterval(() => {
        const rect = carRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate smoke position behind car based on rotation
        const rad = (rotationRef.current * Math.PI) / 180;
        const offsetX = Math.cos(rad + Math.PI) * 15; // Behind car
        const offsetY = Math.sin(rad + Math.PI) * 15;
        
        const newParticle = {
          id: smokeIdRef.current++,
          x: centerX + offsetX,
          y: centerY + offsetY,
          rotation: rotationRef.current,
        };
        
        setSmokeParticles((prev) => [...prev, newParticle]);
        
        // Remove particle after animation
        setTimeout(() => {
          setSmokeParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 1000);
      }, 100); // Create smoke every 100ms
      
      return () => clearInterval(interval);
    }
  }, [isStopped]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isStopped) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        x.set(e.clientX);
        y.set(e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isStopped, x, y]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsStopped(true);
    // Update position to current mouse position when stopped
    setMousePosition({ x: e.clientX, y: e.clientY });
    x.set(e.clientX);
    y.set(e.clientY);
  };

  const handleClick = () => {
    // Resume movement on single click
    if (isStopped) {
      setIsStopped(false);
    }
  };

  // Calculate rotation based on movement direction
  useEffect(() => {
    if (!isStopped) {
      const deltaX = mousePosition.x - prevPosRef.current.x;
      const deltaY = mousePosition.y - prevPosRef.current.y;
      
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        setRotation(angle);
        rotationRef.current = angle;
      }
      
      prevPosRef.current = mousePosition;
    }
  }, [mousePosition, isStopped]);
  
  return (
    <>
      {/* Smoke particles */}
      <AnimatePresence>
        {smokeParticles.map((particle) => (
          <SmokeParticle key={particle.id} particle={particle} />
        ))}
      </AnimatePresence>
      
      {/* Car */}
      <motion.div
        ref={carRef}
        style={{
          position: 'fixed',
          x: xSpring,
          y: ySpring,
          left: -12,
          top: -10,
          zIndex: 9999,
          pointerEvents: 'auto',
          imageRendering: 'pixelated',
          WebkitImageRendering: 'pixelated',
        }}
        animate={{
          rotate: rotation,
        }}
        transition={{
          rotate: { duration: 0.3, ease: 'easeOut' },
        }}
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        className="cursor-pointer"
      >
        {/* Realistic Pixelated Car SVG - smaller and more detailed */}
        <svg
          width="28"
          height="20"
          viewBox="0 0 28 20"
          style={{
            imageRendering: 'crisp-edges',
            WebkitImageRendering: 'pixelated',
            filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.4))',
          }}
          className="pixelated"
        >
          {/* Car body - more realistic proportions */}
          <rect x="3" y="10" width="22" height="8" fill="#2563EB" stroke="#1E40AF" strokeWidth="0.5" />
          <rect x="6" y="5" width="16" height="7" fill="#2563EB" stroke="#1E40AF" strokeWidth="0.5" />
          
          {/* Car roof detail */}
          <rect x="6" y="5" width="16" height="2" fill="#1E40AF" strokeWidth="0.3" />
          
          {/* Windshield */}
          <rect x="8" y="6" width="5" height="5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
          <line x1="8" y1="7" x2="13" y2="7" stroke="#3B82F6" strokeWidth="0.3" />
          <line x1="8" y1="9" x2="13" y2="9" stroke="#3B82F6" strokeWidth="0.3" />
          
          {/* Rear window */}
          <rect x="15" y="6" width="5" height="5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="0.5" />
          <line x1="15" y1="7" x2="20" y2="7" stroke="#3B82F6" strokeWidth="0.3" />
          
          {/* Wheels - more realistic */}
          <rect x="6" y="16" width="4" height="4" fill="#111827" stroke="#000000" strokeWidth="0.5" />
          <rect x="7" y="17" width="2" height="2" fill="#374151" />
          <rect x="8.5" y="17.5" width="0.5" height="0.5" fill="#6B7280" />
          
          <rect x="18" y="16" width="4" height="4" fill="#111827" stroke="#000000" strokeWidth="0.5" />
          <rect x="19" y="17" width="2" height="2" fill="#374151" />
          <rect x="20.5" y="17.5" width="0.5" height="0.5" fill="#6B7280" />
          
          {/* Car details */}
          <line x1="4" y1="13" x2="24" y2="13" stroke="#1E40AF" strokeWidth="0.5" />
          
          {/* Tailpipe/Exhaust */}
          <rect x="25" y="12" width="1" height="2" fill="#1F2937" stroke="#111827" strokeWidth="0.3" />
          <rect x="26" y="12.5" width="0.5" height="1" fill="#374151" />
          
          {/* Headlights */}
          <rect x="1" y="10" width="1.5" height="2" fill="#FDE047" stroke="#FACC15" strokeWidth="0.3" />
          <rect x="1" y="13" width="1.5" height="2" fill="#FDE047" stroke="#FACC15" strokeWidth="0.3" />
          <rect x="1.2" y="11" width="0.3" height="0.3" fill="#FEF3C7" />
          <rect x="1.2" y="14" width="0.3" height="0.3" fill="#FEF3C7" />
          
          {/* Side details */}
          <line x1="12" y1="10" x2="12" y2="18" stroke="#1E40AF" strokeWidth="0.3" />
          <rect x="22" y="8" width="2" height="1" fill="#64748B" strokeWidth="0.2" />
        </svg>
        
        {/* Stop indicator */}
        {isStopped && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-red-500 whitespace-nowrap"
            style={{
              fontFamily: 'monospace',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)',
            }}
          >
            STOPPED
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default PixelCar;

