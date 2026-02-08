import React from 'react';

type WatercolorType = 
  | 'artichoke' | 'asparagus' | 'bell pepper' | 'blueberries' 
  | 'carrots' | 'cherry' | 'cucumber' | 'fennel flower'
  | 'garlic' | 'lacinto kale' | 'lemon' | 'onion'
  | 'pomegranate' | 'rosemary' | 'strawberries' | 'tomatoes';

interface WatercolorDecorationProps {
  type: WatercolorType;
  className?: string;
}

const IMAGE_MAP: Record<WatercolorType, string> = {
  'artichoke': 'ARTICHOKE.png',
  'asparagus': 'ASPARAGUS.png',
  'bell pepper': 'BELL PEPPER.png',
  'blueberries': 'BLUEBERRIES.png',
  'carrots': 'CARROTS.png',
  'cherry': 'CHERRY.png',
  'cucumber': 'CUCUMBER.png',
  'fennel flower': 'FENNEL FLOWER.png',
  'garlic': 'GARLIC.png',
  'lacinto kale': 'LACINTO KALE.png',
  'lemon': 'LEMON.png',
  'onion': 'ONION.png',
  'pomegranate': 'POMEGRANATE.png',
  'rosemary': 'ROSEMARY.png',
  'strawberries': 'STRAWBERRIES.png',
  'tomatoes': 'TOMATOES.png'
};

const WatercolorDecoration: React.FC<WatercolorDecorationProps> = ({ type, className = '' }) => {
  const filename = IMAGE_MAP[type];
  const imagePath = `/images/${filename}`;

  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{
        backgroundImage: `url(${imagePath})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        animation: 'float 6s ease-in-out infinite'
      }}
    />
  );
};

export default WatercolorDecoration;
