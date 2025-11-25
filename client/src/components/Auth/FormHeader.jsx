// components/Auth/FormHeader.jsx
import React from 'react';

const FormHeader = ({ title, subtitle }) => {
  return (
    <div className="form-header">
      <div className="logo">
        <i className="fas fa-graduation-cap logo-icon"></i>
        <span className="logo-text">Eduphere</span>
      </div>
      <h2 className="form-title">{title}</h2>
      <p className="form-subtitle">{subtitle}</p>
    </div>
  );
};

export default FormHeader;