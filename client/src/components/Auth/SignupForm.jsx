import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputField from './InputField';
import { FormAlert, SubmitButton, SwitchLine } from './FormParts';

const ROLES = [
  { value: 'user', title: 'Learn', desc: 'Enroll in courses' },
  { value: 'instructor', title: 'Teach', desc: 'Reviewed by an admin first' },
];
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
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-gray-600">Free to join. Takes under a minute.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <FormAlert>{error}</FormAlert>}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-900">I want to</legend>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((opt) => {
              const selected = role === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`relative cursor-pointer rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 has-[:focus-visible]:ring-offset-2 ${
                    selected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="signup-role"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setRole(opt.value)}
                    className="sr-only"
                  />
                  <span className={`block text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-900'}`}>{opt.title}</span>
                  <span className="block text-xs text-gray-500">{opt.desc}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <InputField
          type="text"
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={name}
          onChange={clear(setName)}
          required
        />

        <InputField
          type="email"
          id="signupEmail"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={clear(setEmail)}
          required
        />

        <InputField
          type="password"
          id="signupPassword"
          label="Password"
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
          label="Confirm password"
          autoComplete="new-password"
          error={confirmError}
          value={confPassword}
          onChange={clear(setConfPassword)}
          required
        />

        <SubmitButton loading={loading} loadingText="Creating account...">Create account</SubmitButton>
      </form>

      <SwitchLine text="Already have an account?" buttonText="Sign in" onClick={onFlip} />
    </>
  );
};

export default SignupForm;
