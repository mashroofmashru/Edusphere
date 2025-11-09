// components/Auth/FormOptions.jsx
import React from 'react';

const FormOptions = ({ rememberMe, onRememberMeChange }) => {
  return (
    <div className="form-options">
      <div className="remember-me">
        <div 
          className={`checkbox ${rememberMe ? 'checked' : ''}`}
          onClick={() => onRememberMeChange(!rememberMe)}
        ></div>
        <span>Remember me</span>
      </div>
      <a href="#" className="forgot-password">
        Forgot Password?
      </a>
    </div>
  );
};

export default FormOptions;