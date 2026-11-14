import React, { useState } from 'react';

const InputField = ({
  type,
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  hint,
  error,
  minLength,
  aside,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          id={id}
          className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
          } ${isPassword ? 'pr-16' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-gray-500 hover:text-gray-900"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;
