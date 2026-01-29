import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Filter, Info, Clock } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';

const Alerts = () => {
  // 1. Pull data and global actions from context
  const { alerts, markAlertRead, deleteAlert, markAllAlertsRead } = useJobs(); 
  const [filter, setFilter] = useState('All');

  // Metrics
  const unreadCount = alerts.filter(a => a.status === 'Unread').length;
  const criticalCount = alerts.filter(a => a.type === 'Critical' && a.status === 'Unread').length;

  // Filter Logic
  const filteredAlerts = alerts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return a.status === 'Unread';
    return a.type === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Alerts</h1>
          <p className="text-slate-500">Real-time notifications and fleet anomalies</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAlertsRead} // Use context function
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{criticalCount}</div>
            <div className="text-xs text-slate-500 font-medium uppercase">Critical Issues</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Bell size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{unreadCount}</div>
            <div className="text-xs text-slate-500 font-medium uppercase">Total Unread</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">98%</div>
            <div className="text-xs text-slate-500 font-medium uppercase">System Health</div>
          </div>
        </div>
      </div>

      {/* 3. ALERTS LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 overflow-x-auto">
          <Filter size={16} className="text-slate-400" />
          {['All', 'Unread', 'Critical', 'Warning', 'Info'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === type 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No alerts found.</div>
          ) : (
            filteredAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-6 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors ${
                  alert.status === 'Unread' ? 'bg-blue-50/30' : ''
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {alert.type === 'Critical' && <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>}
                  {alert.type === 'Warning' && <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><AlertTriangle size={20} /></div>}
                  {alert.type === 'Info' && <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Info size={20} /></div>}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${alert.status === 'Unread' ? 'text-slate-900' : 'text-slate-600'}`}>
                      {alert.message}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center whitespace-nowrap ml-4">
                      <Clock size={12} className="mr-1" /> {alert.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Vehicle ID: <span className="text-slate-700">{alert.vehicle}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  {alert.status === 'Unread' && (
                    <button 
                      onClick={() => markAlertRead(alert.id)} // Use context function
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAlert(alert.id)} // Use context function
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;