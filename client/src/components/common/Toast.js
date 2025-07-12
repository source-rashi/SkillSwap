import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info', 
  message, 
  duration = 5000, 
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide toast after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'fixed z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 transform';
    
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const animationStyles = isVisible && !isExiting
      ? 'translate-y-0 opacity-100 scale-100'
      : 'translate-y-2 opacity-0 scale-95';

    return `${baseStyles} ${positionStyles[position]} ${animationStyles}`;
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-400',
          borderColor: 'border-l-green-400',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-400',
          borderColor: 'border-l-red-400',
          bgColor: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
          borderColor: 'border-l-yellow-400',
          bgColor: 'bg-yellow-50'
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-400',
          borderColor: 'border-l-blue-400',
          bgColor: 'bg-blue-50'
        };
    }
  };

  const { icon: Icon, iconColor, borderColor, bgColor } = getIconAndColors();

  if (!isVisible && !isExiting) return null;

  return (
    <div className={getToastStyles()}>
      <div className={`border-l-4 ${borderColor} ${bgColor} p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className={`h-full transition-all ease-linear ${
            type === 'success' ? 'bg-green-400' :
            type === 'error' ? 'bg-red-400' :
            type === 'warning' ? 'bg-yellow-400' :
            'bg-blue-400'
          }`}
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, position = 'top-right', onRemove }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          position={position}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

export default Toast;
