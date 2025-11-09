// components/Auth/FormFooter.jsx
import React from 'react';

const FormFooter = ({ text, buttonText, onButtonClick }) => {
  return (
    <div className="form-footer">
      {text+" "}
      <button type="button" className="toggle-form" onClick={onButtonClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default FormFooter;