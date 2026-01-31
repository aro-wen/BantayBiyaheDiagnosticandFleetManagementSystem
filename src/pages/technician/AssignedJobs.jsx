import React, { useState } from 'react';
import { useJobs } from '../../contexts/JobContext';
import { 
  Wrench, Clock, AlertTriangle, MapPin, ChevronRight, CheckCircle, Play 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignedJobs = () => {
  const { jobs, startJob } = useJobs();
  const [filter, setFilter] = useState('All');

  // --- 1. CURRENT USER (Mock) ---
  // In a real app, this comes from your Auth Context
  const CURRENT_TECH_NAME = "Juan dela Cruz"; 

  // --- 2. FILTER LOGIC ---
  const myJobs = jobs.filter(job => {
    // A. Must be assigned to THIS technician
    // (We also include jobs with NO technician assigned, just in case, or you can exclude them)
    const isAssignedToMe = job.technician === CURRENT_TECH_NAME;
    
    // B. Must NOT be completed (Completed jobs go to History)
    const isNotCompleted = job.status !== 'Completed';

    return isAssignedToMe && isNotCompleted;
  });

  const displayedJobs = filter === 'All' 
    ? myJobs 
    : myJobs.filter(j => j.priority === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assigned Jobs</h1>
          <p className="text-slate-500">Tasks assigned to <span className="font-semibold text-blue-600">{CURRENT_TECH_NAME}</span></p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-3xl font-bold text-slate-800">{myJobs.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Pending</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f} Priority
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              
              {/* Left Stripe based on Priority */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                job.priority === 'High' ? 'bg-red-500' : 
                job.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'
              }`}></div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-3">
                
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{job.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                    {job.priority === 'High' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">
                        <AlertTriangle size={10} /> Urgent
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{job.desc}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Wrench size={14} /> {job.vehicle}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> {job.date}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  {job.status === 'Pending' ? (
                    <button 
                      onClick={() => startJob(job.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Play size={16} /> Start
                    </button>
                  ) : (
                    <span className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold">
                      <CheckCircle size={16} /> In Progress
                    </span>
                  )}
                  
                  <Link 
                    to={`/technician/jobs/${job.id}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-medium">All caught up!</h3>
            <p className="text-sm text-slate-400">No {filter !== 'All' ? filter.toLowerCase() + ' priority' : ''} jobs assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedJobs;