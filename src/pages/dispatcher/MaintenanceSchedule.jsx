import React, { useState, useMemo } from 'react';
import { 
  Search, Trash2, Calendar as CalendarIcon, List, ChevronLeft, 
  ChevronRight, AlertTriangle, CheckCircle, Clock, Plus, Wrench
} from 'lucide-react';
import { useMaintenanceData } from '../../hooks/useMaintenanceData';
import CreateJobModal from '../../components/CreateJobModal'; 

// --- CALENDAR VIEW ---
const CalendarView = ({ schedules, currentDate, onSelect }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-32 border-b border-r border-slate-50 bg-slate-50/20" />;
          const daySchedules = schedules.filter(s => {
            const dueDate = new Date(s.next_due_date);
            return dueDate.getDate() === day && dueDate.getMonth() === month && dueDate.getFullYear() === year;
          });

          return (
            <div key={day} className="h-32 border-b border-r border-slate-50 p-1 flex flex-col hover:bg-slate-50/50 transition-colors">
              <span className="text-[10px] font-bold text-slate-400 ml-1 mt-1">{day}</span>
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 px-1">
                {daySchedules.map(s => (
                  <button key={s.id} onClick={() => onSelect(s)} className="w-full text-left p-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-600 group transition-all">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black text-blue-800 group-hover:text-white truncate uppercase">{s.vehicle_id}</span>
                      <Wrench size={8} className="text-blue-400 group-hover:text-white" />
                    </div>
                    <p className="text-[8px] font-bold text-blue-600 group-hover:text-blue-100 truncate leading-tight">{s.service_type}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- ROW COMPONENT ---
const ScheduleRow = ({ item, vehicleData, onDelete, onSelect }) => {
  const status = useMemo(() => {
    const currentUsage = Math.max(0, (vehicleData?.total_mileage || 0) - (item?.last_service_odo || 0));
    const threshold = item?.interval_km || 5000;
    const percentUsed = Math.min((currentUsage / threshold) * 100, 100);

    if (percentUsed >= 100) return { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100', percent: 100, icon: <AlertTriangle size={14} />, actionable: true };
    if (percentUsed >= 85) return { label: 'Due Soon', color: 'bg-orange-50 text-orange-600 border-orange-100', percent: percentUsed, icon: <Clock size={14} />, actionable: true };
    return { label: 'Healthy', color: 'bg-green-50 text-green-600 border-green-100', percent: percentUsed, icon: <CheckCircle size={14} />, actionable: false };
  }, [vehicleData, item]);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_id}</td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
        <div>{item.service_type}</div>
        <div className="w-32 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-500 ${status.percent >= 100 ? 'bg-red-500' : status.percent >= 85 ? 'bg-orange-500' : 'bg-green-500'}`} 
            style={{ width: `${status.percent}%` }}
          />
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-slate-400">Every {item.interval_km} KM</td>
      <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">
        {vehicleData?.total_mileage ? `${vehicleData.total_mileage.toFixed(2)} KM Total` : '0.00 KM Total'}
      </td>
      <td className="px-6 py-4 text-center">
        <button disabled={!status.actionable} onClick={() => status.actionable && onSelect(item)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${status.color}`}>
          {status.icon} {status.label}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <button onClick={() => onDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
      </td>
    </tr>
  );
};

// --- MAIN COMPONENT ---
const MaintenanceSchedule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { filteredSchedules, vehicles, loading, deleteSchedule } = useMaintenanceData(searchTerm);

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50/30 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance Schedule</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">BantayBiyahe Fleet Service Management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 shadow-lg">
            <Plus size={16} /> Create Job
          </button>
          <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><CalendarIcon size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><List size={14} /></button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="p-20 text-center"><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Syncing Fleet Data...</p></div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {['Vehicle', 'Service Type', 'Cycle', 'Usage Tracking', 'Status', 'Action'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSchedules.map(item => (
                <ScheduleRow 
                  key={item.id} 
                  item={item} 
                  vehicleData={vehicles?.find(v => v.id === item.vehicle_id)} // Corrected ID lookup
                  onDelete={deleteSchedule} 
                  onSelect={(s) => { setSelectedVehicle(s); setIsModalOpen(true); }} 
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CalendarView schedules={filteredSchedules} currentDate={currentDate} onSelect={(s) => { setSelectedVehicle(s); setIsModalOpen(true); }} />
      )}

      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicle={selectedVehicle} />
    </div>
  );
};

export default MaintenanceSchedule;