import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Disappear after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-white border-green-200 text-green-800',
    error: 'bg-white border-red-200 text-red-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${styles[type] || styles.success} min-w-[300px]`}>
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;