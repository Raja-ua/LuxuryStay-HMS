import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', isDark = true }) => {
  const textColor = isDark ? 'text-[#1b3658]' : 'text-white';
  const iconColor = 'text-[#937648]'; // Bronze accent

  const isLg = size === 'lg';
  const titleSize = isLg ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl';
  const subtitleSize = isLg ? 'text-sm' : 'text-[9px] md:text-[11px]';
  const iconSize = isLg ? 'w-10 h-10 md:w-12 md:h-12' : 'w-6 h-6 md:w-8 md:h-8';
  const spacing = isLg ? 'mb-2' : 'mb-1';

  return (
    <Link to="/" className={`flex flex-col items-center ${textColor} hover:opacity-90 transition-opacity`}>
      {/* Premium Lotus / Crest Icon */}
      <svg 
        className={`${iconSize} ${iconColor} ${spacing}`} 
        viewBox="0 0 24 24" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C12 2 8 8 5 12C2 16 2 19 2 20C2 21.1 2.9 22 4 22C5.5 22 8 20.5 12 16C16 20.5 18.5 22 20 22C21.1 22 22 21.1 22 20C22 19 22 16 19 12C16 8 12 2 12 2Z" />
        <path d="M12 5C12 5 10.5 10 12 14.5C13.5 10 12 5 12 5Z" fill="white" opacity="0.4" />
      </svg>
      <span className={`${titleSize} font-serif tracking-widest leading-none`}>
        LUXURYSTAY
      </span>
      <span className={`${subtitleSize} font-sans tracking-[0.3em] font-light mt-1 uppercase`}>
        Hotels & Resorts
      </span>
    </Link>
  );
};

export default Logo;
