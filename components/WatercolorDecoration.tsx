import React from 'react';

interface Props {
  type: 'artichoke' | 'lemon' | 'strawberries' | 'blueberries' | 'rosemary' | 
        'carrots' | 'pomegranate' | 'celery' | 'kale' | 'tomatoes';
  className?: string;
}

const POSITIONS: Record<string, string> = {
  carrots: '5% 15%',
  pomegranate: '50% 8%',
  strawberries: '88% 8%',
  celery: '5% 35%',
  artichoke: '35% 35%',
  lemon: '68% 48%',
  tomatoes: '5% 65%',
  kale: '35% 65%',
  blueberries: '68% 75%',
  rosemary: '88% 35%'
};

const WatercolorDecoration: React.FC<Props> = ({ type, className = '' }) => {
  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        backgroundImage: 'url(/images/watercolors.png)',
        backgroundSize: '600% 600%',
        backgroundPosition: POSITIONS[type] || POSITIONS.artichoke,
        pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite'
      }}
    />
  );
};

export default WatercolorDecoration;