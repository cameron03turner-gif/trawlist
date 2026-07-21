import React from 'react'

export const AeroDecorations: React.FC = () => {
  return (
    <>
      {/* Base Gradient: Matches nav bar at the top, fades slightly darker or stays dark */}
      <div className="fixed inset-0 pointer-events-none z-[-3]" style={{ background: 'linear-gradient(to bottom, #000000 0%, #060E10 60%)' }} />
      
      {/* Water Pattern Overlay fading into the darker background as it goes up */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-2] opacity-40 mix-blend-screen" 
        style={{ 
          backgroundImage: 'url(/water-pattern.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }} 
      />
    </>
  )
}
