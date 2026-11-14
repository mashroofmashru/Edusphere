import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AuthCard from './AuthCard';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './Auth.css';

const AuthContainer = () => {
  const location = useLocation();
  // Links can open the card on the sign-up side via <Link state={{ mode: 'signup' }}>
  const [isFlipped, setIsFlipped] = useState(location.state?.mode === 'signup');

  useEffect(() => {
    if (location.state?.mode) setIsFlipped(location.state.mode === 'signup');
  }, [location.state?.mode]);

  return (
    <div className="auth-container">
      <AuthCard isFlipped={isFlipped}>
        <LoginForm onFlip={() => setIsFlipped(true)} active={!isFlipped} />
        <SignupForm onFlip={() => setIsFlipped(false)} active={isFlipped} />
      </AuthCard>
    </div>
  );
};

export default AuthContainer;
