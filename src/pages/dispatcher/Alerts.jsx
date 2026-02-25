import React, { useState, useMemo } from 'react';
import { useJobs } from '../../contexts/JobContext'; 
import { 
  AlertTriangle, Info, CheckCircle, Trash2, Wrench, 
  ChevronDown, ChevronUp, Activity, Gauge, Calendar, Bell,
  CheckCheck, XCircle, Siren // Added Siren icon for SOS
} from 'lucide-react';
import CreateJobModal from '../../components/CreateJobModal';

const Alerts = () => {
  const { alerts, markAlertRead, markAllAlertsRead, deleteAlert } = useJobs();
  
  const [filter, setFilter] = useState('Unread');
  const [selectedJobData, setSelectedJobData] = useState(null); 
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [expandedVehicles, setExpandedVehicles] = useState({});

  // --- 1. FILTERING ---
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return alert.status === 'Unread';
    if (filter === 'Critical') return alert.type === 'Critical'; 
    return true;
  });

  // --- 2. GROUPING & SORTING (The "SOS First" Logic) ---
  const sortedGroupedAlerts = useMemo(() => {
    const groups = {};
    
    // Grouping
    filteredAlerts.forEach(alert => {
      const vId = alert.vehicle || 'Unknown';
      if (!groups[vId]) groups[vId] = [];
      groups[vId].push(alert);
    });

    // Sorting: Convert to array and sort vehicles by urgency
    return Object.entries(groups).sort(([, alertsA], [, alertsB]) => {
      // Priority 1: Has SOS/Emergency
      const isSOSA = alertsA.some(a => a.message.toLowerCase().includes('sos'));
      const isSOSB = alertsB.some(b => b.message.toLowerCase().includes('sos'));
      if (isSOSA && !isSOSB) return -1; // A goes first
      if (!isSOSA && isSOSB) return 1;  // B goes first

      // Priority 2: Has Critical Alert
      const isCritA = alertsA.some(a => a.type === 'Critical');
      const isCritB = alertsB.some(b => b.type === 'Critical');
      if (isCritA && !isCritB) return -1;
      if (!isCritA && isCritB) return 1;

      // Priority 3: Most Recent Alert
      const dateA = new Date(alertsA[0].created_at).getTime();
      const dateB = new Date(alertsB[0].created_at).getTime();
      return dateB - dateA;
    });
  }, [filteredAlerts]);

  // --- 3. CATEGORIZATION HELPER (Added Emergency) ---
  const getCategory = (message) => {
    const msg = message.toLowerCase();
    // 🔥 NEW: Explicit Emergency Category
    if (msg.includes('sos') || msg.includes('emergency') || msg.includes('accident')) return 'Emergency';
    
    if (msg.includes('speed') || msg.includes('braking') || msg.includes('idle')) return 'Behavior';
    if (msg.includes('temp') || msg.includes('engine') || msg.includes('battery') || msg.includes('fuel') || msg.includes('mil')) return 'Diagnostic';
    if (msg.includes('maintenance') || msg.includes('service') || msg.includes('oil')) return 'Maintenance';
    return 'System';
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Emergency': return <Siren size={14} className="text-red-600 animate-pulse" />; // Flashing Icon
      case 'Diagnostic': return <Activity size={14} className="text-blue-500" />;
      case 'Behavior': return <Gauge size={14} className="text-purple-500" />;
      case 'Maintenance': return <Calendar size={14} className="text-orange-500" />;
      default: return <Bell size={14} className="text-slate-400" />;
    }
  };

  // --- HANDLERS ---
  const toggleVehicleExpand = (vehicleId) => {
    setExpandedVehicles(prev => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
  };

  const handleCreateJobClick = (alert) => {
    setSelectedJobData({ 
      alertId: alert.id, id: alert.vehicle, message: alert.message, code: alert.code             
    });
    setIsJobModalOpen(true);
  };

  const handleJobCreatedSuccess = () => {
    if (selectedJobData?.alertId) markAlertRead(selectedJobData.alertId);
  };

  const handleClearAllHistory = async () => {
    if (window.confirm("⚠️ Delete all alerts history?")) {
      for (const alert of alerts) await deleteAlert(alert.id);
    }
  };

  // Define the strict order we want categories to appear in
  const CATEGORY_ORDER = ['Emergency', 'Diagnostic', 'Behavior', 'Maintenance', 'System'];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alerts & Notifications</h1>
          <p className="text-slate-500">System anomalies sorted by priority</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
             {alerts.some(a => a.status === 'Unread') && (
               <button onClick={markAllAlertsRead} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                 <CheckCheck size={16} /> Mark All Read
               </button>
             )}
             {alerts.length > 0 && (
               <button onClick={handleClearAllHistory} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-sm font-bold hover:text-red-600 hover:bg-red-50 transition-colors">
                 <XCircle size={16} /> Clear History
               </button>
             )}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Unread', 'All', 'Critical'].map(tab => (
              <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ALERT GROUPS */}
      <div className="space-y-4">
        {sortedGroupedAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle size={32} className="text-green-500 opacity-50" />
            </div>
            <p className="font-medium text-slate-600">All Systems Normal</p>
          </div>
        ) : (
          sortedGroupedAlerts.map(([vehicleId, vehicleAlerts]) => {
            const hasCritical = vehicleAlerts.some(a => a.type === 'Critical');
            const hasSOS = vehicleAlerts.some(a => a.message.toLowerCase().includes('sos'));
            const isExpanded = expandedVehicles[vehicleId] !== false; 

            // Group alerts into categories
            const categorizedAlerts = {};
            vehicleAlerts.forEach(a => {
              const cat = getCategory(a.message);
              if (!categorizedAlerts[cat]) categorizedAlerts[cat] = [];
              categorizedAlerts[cat].push(a);
            });

            return (
              <div key={vehicleId} className={`bg-white rounded-xl border transition-all shadow-sm ${hasSOS ? 'border-red-300 ring-2 ring-red-100' : hasCritical ? 'border-red-100' : 'border-slate-200'}`}>
                
                {/* VEHICLE HEADER */}
                <div 
                  onClick={() => toggleVehicleExpand(vehicleId)}
                  className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl ${isExpanded ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${hasSOS ? 'bg-red-600 text-white animate-pulse' : hasCritical ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {hasSOS ? <Siren size={20} /> : hasCritical ? <AlertTriangle size={20} /> : <Info size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{vehicleId}</h3>
                      <div className="flex gap-3 mt-1">
                        {/* Summary Badges */}
                        {categorizedAlerts.Emergency && <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1"><Siren size={10} /> SOS ALERT</span>}
                        {categorizedAlerts.Diagnostic && <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1"><Activity size={10} /> Diag</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateJobClick(vehicleAlerts[0]); 
                        }}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Wrench size={14} /> Create Job
                      </button>
                     {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>

                {/* CATEGORIZED ALERTS LIST */}
                {isExpanded && (
                  <div className="p-2 space-y-2 bg-slate-50/50">
                    {CATEGORY_ORDER.map(category => {
                      const items = categorizedAlerts[category];
                      if (!items || items.length === 0) return null;

                      // Highlight header for Emergency
                      const isEmerg = category === 'Emergency';

                      return (
                        <div key={category} className={`bg-white border rounded-lg overflow-hidden ${isEmerg ? 'border-red-200' : 'border-slate-100'}`}>
                          <div className={`px-4 py-2 border-b flex items-center gap-2 ${isEmerg ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            {getCategoryIcon(category)}
                            <span className="text-xs font-bold uppercase tracking-wider">{category}</span>
                          </div>
                          
                          <div className="divide-y divide-slate-50">
                            {items.map(alert => (
                              <div key={alert.id} className="p-3 pl-4 flex items-start gap-3 hover:bg-blue-50/30 transition-colors">
                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${alert.type === 'Critical' ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className={`text-sm ${alert.status === 'Read' ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                                      {alert.message}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono ml-4 whitespace-nowrap">
                                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => deleteAlert(alert.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                   <Trash2 size={14} />
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