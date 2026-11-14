import React from 'react';

const AuthCard = ({ isFlipped, children }) => {
  return (
    <div className={`auth-card ${isFlipped ? 'flipped' : ''}`}>
      {React.Children.map(children, (child, index) => {
        const hidden = isFlipped ? index === 0 : index === 1;
        return (
          // `inert` keeps the hidden side out of the tab order and screen readers
          <div className={`auth-side ${index === 1 ? 'auth-back' : ''}`} aria-hidden={hidden} inert={hidden ? '' : undefined}>
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default AuthCard;
