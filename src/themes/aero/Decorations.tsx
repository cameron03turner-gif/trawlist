import React from 'react'

export const AeroDecorations: React.FC = () => {
  return (
    <>
      {/* Base Solid Dark Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-3]" 
        style={{ background: '#060E10' }} 
      />
      
      {/* Water Pattern Overlay: Positioned on the sides with smooth, gradual horizontal gradient fading inward to the dark center column */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-2] opacity-40 mix-blend-screen" 
        style={{ 
          backgroundImage: 'url(/water-pattern.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(80%)',
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 4%, rgba(0,0,0,0.5) 9%, rgba(0,0,0,0.25) 14%, rgba(0,0,0,0.08) 19%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 76%, rgba(0,0,0,0.08) 81%, rgba(0,0,0,0.25) 86%, rgba(0,0,0,0.5) 91%, rgba(0,0,0,0.75) 96%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 4%, rgba(0,0,0,0.5) 9%, rgba(0,0,0,0.25) 14%, rgba(0,0,0,0.08) 19%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 76%, rgba(0,0,0,0.08) 81%, rgba(0,0,0,0.25) 86%, rgba(0,0,0,0.5) 91%, rgba(0,0,0,0.75) 96%, rgba(0,0,0,1) 100%)'
        }} 
      />
    </>
  )
}
