import React from 'react';
import { FiCalendar } from 'react-icons/fi';

// Diwali Icon (Oil Lamp)
export const DiwaliLight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L4 9v12h16V9l-8-6zm-1 12h2v5h-2v-5z"/>
    <path d="M12 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
  </svg>
);

// Holi Icon (Color Splash)
export const HoliColors = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
  </svg>
);

// Christmas Icon (Star)
export const ChristmasStar = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// Eid Icon (Crescent Moon)
export const EidCrescent = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86z"/>
  </svg>
);

// Default Calendar Icon (Fallback)
export const DefaultFestivalIcon = ({ className }) => (
  <FiCalendar className={className} />
);