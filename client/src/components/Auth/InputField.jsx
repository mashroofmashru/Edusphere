import React, { useState } from 'react';

const InputField = ({ 
  type, 
  id, 
  label, 
  icon, 
  placeholder, 
  value, 
  onChange, 
  required 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className={`input-container ${isFocused ? 'focused' : ''}`}>
        <i 
          className={`fas fa-${icon} input-icon`}
          style={{ color: isFocused ? '#2563eb' : '#64748b' }}
        ></i>
        <input
          type={type}
          id={id}
          className="form-input"
          placeholder={placeholder}
          value={value}
          // Extracts the value here so the parent doesn't have to deal with 'e.target'
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;