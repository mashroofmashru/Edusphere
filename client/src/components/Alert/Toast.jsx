import React, { useEffect } from "react";

const STYLES = {
  success: { icon: "fa-check-circle", color: "text-green-500", border: "border-green-100" },
  error: { icon: "fa-exclamation-circle", color: "text-red-500", border: "border-red-100" },
  info: { icon: "fa-info-circle", color: "text-blue-500", border: "border-blue-100" },
  warning: { icon: "fa-exclamation-triangle", color: "text-amber-500", border: "border-amber-100" },
};

const Toast = ({ show, message, type = "success", onClose }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, message]);

  if (!show) return null;
  const style = STYLES[type] || STYLES.success;

  return (
    // Top-right so it never collides with the floating chat button
    <div
      role={type === "error" ? "alert" : "status"}
      className={`fixed top-20 right-4 left-4 sm:left-auto sm:max-w-sm z-[120] flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border bg-white text-gray-800 animate-slide-in-right ${style.border}`}
    >
      <i className={`fas ${style.icon} ${style.color} text-lg mt-0.5`} aria-hidden="true"></i>
      <span className="font-semibold text-sm flex-1 break-words">{message}</span>
      <button
        onClick={onClose}
        type="button"
        aria-label="Dismiss notification"
        className="p-1 -m-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
      >
        <i className="fas fa-times text-xs" aria-hidden="true"></i>
      </button>
    </div>
  );
};

export default Toast;
