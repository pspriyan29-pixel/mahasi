'use client';

import React from 'react';

interface LogoProps {
  withText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  animated?: boolean;
}

export default function Logo({ 
  withText = true, 
  size = 'md', 
  className = '', 
  animated = true 
}: LogoProps) {
  
  // Size classes
  const sizeMap = {
    sm: { svg: 'w-7 h-7', text: 'text-base' },
    md: { svg: 'w-10 h-10', text: 'text-xl' },
    lg: { svg: 'w-14 h-14', text: 'text-2xl' },
    xl: { svg: 'w-20 h-20', text: 'text-4xl' },
    custom: { svg: '', text: '' }
  };

  const currentSize = sizeMap[size === 'custom' ? 'md' : size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Container SVG Lambang Petir F */}
      <div className={`relative ${currentSize.svg} shrink-0`}>
        {/* Glow effect back layer */}
        {animated && (
          <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-md scale-110 animate-pulse-glow pointer-events-none" />
        )}
        
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full drop-shadow-md ${animated ? 'animate-logo-hover' : ''}`}
        >
          <defs>
            {/* Gradasi Biru Elektrik Premium sesuai gambar */}
            <linearGradient id="logo-electric-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" /> {/* Blue 800 */}
              <stop offset="40%" stopColor="#2563EB" /> {/* Blue 600 */}
              <stop offset="100%" stopColor="#3B82F6" /> {/* Blue 500 */}
            </linearGradient>
            
            {/* Filter filter glow petir */}
            <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Path Petir "F" Presisi Tinggi sesuai gambar */}
          <path
            d="M 68 37 
               C 69.5 37, 72 38.5, 70 41 
               L 55 58 
               H 68 
               C 71 58, 72.5 60, 69.5 63.5 
               L 35.5 101.5 
               C 33 104.5, 30.5 102.5, 32.5 99 
               L 49.5 68 
               H 38.5 
               C 35 68, 34 65, 36.5 61.5 
               L 55.5 37 
               H 38.5 
               C 36 37, 35 34.5, 37.5 32 
               L 61 5.5 
               C 63 -1.5, 65 0.5, 65 2.5 
               L 53.5 37 
               H 68 Z"
            fill="url(#logo-electric-blue)"
            filter={animated ? 'url(#logo-glow)' : undefined}
            className={animated ? 'animate-lightning-flicker' : ''}
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      </div>

      {/* Teks Logo "FlashWork" */}
      {withText && (
        <span className={`font-black tracking-tight flex items-center ${currentSize.text}`}>
          <span className="text-[#0F172A] dark:text-white">Flash</span>
          <span className="text-blue-600 font-extrabold">Work</span>
        </span>
      )}
    </div>
  );
}
