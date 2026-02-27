import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Trash2, Calendar as CalendarIcon, List, ChevronLeft, 
  ChevronRight, AlertTriangle, CheckCircle, Clock, Plus 
} from 'lucide-react';
import { useMaintenanceData } from '../../hooks/useMaintenanceData';
import CreateJobModal from '../../components/CreateJobModal'; 

const MaintenanceSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); 
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Track which vehicle is being serviced

  const { filteredSchedules, loading, deleteSchedule, refreshData } = useMaintenanceData(searchTerm);

  const adjustMonth = (offset) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  };

  // --- TRIGGER MODAL FOR SPECIFIC VEHICLE ---
  const handleTriggerJob = (item) => {
    setSelectedVehicle({
      id: item.vehicle_id,
      message: item.service_type,
      code: `Next Due: ${item.next_due_date}`
    });
    setIsModalOpen(true);
  };

  const handleJobSuccess = () => {
    if (refreshData) refreshData();
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance Schedule</h1>
          <p className="text-sm font-medium text-slate-500">Fleet service tracking for BantayBiyahe</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Create Job
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarIcon size={14} /> Calendar
            </button>
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={14} /> List
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar remains the same */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 flex-1 w-full">
          <div className="pl-3"><Search className="text-slate-400" size={20} /></div>
          <input 
            type="text" 
            placeholder="Search by vehicle ID or service..." 
            className="flex-1 py-2 outline-none text-sm font-medium text-slate-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading fleet data...</div>
      ) : (
        viewMode === 'list' ? (
          <ListView schedules={filteredSchedules} onDelete={deleteSchedule} onSelect={handleTriggerJob} />
        ) : (
          <CalendarView schedules={filteredSchedules} currentDate={currentDate} />
        )
      )}

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedVehicle(null); }} 
        vehicle={selectedVehicle}
        onSuccess={handleJobSuccess}
      />
    </div>
  );
};

// --- UPDATED LIST VIEW COMPONENT ---
const ListView = ({ schedules, onDelete, onSelect }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            {['Vehicle', 'Service Type', 'Cycle', 'Last Service', 'Next Due', 'Status', 'Action'].map((h) => (
              <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {schedules.map((item) => <ScheduleRow key={item.id} item={item} onDelete={onDelete} onSelect={onSelect} />)}
        </tbody>
      </table>
    </div>
  </div>
);

// --- UPDATED ROW COMPONENT WITH CLICKABLE STATUS ---
const ScheduleRow = ({ item, onDelete, onSelect }) => {
  const status = React.useMemo(() => {
    const diffDays = Math.ceil((new Date(item.next_due_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100 cursor-pointer hover:bg-red-100', icon: <AlertTriangle size={14} />, actionable: true };
    if (diffDays <= 7) return { label: 'Due Soon', color: 'bg-orange-50 text-orange-600 border-orange-100 cursor-pointer hover:bg-orange-100', icon: <Clock size={14} />, actionable: true };
    return { label: 'Healthy', color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle size={14} />, actionable: false };
  }, [item.next_due_date]);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_id}</td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.service_type}</td>
      <td className="px-6 py-4 text-xs font-bold text-slate-400">Every {item.interval_days} days</td>
      <td className="px-6 py-4 text-sm text-slate-500 font-mono font-medium">{item.last_service_date ? new Date(item.last_service_date).toLocaleDateString() : 'None'}</td>
      <td className="px-6 py-4 text-sm font-bold text-slate-700 font-mono">{new Date(item.next_due_date).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        {/* If maintenance is due, this badge is now a button */}
        <button 
          disabled={!status.actionable}
          onClick={() => status.actionable && onSelect(item)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${status.color}`}
        >
          {status.icon} {status.label}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
      </td>
    </tr>
  );
};