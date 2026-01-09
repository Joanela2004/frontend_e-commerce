import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, title = null, duration = 2000) => {
    const id = Date.now();
    const toast = {
      id,
      type,
      title: title || (type === 'success' ? 'Succès' : 
                      type === 'error' ? 'Erreur' : 
                      type === 'warning' ? 'Attention' : 'Information'),
      message,
      duration
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-dismiss
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ type, title, message, onClose }) => {
  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    warning: <FaExclamationCircle />,
    info: <FaInfoCircle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
      <div 
        className="toast-progress" 
        style={{ animationDuration: '5s' }}
      />
    </div>
  );
};