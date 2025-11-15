import React from 'react';
import './DashboardLogo.scss';

interface DashboardLogoProps {
  size?: 'small' | 'medium' | 'large';
}

const DashboardLogo: React.FC<DashboardLogoProps> = ({ size = 'medium' }) => {
  return (
    <div className={`dashboard-logo-container dashboard-logo-${size}`}>
      {/* Shield with padlock icon */}
      <div className="logo-shield-container">
        <svg
          className="logo-shield-svg"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="dashboardShieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
          
          {/* Shield shape */}
          <path
            d="M60 10 L20 30 L20 60 Q20 90 40 105 Q60 120 60 120 Q60 120 80 105 Q100 90 100 60 L100 30 Z"
            fill="url(#dashboardShieldGradient)"
            stroke="#00d4ff"
            strokeWidth="2"
          />
          
          {/* Padlock inside shield */}
          <g transform="translate(60, 60)">
            {/* Lock body */}
            <rect
              x="-15"
              y="-5"
              width="30"
              height="25"
              rx="2"
              fill="#ffffff"
              stroke="none"
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
        </svg>
      </div>

      {/* LINCOLN text with gradient */}
      <div className="logo-text-container">
        <h1 className="logo-text">LINCOLN</h1>
        <p className="logo-subtitle">Sistema de Seguridad</p>
      </div>
    </div>
  );
};

export default DashboardLogo;

