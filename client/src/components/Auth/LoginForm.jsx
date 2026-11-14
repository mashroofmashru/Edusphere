import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InputField from './InputField';
import { FormAlert, SubmitButton, SwitchLine } from './FormParts';
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
      <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
      <p className="mt-1.5 text-sm text-gray-600">Pick up where you left off.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <FormAlert>{error}</FormAlert>}

        <InputField
          type="email"
          id="loginEmail"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
          required
        />

        <InputField
          type="password"
          id="loginPassword"
          label="Password"
          autoComplete="current-password"
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          required
          aside={
            // No self-service reset endpoint yet, so point people to support.
            <Link to="/about#contact" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Forgot password?
            </Link>
          }
        />

        <SubmitButton loading={loading} loadingText="Signing in...">Sign in</SubmitButton>
      </form>

      <SwitchLine text="New to EduSphere?" buttonText="Create an account" onClick={onFlip} />
    </>
  );
};

export default LoginForm;
