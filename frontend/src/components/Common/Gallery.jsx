import React from 'react'
import AnimeImg from '../../assets/deku.jpg'

const Gallery = ({ quote }) => {
  return (
    <div id="contact" className='mt-8 mb-8'>
      <div className='relative w-full min-h-[600px]'>
        {/* Gallery Container with unevenly placed images */}
        <div className='relative w-full h-full'>
          {/* Image 1 - Large, top-left, slight rotation */}
          <div className='absolute top-0 left-0 w-64 h-80 md:w-80 md:h-96 z-10 -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 hover:z-20'>
            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/10'>
              <img 
                src={AnimeImg}
                alt="Gallery Image 1"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>
              {quote && (
                <div className='absolute bottom-4 left-4 right-4'>
                  <blockquote className='text-white text-sm font-serif italic leading-relaxed'>
                    "{quote.text}"
                  </blockquote>
                  <p className='text-white/80 text-xs mt-2'>— {quote.author}</p>
                </div>
              )}
            </div>
          </div>

          {/* Image 2 - Medium, top-right, slight rotation */}
          <div className='absolute top-8 right-0 md:right-8 w-48 h-64 md:w-64 md:h-80 z-20 rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 hover:z-30'>
            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/10'>
              <img 
                src={AnimeImg}
                alt="Gallery Image 2"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent'></div>
            </div>
          </div>

          {/* Image 3 - Small, middle-left, negative rotation */}
          <div className='absolute top-64 md:top-80 left-8 md:left-16 w-40 h-56 md:w-56 md:h-72 z-15 rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 hover:z-25'>
            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/10'>
              <img 
                src={AnimeImg}
                alt="Gallery Image 3"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent'></div>
            </div>
          </div>

          {/* Image 4 - Medium, bottom-center, slight rotation */}
          <div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 w-52 h-72 md:w-72 md:h-96 z-10 -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 hover:z-20'>
            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/10'>
              <img 
                src={AnimeImg}
                alt="Gallery Image 4"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent'></div>
            </div>
          </div>

          {/* Image 5 - Small, bottom-right, positive rotation */}
          <div className='absolute bottom-16 right-4 md:right-16 w-44 h-60 md:w-60 md:h-80 z-20 rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 hover:z-30'>
            <div className='relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-white/10'>
              <img 
                src={AnimeImg}
                alt="Gallery Image 5"
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-bl from-green-500/20 via-transparent to-transparent'></div>
            </div>
          </div>

          {/* Daily Tool Stack Card - Overlay on gallery */}
          <div className='absolute top-1/2 right-0 md:right-8 -translate-y-1/2 w-56 md:w-72 z-30 bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-sm rounded-lg border border-zinc-800 dark:border-zinc-700 p-4 md:p-6 shadow-2xl'>
            <div className='flex flex-col gap-2 mb-4'>
              <h3 className='text-white text-xs md:text-sm font-light tracking-wider uppercase'>Daily</h3>
              <h3 className='text-white text-xl md:text-2xl font-bold'>Tool</h3>
              <h3 className='text-white text-xl md:text-2xl font-bold'>Stack.</h3>
            </div>
            {/* Gradient bar */}
            <div className='h-10 md:h-12 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 relative overflow-hidden'>
              <div className='absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_3s_infinite]'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gallery


