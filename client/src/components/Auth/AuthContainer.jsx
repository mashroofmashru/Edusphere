// components/Auth/AuthContainer.jsx
import React, { useState } from 'react';
import AuthCard from './AuthCard';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './Auth.css';

const AuthContainer = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="auth-container">
      <AuthCard isFlipped={isFlipped}>
        <LoginForm onFlip={handleFlip} />
        <SignupForm onFlip={handleFlip} />
      </AuthCard>
    </div>
  );
};

export default AuthContainer;