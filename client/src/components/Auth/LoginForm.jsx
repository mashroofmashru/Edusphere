// components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormOptions from './FormOptions'; 
import FormFooter from './FormFooter';

const LoginForm = ({ onFlip }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
    alert('Login functionality would be implemented here!');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <FormHeader 
        title="Welcome Back" 
        subtitle="Sign in to continue your learning journey" 
      />
      
      <div className="form-body">
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            <InputField
              type="email"
              id="loginEmail"
              label="Email Address"
              icon="envelope"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              required
            />
            
            <InputField
              type="password"
              id="loginPassword"
              label="Password"
              icon="lock"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              required
            />
            
            <FormOptions 
              rememberMe={formData.rememberMe}
              onRememberMeChange={(value) => handleChange('rememberMe', value)}
            />
            
            <button type="submit" className="submit-btn">
              Sign In
            </button>
          </form>
        </div>
        
        <FormFooter 
          text="Don't have an account?"
          buttonText="Sign Up"
          onButtonClick={onFlip}
        />
      </div>
    </>
  );
};

export default LoginForm;