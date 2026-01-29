import React, { useState } from 'react';
import { Search, Filter, Play, CheckCircle, FileText, Eye } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useJobs } from '../../contexts/JobContext';
import NoteModal from '../../components/NoteModal'; // <--- 1. Import Modal
import { useNavigate } from 'react-router-dom';

const AssignedJobs = () => {
  const { jobs, stats, startJob, completeJob } = useJobs();
  
  // --- 2. Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || job.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  // Helper to open modal
  const handleOpenNote = (job) => {
    setModalData({
      jobId: job.id,
      vehicle: job.vehicle,
      type: 'Repair' // Default context for jobs
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Assigned Jobs" value={stats.total} subtext={`${stats.inProgress} in progress`} icon={<div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText size={24} /></div>} />
        <MetricCard title="Urgent Actions" value={stats.critical} subtext="Immediate attention needed" icon={<div className="p-2 bg-red-100 rounded-lg text-red-600"><Filter size={24} /></div>} />
        <MetricCard title="Pending Tasks" value={stats.pending} subtext="Ready to start" icon={<div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Search size={24} /></div>} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full sm:w-auto">
          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="text-sm text-slate-500">Showing <strong>{filteredJobs.length}</strong> jobs</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Job Type</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Scheduled</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{job.id}</td>
                <td className="px-6 py-4"><div className="font-medium text-slate-800">{job.vehicle}</div><div className="text-xs text-slate-500">{job.plate}</div></td>
                <td className="px-6 py-4"><StatusBadge type={job.type} /></td>
                <td className="px-6 py-4"><StatusBadge type={job.priority} /></td>
                <td className="px-6 py-4"><StatusBadge type={job.status} /></td>
                <td className="px-6 py-4 text-sm text-slate-600">{job.date}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {job.status === 'Pending' && (
                    <button onClick={() => startJob(job.id)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                      <Play size={14} className="mr-1.5" /> Start
                    </button>
                  )}
                  {job.status === 'In Progress' && (
                    <button onClick={() => completeJob(job.id)} className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                      <CheckCircle size={14} className="mr-1.5" /> Complete
                    </button>
                  )}
                  
                  {/* --- 3. Updated Notes Button --- */}
                  <button 
                    onClick={() => handleOpenNote(job)}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    <FileText size={14} className="mr-1.5" /> Notes
                  </button>
                  {/* The Details Button */}
                  <button 
                    onClick={() => navigate(`/technician/jobs/${job.id}`)} // <--- Add Navigation Logic
                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Eye size={14} className="mr-1.5" /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredJobs.length === 0 && <div className="p-8 text-center text-slate-500">No jobs found.</div>}
      </div>

      {/* --- 4. Render Modal --- */}
      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultValues={modalData}
      />
    </div>
  );
};

const MetricCard = ({ title, value, subtext, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
    {icon}
  </div>
);

export default AssignedJobs;