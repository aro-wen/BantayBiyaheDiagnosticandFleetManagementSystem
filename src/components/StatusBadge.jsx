import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  // Priorities
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  
  // Job Types
  Urgent: 'bg-red-50 text-red-600 border-red-100',
  Routine: 'bg-blue-50 text-blue-600 border-blue-100',
  
  // Statuses
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
  Completed: 'bg-green-50 text-green-700 border-green-100',
  
  // Health
  Normal: 'bg-green-100 text-green-800',
  Warning: 'bg-yellow-100 text-yellow-800',
  Critical: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ type, children }) => {
  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-medium border',
      VARIANTS[type] || 'bg-gray-100 text-gray-800'
    )}>
      {children || type}
    </span>
  );
};

export default StatusBadge;