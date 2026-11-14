import React from 'react';
import { Link } from 'react-router-dom';

// No self-service reset endpoint exists yet, so route people to support instead of a dead "#" link.
const FormOptions = () => {
  return (
    <div className="form-options">
      <Link to="/about#contact" className="forgot-password">
        Forgot password? Contact support
      </Link>
    </div>
  );
};

export default FormOptions;
