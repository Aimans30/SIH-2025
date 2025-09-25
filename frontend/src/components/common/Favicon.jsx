import React from 'react';

/**
 * Component to update the favicon dynamically
 */
const Favicon = () => {
  React.useEffect(() => {
    // Create a canvas element to draw the favicon
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#2980b9');
    
    // Draw rounded rectangle background
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 64, 64, 10);
    ctx.fill();

    // Draw building icon
    ctx.fillStyle = 'white';
    ctx.beginPath();
    
    // Simplified building shape
    ctx.moveTo(32, 10); // Top point
    ctx.lineTo(12, 30); // Bottom left
    ctx.lineTo(16, 30); // Bottom left corner
    ctx.lineTo(16, 54); // Left wall
    ctx.lineTo(48, 54); // Bottom
    ctx.lineTo(48, 30); // Right wall
    ctx.lineTo(52, 30); // Bottom right corner
    ctx.closePath();
    ctx.fill();

    // Draw door
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(28, 40, 8, 14);

    // Draw window
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(28, 25, 8, 8);

    // Convert canvas to favicon
    const favicon = document.getElementById('favicon') || document.createElement('link');
    favicon.id = 'favicon';
    favicon.rel = 'shortcut icon';
    favicon.href = canvas.toDataURL('image/png');
    
    // Add or update favicon in document head
    if (!document.getElementById('favicon')) {
      document.head.appendChild(favicon);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default Favicon;
