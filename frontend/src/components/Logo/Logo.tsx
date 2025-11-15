import React, { useState } from 'react';
import './Logo.scss';

// Import logo image - replace this path with your custom logo
// You can also use a URL directly by passing imageUrl prop
// If the image doesn't exist, the component will use SVG fallback
// To use a local image, uncomment the line below and ensure the file exists:
// import logoImage from '../../assets/images/lincoln-logo.png';
const logoImage: string | undefined = undefined; // Set to imported image when available

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  useImage?: boolean; // Set to true to use image instead of SVG (default: false if no image)
  imageUrl?: string; // Optional: URL to external image (overrides local import)
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', useImage, imageUrl }) => {
  const [imageError, setImageError] = useState(false);
  const imageSource = imageUrl || logoImage;
  // Only use image if explicitly enabled and source exists, or if imageUrl is provided
  const shouldUseImage = (useImage !== false) && imageSource && !imageError;
  
  return (
    <div className={`logo-container logo-${size}`}>
      {shouldUseImage ? (
        <img 
          src={imageSource} 
          alt="LINCOLN Logo" 
          className="logo-image"
          onError={() => {
            // Fallback to SVG if image fails to load
            setImageError(true);
          }}
        />
      ) : null}
      <svg
        className="logo-svg"
        style={{ display: shouldUseImage ? 'none' : 'block' }}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield shape - cybersecurity symbol */}
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
          <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        
        {/* Shield background */}
        <path
          d="M60 10 L20 30 L20 60 Q20 90 40 105 Q60 120 60 120 Q60 120 80 105 Q100 90 100 60 L100 30 Z"
          fill="url(#shieldGradient)"
          stroke="#00d4ff"
          strokeWidth="2"
          opacity="0.9"
        />
        
        {/* Lock icon inside shield */}
        <g transform="translate(60, 60)">
          {/* Lock body */}
          <rect
            x="-15"
            y="-5"
            width="30"
            height="25"
            rx="2"
            fill="url(#lockGradient)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Lock shackle */}
          <path
            d="M -15 -5 Q -15 -15 0 -15 Q 15 -15 15 -5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Keyhole */}
          <circle cx="0" cy="8" r="4" fill="#0a1929" />
          <rect x="-1.5" y="8" width="3" height="8" fill="#0a1929" />
        </g>
        
        {/* Decorative lines */}
        <line x1="20" y1="30" x2="100" y2="30" stroke="#00ff88" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="50" x2="90" y2="50" stroke="#00d4ff" strokeWidth="1" opacity="0.3" />
      </svg>
      <div className="logo-text">LINCOLN</div>
      <div className="logo-subtitle">Sistema de Seguridad</div>
    </div>
  );
};

export default Logo;

