import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock, Search, Filter, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const MaintenanceSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- FETCH DATA ---
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    // Fetch schedules and order by "Next Due Date" so urgent stuff is on top
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .order('next_due_date', { ascending: true });
    
    if (error) console.error('Error fetching schedules:', error);
    else setSchedules(data || []);
    setLoading(false);
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this maintenance rule?")) return;
    
    const { error } = await supabase.from('maintenance_schedules').delete().eq('id', id);
    if (!error) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- HELPER: CALCULATE STATUS ---
  const getStatus = (dueDateString) => {
    if (!dueDateString) return { label: 'Unknown', color: 'bg-slate-100 text-slate-500', icon: <Clock size={14} /> };
    
    const today = new Date();
    const due = new Date(dueDateString);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-600', icon: <AlertTriangle size={14} /> };
    if (diffDays <= 7) return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-600', icon: <Clock size={14} /> };
    return { label: 'Healthy', color: 'bg-green-100 text-green-600', icon: <CheckCircle size={14} /> };
  };

  // --- FILTERING ---
  const filteredSchedules = schedules.filter(s => 
    s.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Schedule</h1>
          <p className="text-slate-500">Track upcoming service dates for the entire fleet</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search Vehicle ID or Service Type..." 
          className="flex-1 outline-none text-sm text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Service Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cycle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Last Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Next Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading schedules...</td></tr>
              ) : filteredSchedules.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No schedules found.</td></tr>
              ) : (
                filteredSchedules.map((item) => {
                  const status = getStatus(item.next_due_date);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{item.vehicle_id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.service_type}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">Every {item.interval_days} Days</td>
                      
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.last_service_date ? new Date(item.last_service_date).toLocaleDateString() : <span className="text-red-400 italic">Unknown</span>}
                      </td>
                      
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {new Date(item.next_due_date).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;