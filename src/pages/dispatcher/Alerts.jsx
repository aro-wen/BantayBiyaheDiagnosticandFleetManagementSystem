import React, { useState } from 'react';
import { useJobs } from '../../contexts/JobContext'; 
import { AlertTriangle, Info, CheckCircle, Bell, Filter, Trash2, Wrench } from 'lucide-react';
import CreateJobModal from '../../components/CreateJobModal';

const Alerts = () => {
  const { alerts, markAlertRead, deleteAlert } = useJobs();
  
  // 1. CHANGE DEFAULT TO 'Unread'
  const [filter, setFilter] = useState('Unread');
  
  // Track data for the modal
  const [selectedJobData, setSelectedJobData] = useState(null); 
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // --- FILTER LOGIC ---
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    // 2. THIS LOGIC ENSURES 'READ' ALERTS DISAPPEAR FROM THIS VIEW
    if (filter === 'Unread') return alert.status === 'Unread';
    if (filter === 'Critical') return alert.type === 'Critical'; 
    return true;
  });

  const handleCreateJobClick = (alert) => {
    setSelectedJobData({ 
      alertId: alert.id,           
      id: alert.vehicle,           
      message: alert.message,      
      code: alert.code             
    });
    setIsJobModalOpen(true);
  };

  const handleJobCreatedSuccess = () => {
    // 3. MARK AS READ -> CAUSES IT TO VANISH FROM 'UNREAD' LIST
    if (selectedJobData?.alertId) {
      markAlertRead(selectedJobData.alertId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alerts & Notifications</h1>
          <p className="text-slate-500">System anomalies and maintenance requests</p>
        </div>
      </div>

      {/* Tabs - REORDERED 'Unread' TO FIRST */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {['Unread', 'All', 'Critical'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              filter === tab 
                ? 'bg-slate-100 text-slate-800 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle size={32} className="text-green-500 opacity-50" />
            </div>
            <p className="font-medium text-slate-600">All caught up!</p>
            <p className="text-sm">No {filter.toLowerCase()} alerts found.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isRead = alert.status === 'Read';

            return (
              <div key={alert.id} className={`p-4 flex items-start gap-4 transition-colors ${isRead ? 'opacity-60 bg-slate-50' : 'hover:bg-blue-50/30'}`}>
                
                {/* Icon */}
                <div className={`mt-1 p-2 rounded-lg ${
                  alert.type === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {alert.type === 'Critical' ? <AlertTriangle size={18} /> : <Info size={18} />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm ${isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                      {alert.message}
                      {!isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {alert.vehicle}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  
                  {!isRead ? (
                    <button 
                      onClick={() => handleCreateJobClick(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                    >
                      <Wrench size={14} /> Create Job
                    </button>
                  ) : (
                    // This creates the "Checked" visual if you switch back to "All" tab
                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 text-xs font-bold opacity-70 cursor-default">
                      <CheckCircle size={14} /> Job Created
                    </span>
                  )}

                  <button 
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateJobModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        vehicle={selectedJobData}
        onSuccess={handleJobCreatedSuccess} 
      />
    </div>
  );
};

export default Alerts;