// components/Auth/AuthCard.jsx
import React from 'react';

const AuthCard = ({ isFlipped, children }) => {
  return (
    <div className={`auth-card ${isFlipped ? 'flipped' : ''}`}>
      {React.Children.map(children, (child, index) => (
        <div className={`auth-side ${index === 1 ? 'auth-back' : ''}`}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default AuthCard;