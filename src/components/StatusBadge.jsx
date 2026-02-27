import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  // --- VEHICLE ACTIVITY (Supabase 'activity' column) ---
  Active: 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  Inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Under Maintenance': 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
  
  // Priorities
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  
  // Job Types
  Urgent: 'bg-red-50 text-red-600 border-red-100',
  Routine: 'bg-blue-50 text-blue-600 border-blue-100',
  
  // Job Statuses
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
  Completed: 'bg-green-50 text-green-700 border-green-100',
  
  // Health Threshholds
  Normal: 'bg-green-100 text-green-800 border-green-200',
  Warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
};

const StatusBadge = ({ type, children }) => {
  // Normalize type for casing (e.g., 'active' -> 'Active')
  const formattedType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : '';
  
  // Special case for 'Under Maintenance' to handle space normalization
  const variantKey = type?.toLowerCase() === 'under maintenance' ? 'Under Maintenance' : formattedType;

  return (
    <span className={clsx(
      'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-300',
      VARIANTS[variantKey] || 'bg-gray-100 text-gray-800 border-gray-200'
    )}>
      {children || type}
    </span>
  );
};

export default StatusBadge;