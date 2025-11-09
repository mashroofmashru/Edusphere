// components/Auth/SignupForm.jsx
import React, { useState } from 'react';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormFooter from './FormFooter'; // Add this import

const SignupForm = ({ onFlip }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup data:', formData);
    alert('Signup functionality would be implemented here!');
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
        title="Create Account" 
        subtitle="Start your learning journey today" 
      />
      
      <div className="form-body">
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            <InputField
              type="text"
              id="fullName"
              label="Full Name"
              icon="user"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(value) => handleChange('fullName', value)}
              required
            />
            
            <InputField
              type="email"
              id="signupEmail"
              label="Email Address"
              icon="envelope"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              required
            />
            
            <InputField
              type="password"
              id="signupPassword"
              label="Password"
              icon="lock"
              placeholder="Create a password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              required
            />
            
            <InputField
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              icon="lock"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(value) => handleChange('confirmPassword', value)}
              required
            />
            
            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>
        </div>
        
        <FormFooter 
          text="Already have an account?"
          buttonText="Sign In"
          onButtonClick={onFlip}
        />
      </div>
    </>
  );
};

export default SignupForm;