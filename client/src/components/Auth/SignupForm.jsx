import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormFooter from './FormFooter';
import api from '../../config/server';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { homeForRole } from '../../utils/format';

const MIN_PASSWORD = 6;

const SignupForm = ({ onFlip }) => {
  const { login } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordError = password && password.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters` : '';
  const confirmError = confPassword && confPassword !== password ? 'Passwords do not match' : '';

  const clear = (setter) => (value) => {
    setter(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/dosignup', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (data.success) {
        login(data.data, data.token);
        if (data.data.role === 'instructor') {
          toast('Account created! Complete your profile while an admin reviews your application.', 'info');
          navigate('/instructor/settings', { replace: true });
        } else {
          toast('Account created successfully. Welcome to EduSphere!');
          navigate(location.state?.from || homeForRole(data.data.role), { replace: true });
        }
      } else {
        setError(data.message || 'Could not create your account.');
      }
    } catch (err) {
      setError(err.response?.data?.message || (err.response ? 'An error occurred during signup.' : 'Cannot reach the server. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormHeader title="Create Account" subtitle="Start your learning journey today" />

      <div className="form-body">
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="form-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <fieldset className="role-picker">
              <legend className="form-label">I want to</legend>
              <div className="role-options">
                {[
                  { value: 'user', icon: 'fa-user-graduate', title: 'Learn', desc: 'Take courses' },
                  { value: 'instructor', icon: 'fa-chalkboard-teacher', title: 'Teach', desc: 'Needs admin approval' },
                ].map((opt) => (
                  <label key={opt.value} className={`role-option ${role === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="signup-role"
                      value={opt.value}
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                    />
                    <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                    <span className="role-title">{opt.title}</span>
                    <span className="role-desc">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <InputField
              type="text"
              id="fullName"
              label="Full Name"
              icon="user"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={clear(setName)}
              required
            />

            <InputField
              type="email"
              id="signupEmail"
              label="Email Address"
              icon="envelope"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={clear(setEmail)}
              required
            />

            <InputField
              type="password"
              id="signupPassword"
              label="Password"
              icon="lock"
              placeholder="Create a password"
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD} characters`}
              error={passwordError}
              minLength={MIN_PASSWORD}
              value={password}
              onChange={clear(setPassword)}
              required
            />

            <InputField
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              icon="lock"
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={confirmError}
              value={confPassword}
              onChange={clear(setConfPassword)}
              required
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Creating Account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <FormFooter text="Already have an account?" buttonText="Sign In" onButtonClick={onFlip} />
      </div>
    </>
  );
};

export default SignupForm;
