
import React from 'react';

export const EkegusiiLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g fill="currentColor">
      <path d="M50 5 a 45 45 0 0 1 0 90 a 45 45 0 0 1 0 -90 M50 15 a 35 35 0 0 0 0 70 a 35 35 0 0 0 0 -70" fillRule="evenodd"/>
      <circle cx="50" cy="50" r="10"/>
      <path d="M30 30 L70 70 M70 30 L30 70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
    </g>
  </svg>
);
