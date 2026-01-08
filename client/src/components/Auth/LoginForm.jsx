import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormOptions from './FormOptions';
import FormFooter from './FormFooter';
import api from '../../config/server';
import Toast from '../Alert/Toast';
import { Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const LoginForm = ({ onFlip }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/doLogin', {
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        login(data.data, data.token);

        const role = data.data.role;
        if (role === "admin") navigate("/admin");
        else if (role === "instructor") navigate("/instructor");
        else navigate("/");
      } else {
        alert(data.message || 'Login failed');
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
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

            <FormOptions />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
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
