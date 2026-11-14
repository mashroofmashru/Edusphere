import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthContainer = () => {
  const location = useLocation();
  // Links can open the sign-up form directly via <Link state={{ mode: 'signup' }}>
  const [mode, setMode] = useState(location.state?.mode === 'signup' ? 'signup' : 'login');
  const panelRef = useRef(null);
  const switched = useRef(false);

  useEffect(() => {
    if (location.state?.mode) setMode(location.state.mode === 'signup' ? 'signup' : 'login');
  }, [location.state?.mode]);

  useEffect(() => {
    document.title = `${mode === 'signup' ? 'Create Account' : 'Sign In'} | EduSphere`;
    // After switching forms, move focus to the first field so keyboard users aren't lost
    if (switched.current) panelRef.current?.querySelector('input:not([type="radio"])')?.focus();
  }, [mode]);

  const switchTo = (next) => {
    switched.current = true;
    setMode(next);
  };

  return (
    <div ref={panelRef} key={mode} className="w-full max-w-sm animate-fade-in-up">
      {mode === 'login' ? (
        <LoginForm onFlip={() => switchTo('signup')} />
      ) : (
        <SignupForm onFlip={() => switchTo('login')} />
      )}
    </div>
  );
};

export default AuthContainer;
