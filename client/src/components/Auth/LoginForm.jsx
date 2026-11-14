import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormOptions from './FormOptions';
import FormFooter from './FormFooter';
import api from '../../config/server';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { homeForRole } from '../../utils/format';

const LoginForm = ({ onFlip }) => {
  const { login } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/doLogin', {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (data.success) {
        login(data.data, data.token);
        toast(`Welcome back, ${data.data.name?.split(' ')[0] || 'learner'}!`);
        // Return to the page that sent the user here (e.g. a course they tried to enroll in)
        navigate(location.state?.from || homeForRole(data.data.role), { replace: true });
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || (err.response ? 'Login failed. Please try again.' : 'Cannot reach the server. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormHeader title="Welcome Back" subtitle="Sign in to continue your learning journey" />

      <div className="form-body">
        <div className="form-content">
          <form onSubmit={handleSubmit} noValidate={false}>
            {error && (
              <div className="form-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <InputField
              type="email"
              id="loginEmail"
              label="Email Address"
              icon="envelope"
              placeholder="Enter your email"
              autoComplete="email"
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
              autoComplete="current-password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              required
            />

            <FormOptions />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Signing In...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <FormFooter text="Don't have an account?" buttonText="Sign Up" onButtonClick={onFlip} />
      </div>
    </>
  );
};

export default LoginForm;
