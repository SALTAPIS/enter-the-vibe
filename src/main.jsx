import React from 'react';
import ReactDOM from 'react-dom';
import HeroUI from './HeroUIComponents';

// Make HeroUI components globally available
window.HeroUI = HeroUI;

// Add a more visible console log with component details
console.log('%c HeroUI Components Loaded! ', 'background: #4299e1; color: white; font-size: 16px; padding: 4px;');
console.log('Available components:', Object.keys(HeroUI));

// Create a test element to verify HeroUI is working
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking if HeroUI is available globally:', !!window.HeroUI);
}); 