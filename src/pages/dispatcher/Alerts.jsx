// src/pages/technician/Alerts.jsx

import React, { useState } from 'react';
import { useJobs } from '../../contexts/JobContext'; 
import { 
  AlertTriangle, CheckCircle, Trash2, Wrench, 
  ChevronDown, ChevronUp, Activity, Gauge, Calendar, Bell,
  CheckCheck, Siren, Bus, Droplet, AlertOctagon 
} from 'lucide-react';
import CreateJobModal from '../../components/CreateJobModal';
import { useAlertManagement } from '../../hooks/useAlertManagement';

const Alerts = () => {
  const { markAlertRead, markAllAlertsRead, deleteAlert, alerts } = useJobs();
  const [filter, setFilter] = useState('Unread');
  const [selectedJobData, setSelectedJobData] = useState(null); 
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [expandedVehicles, setExpandedVehicles] = useState({});

  const { sortedGroupedAlerts, CATEGORY_ORDER } = useAlertManagement(filter);

  const toggleVehicle = (id) => setExpandedVehicles(p => ({ ...p, [id]: p[id] === false }));

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Alerts & Notifications</h1>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Fleet Intelligence Center</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
             {alerts.some(a => a.status === 'Unread') && (
               <button onClick={markAllAlertsRead} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                 <CheckCheck size={16} /> Mark All Read
               </button>
             )}
             <button onClick={() => window.confirm("Clear all alerts?") && markAllAlertsRead()} className="px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-bold uppercase hover:text-red-600 transition-all">
               <Trash2 size={16} />
             </button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full">
            {['Unread', 'All', 'Critical'].map(tab => (
              <button key={tab} onClick={() => setFilter(tab)} className={`flex-1 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${filter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ALERT LIST */}
      <div className="space-y-4">
        {sortedGroupedAlerts.length === 0 ? (
          <EmptyState />
        ) : (
          sortedGroupedAlerts.map(([vehicleId, data]) => (
            <VehicleAlertGroup 
              key={vehicleId}
              vehicleId={vehicleId}
              data={data}
              isExpanded={expandedVehicles[vehicleId] !== false}
              onToggle={() => toggleVehicle(vehicleId)}
              onJob={(alert) => {
                setSelectedJobData({ alertId: alert.id, id: alert.vehicle, message: alert.message });
                setIsJobModalOpen(true);
              }}
              onDelete={deleteAlert}
              categoryOrder={CATEGORY_ORDER}
            />
          ))
        )}
      </div>

      <CreateJobModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        vehicle={selectedJobData}
        onSuccess={() => selectedJobData?.alertId && markAlertRead(selectedJobData.alertId)} 
      />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const VehicleAlertGroup = ({ vehicleId, data, isExpanded, onToggle, onJob, onDelete, categoryOrder }) => {
  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${data.hasSOS ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200 shadow-sm'}`}>
      <div onClick={onToggle} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'border-b border-slate-100' : ''}`}>
        <div className="flex items-center gap-4 text-left">
          <div className={`p-3 rounded-xl ${data.hasSOS ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
            {data.hasSOS ? <Siren size={24} /> : <Bus size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight leading-none mb-1">{vehicleId}</h3>
            <div className="flex gap-2">
              {data.hasSOS && <span className="text-[9px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase tracking-wider">Emergency</span>}
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{data.alerts.length} Active Alerts</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={(e) => { e.stopPropagation(); onJob(data.alerts[0]); }} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-blue-600 transition-all">
             <Wrench size={14} /> Create Job
           </button>
           {isExpanded ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 bg-slate-50/50">
          {categoryOrder.map(cat => {
            const items = data.categorized[cat];
            if (!items) return null;
            return (
              <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={cat} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {items.map(alert => (
                    <div key={alert.id} className="p-4 pl-6 flex items-center gap-4 hover:bg-blue-50/10 transition-all group text-left">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${alert.type === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${alert.status === 'Read' ? 'text-slate-300' : 'text-slate-700 font-bold uppercase tracking-tight'}`}>{alert.message}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-1.5 flex items-center gap-2">
                           <Activity size={10} /> Received {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={() => onDelete(alert.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CategoryIcon = ({ category }) => {
  switch(category) {
    case 'Emergency': case 'SOS': return <AlertOctagon size={14} className="text-red-600" />;
    case 'Diagnostic': return <Activity size={14} className="text-blue-500" />;
    case 'Behavior': return <Gauge size={14} className="text-purple-500" />;
    case 'Maintenance': return <Calendar size={14} className="text-orange-500" />;
    case 'Fuel': return <Droplet size={14} className="text-cyan-500" />; // Custom icon for Fuel
    default: return <Bell size={14} className="text-slate-300" />;
  }
};

const EmptyState = () => (
  <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
      <CheckCircle size={40} className="text-green-500 opacity-40" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight italic">Status: Nominal</h3>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">No fleet anomalies detected.</p>
  </div>
);

export default Alerts;