// src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { 
  AlertOctagon, 
  Wrench, 
  X, 
  Siren, 
  ChevronRight, 
  MapPin 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ alert, onClose }) => {
  const navigate = useNavigate();
  
  // 1. Logic to determine if this is a high-priority SOS
  const isSOS = alert.category === 'Emergency' || alert.category === 'SOS';

  // 2. Auto-close timer (longer for SOS to ensure the dispatcher sees it)
  useEffect(() => {
    const timer = setTimeout(onClose, isSOS ? 15000 : 8000);
    return () => clearTimeout(timer);
  }, [onClose, isSOS]);

  const handleAction = () => {
    navigate('/dispatcher/alerts');
    onClose();
  };

  return (
    <div className={`
      fixed top-20 right-6 z-[999] w-[360px] 
      bg-white rounded-2xl shadow-2xl border-l-8 
      animate-in slide-in-from-right duration-500
      ${isSOS 
        ? 'border-red-600 ring-4 ring-red-100/50 shadow-red-200' 
        : 'border-blue-600 shadow-blue-100'}
    `}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* ICON BOX */}
          <div className={`p-3 rounded-xl shrink-0 transition-all ${
            isSOS 
              ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-200' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {isSOS ? <Siren size={24} /> : <Wrench size={24} />}
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                isSOS ? 'text-red-600' : 'text-blue-600'
              }`}>
                {isSOS ? '🚨 Emergency SOS Signal' : '🛠️ System Diagnostic Alert'}
              </span>
              <button 
                onClick={onClose} 
                className="text-slate-300 hover:text-slate-500 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">
              Unit {alert.vehicle_id || alert.vehicle}: {alert.code || 'Alert'}
            </h4>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">
              {alert.message}
            </p>

            {/* LIVE DATA PREVIEW (Optional for extra detail) */}
            <div className="mt-2 flex items-center gap-3">
               <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                 <MapPin size={10} /> Live Tracking
               </span>
               <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                 {new Date(alert.created_at || Date.now()).toLocaleTimeString()}
               </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE BUTTONS */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleAction}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${isSOS 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-300' 
                : 'bg-slate-900 text-white hover:bg-blue-600'
              }`}
          >
            {isSOS ? 'Dispatch Emergency Response' : 'View System History'}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* PROGRESS BAR (Visual countdown for auto-close) */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full rounded-b-2xl overflow-hidden">
        <div 
          className={`h-full transition-all linear duration-[8000ms] ${isSOS ? 'bg-red-600 duration-[15000ms]' : 'bg-blue-600'}`}
          style={{ width: '0%', animation: `progress-shrink ${isSOS ? '15s' : '8s'} linear forwards` }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
};

export default NotificationToast;