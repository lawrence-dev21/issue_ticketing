
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
      {title && (
        <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${titleClassName}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
