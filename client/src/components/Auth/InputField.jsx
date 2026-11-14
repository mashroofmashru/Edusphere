import React, { useState } from 'react';

const InputField = ({
  type,
  id,
  label,
  icon,
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  hint,
  error,
  minLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className={`input-container ${isFocused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <i
          className={`fas fa-${icon} input-icon`}
          style={{ color: error ? '#dc2626' : isFocused ? '#2563eb' : '#64748b' }}
          aria-hidden="true"
        ></i>
        <input
          type={isPassword && showPassword ? 'text' : type}
          id={id}
          className={`form-input ${isPassword ? 'has-toggle' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
          </button>
        )}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-error-text">{error}</p>}
    </div>
  );
};

export default InputField;
