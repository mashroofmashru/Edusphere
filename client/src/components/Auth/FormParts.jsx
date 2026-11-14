import React from 'react';

export const FormAlert = ({ children }) => (
  <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
    <i className="fas fa-exclamation-circle mt-0.5" aria-hidden="true"></i>
    <span>{children}</span>
  </div>
);

export const SubmitButton = ({ loading, loadingText, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {loading ? (
      <>
        <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

export const SwitchLine = ({ text, buttonText, onClick }) => (
  <p className="mt-8 text-sm text-gray-600">
    {text}{' '}
    <button type="button" onClick={onClick} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
      {buttonText}
    </button>
  </p>
);
