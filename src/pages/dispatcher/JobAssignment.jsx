import React, { useState } from 'react';
import { Plus, Wrench, CheckCircle, Search, Clock, PlayCircle, Filter } from 'lucide-react';
import { useJobManagement } from '../../hooks/useJobManagement';
import CreateJobModal from '../../components/CreateJobModal';

const JobAssignment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  const { metrics, filteredJobs } = useJobManagement(searchTerm, statusFilter, priorityFilter);

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance Jobs</h1>
        <p className="text-sm font-medium text-slate-500">Fleet service records and technician assignments</p>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Active Jobs" value={metrics.activeCount} subtitle="Currently open" icon={<Wrench size={20} />} color="blue" />
        <MetricCard title="Completed Today" value={metrics.completedToday} subtitle="Finished tasks" icon={<CheckCircle size={20} />} color="green" />
        <MetricCard title="Pending Queue" value={metrics.pendingCount} subtitle="Awaiting action" icon={<Clock size={20} />} color="orange" />
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input 
            type="text" 
            placeholder="Search ID, vehicle, or technician..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={['All Status', 'Pending', 'In Progress', 'Completed']} />
          <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={['All Priority', 'High', 'Medium', 'Low']} />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-sm"
          >
            <Plus size={16} /> Create Job
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {['Job ID', 'Vehicle', 'Technician', 'Priority', 'Status', 'Description', 'Created'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700 text-sm">{job.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{job.vehicle}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                        {job.technician?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-slate-600">{job.technician || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><PriorityBadge priority={job.priority} /></td>
                  <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate font-medium">{job.description || 'Routine Checkup'}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono text-right">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vehicle={null} />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'text-red-600 bg-red-50 border-red-100',
    Medium: 'text-orange-600 bg-orange-50 border-orange-100',
    Low: 'text-slate-600 bg-slate-50 border-slate-100'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: 'bg-green-50 text-green-600 border-green-100',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
    Pending: 'bg-yellow-50 text-yellow-600 border-yellow-100'
  };
  const icons = {
    Completed: <CheckCircle size={12} />,
    'In Progress': <PlayCircle size={12} />,
    Pending: <Clock size={12} />
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
      {icons[status]} {status}
    </span>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-slate-200 px-4 py-2.5 pr-10 rounded-xl text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 cursor-pointer transition-all"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
  </div>
);

export default JobAssignment;