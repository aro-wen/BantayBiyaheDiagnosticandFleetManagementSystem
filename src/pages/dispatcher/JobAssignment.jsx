import React, { useState } from 'react';
import { Plus, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import StatusBadge from '../../components/StatusBadge';
import CreateJobModal from '../../components/CreateJobModal'; // <--- Import New Component

const JobAssignment = () => {
  const { jobs, addNewJob } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false); // Renamed for clarity
  
  // --- CALCULATE METRICS DYNAMICALLY ---
  const activeJobsCount = jobs.filter(j => j.status === 'In Progress' || j.status === 'Pending').length;
  const completedTodayCount = jobs.filter(j => j.status === 'Completed').length;
  const upcomingCount = jobs.filter(j => j.status === 'Pending').length;

  // Handle the data coming back from the modal
  const handleCreateJob = (jobData) => {
    addNewJob(jobData);
    setIsModalOpen(false);
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
          iconColor="text-slate-400"
        />
        <JobMetricCard 
          title="Completed Today" 
          value={completedTodayCount} 
          subtitle="Jobs finished" 
          icon={<CheckCircle size={20} />} 
          iconColor="text-green-500"
        />
        <JobMetricCard 
          title="Upcoming Scheduled" 
          value={upcomingCount} 
          subtitle="Next 7 days" 
          icon={<AlertTriangle size={20} />} 
          iconColor="text-orange-500"
        />
      </div>

      {/* 3. TABLE SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 pt-4">
        <h2 className="text-lg font-semibold text-slate-800">Maintenance Jobs</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Create Job
        </button>
      </div>

      {/* 4. FILTERS (Visual Placeholder) */}
      <div className="flex gap-4">
        <select className="px-4 py-2 bg-slate-50 border-none rounded-lg text-sm text-slate-600 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          <option>All Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select className="px-4 py-2 bg-slate-50 border-none rounded-lg text-sm text-slate-600 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          <option>All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* 5. JOB TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Job ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Technician</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">{job.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{job.vehicle}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">JD</div>
                     Juan Dela Cruz
                   </div>
                </td>
                <td className="px-6 py-4"><StatusBadge type={job.priority} /></td>
                <td className="px-6 py-4"><StatusBadge type={job.status} /></td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={job.desc}>
                  {job.desc || 'Routine checkup and maintenance'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 text-right font-mono">{job.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">No maintenance jobs found.</div>
        )}
      </div>

      {/* --- RENDER THE NEW MODAL --- */}
      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCreateJob} 
      />

    </div>
  );
};

// --- HELPER COMPONENT FOR THE CARDS ---
const JobMetricCard = ({ title, value, subtitle, icon, iconColor }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      <div className={`${iconColor}`}>{icon}</div>
    </div>
    <div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </div>
  </div>
);

export default JobAssignment;