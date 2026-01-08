import React, { useState } from 'react';
import FormHeader from './FormHeader';
import InputField from './InputField';
import FormFooter from './FormFooter';
import api from '../../config/server';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ onFlip }) => {
  const { login } = useAuth();
  const navigate = useNavigate()
  const [isInstructor, setIsInstructor] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/dosignup', {
        name: name,
        email: email,
        password: password,
        role: isInstructor ? 'instructor' : 'user'
      });

      if (res.data.success) {
        login(res.data.data, res.data.token);
        if (res.data.data.role === "admin")
          navigate("/admin");
        else if (res.data.data.role === "dealer")
          navigate("/dealer");
        else navigate("/");
      }
      console.log('Server Response:', res.data);
      alert('Account created successfully!');
      login()
    } catch (err) {
      const errMsg = err.response?.data?.message || "An error occurred during signup";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
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
            {/* Error Message Alert */}
            {error && (
              <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.85rem' }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                {error}
              </div>
            )}

            <InputField
              type="text"
              id="fullName"
              label="Full Name"
              icon="user"
              placeholder="Enter your full name"
              value={name}
              onChange={setName} // Receives string directly
              required
            />

            <InputField
              type="email"
              id="signupEmail"
              label="Email Address"
              icon="envelope"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              required
            />

            <InputField
              type="password"
              id="signupPassword"
              label="Password"
              icon="lock"
              placeholder="Create a password"
              value={password}
              onChange={setPassword}
              required
            />

            <InputField
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              icon="lock"
              placeholder="Confirm your password"
              value={confPassword}
              onChange={setConfPassword}
              required
            />

            {/* Instructor Toggle */}
            <div className="flex items-center gap-2 pb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px' }}>
              <input
                type="checkbox"
                id="instructor"
                checked={isInstructor}
                onChange={() => setIsInstructor(!isInstructor)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="instructor" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                Sign up as Instructor
              </label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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