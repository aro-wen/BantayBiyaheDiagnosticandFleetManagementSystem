import React, { useState } from 'react';
import { Plus, Wrench, CheckCircle, AlertTriangle, Search, Clock, PlayCircle } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import CreateJobModal from '../../components/CreateJobModal';

const JobAssignment = () => {
  const { jobs } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- STATE FOR FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  // --- 1. CALCULATE METRICS DYNAMICALLY ---
  const activeJobsCount = jobs.filter(j => j.status === 'In Progress' || j.status === 'Pending').length;
  const completedTodayCount = jobs.filter(j => j.status === 'Completed').length; // Ideally filter by date too
  const upcomingCount = jobs.filter(j => j.status === 'Pending').length;

  // --- 2. FILTER & SORT LOGIC ---
  const filteredJobs = jobs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort Newest First
    .filter(job => {
      // Search Logic
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.id.toLowerCase().includes(searchLower) ||
        job.vehicle.toLowerCase().includes(searchLower) ||
        (job.technician || '').toLowerCase().includes(searchLower);

      // Dropdown Filters
      const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'All Priority' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

  // --- HELPER: BADGE STYLES ---
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Maintenance Jobs</h1>
        <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <JobMetricCard 
          title="Active Jobs" 
          value={activeJobsCount} 
          subtitle="Currently open" 
          icon={<Wrench size={20} />} 
          iconColor="text-blue-500 bg-blue-50"
        />
        <JobMetricCard 
          title="Completed Today" 
          value={completedTodayCount} 
          subtitle="Jobs finished" 
          icon={<CheckCircle size={20} />} 
          iconColor="text-green-500 bg-green-50"
        />
        <JobMetricCard 
          title="Pending Queue" 
          value={upcomingCount} 
          subtitle="Awaiting action" 
          icon={<Clock size={20} />} 
          iconColor="text-orange-500 bg-orange-50"
        />
      </div>

      {/* 3. CONTROLS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search ID, Vehicle, or Tech..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & Action */}
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
          >
            <option value="All Status">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
          >
            <option value="All Priority">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm ml-2"
          >
            <Plus size={16} className="mr-2" /> Create Job
          </button>
        </div>
      </div>

      {/* 5. JOB TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                    
                    {/* ID */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-700 text-sm">{job.id}</td>
                    
                    {/* Vehicle */}
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{job.vehicle}</td>
                    
                    {/* Technician */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {job.technician ? job.technician.charAt(0) : 'U'}
                        </div>
                        <span className="text-sm text-slate-600">{job.technician || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getPriorityStyle(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getStatusStyle(job.status)}`}>
                        {job.status === 'Completed' && <CheckCircle size={12} />}
                        {job.status === 'In Progress' && <PlayCircle size={12} />}
                        {job.status === 'Pending' && <Clock size={12} />}
                        {job.status}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={job.description}>
                      {job.description || job.desc || 'Routine checkup'}
                    </td>

                    {/* Created At (FIXED) */}
                    <td className="px-6 py-4 text-sm text-slate-500 text-right font-mono">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                      
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400 text-sm border-dashed">
                    No maintenance jobs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE JOB MODAL */}
      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        // Note: vehicle is optional here, Modal handles empty vehicle selection if implemented
        vehicle={null} 
      />

    </div>
  );
};

// --- HELPER COMPONENT ---
const JobMetricCard = ({ title, value, subtitle, icon, iconColor }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm font-bold uppercase tracking-wide">{title}</span>
      <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
    </div>
    <div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</div>
    </div>
  </div>
);

export default JobAssignment;