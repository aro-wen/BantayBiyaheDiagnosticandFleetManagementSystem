import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const MaintenanceWidget = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentMaintenance = async () => {
      // Get the top 3 items due soonest
      const { data } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: true }) // Urgent first
        .limit(3);
      
      if (data) setTasks(data);
      setLoading(false);
    };

    fetchUrgentMaintenance();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          Upcoming Maintenance
        </h3>
        <Link to="/dispatcher/schedule" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {/* LIST */}
      <div className="flex-1 space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400">Loading schedules...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            No upcoming maintenance.
          </div>
        ) : (
          tasks.map(task => {
            const daysLeft = Math.ceil((new Date(task.next_due_date) - new Date()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;

            return (
              <div key={task.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{task.vehicle_id}</div>
                  <div className="text-xs text-slate-500">{task.service_type}</div>
                </div>
                
                <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                  isOverdue ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                  {isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : `Due in ${daysLeft}d`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MaintenanceWidget;