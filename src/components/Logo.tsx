import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://d64gsuwffb70l.cloudfront.net/6873a1e457bd1eaf39f2254b_1752576863161_2dc0b691.png" 
        alt="Fluxly Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};

export default Logo;