import React, { useState, useMemo } from 'react';
import { useJobs } from '../../contexts/JobContext';
import { 
  Wrench, Clock, AlertTriangle, CheckCircle, 
  Play, PlayCircle, MessageSquare, X, CalendarCheck, Coffee, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignedJobs = () => {
  const { jobs, startJob, addNote } = useJobs(); 
  const [filter, setFilter] = useState('All');
  
  // Note Modal State
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Optimistic UI State
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [optimisticStatus, setOptimisticStatus] = useState({}); // { 'job-123': 'In Progress' }

  const CURRENT_TECH_NAME = "Juan dela Cruz"; 

  // --- 1. MERGE REAL DATA WITH OPTIMISTIC DATA ---
  // This ensures the UI updates instantly before the database confirms
  const effectiveJobs = useMemo(() => {
    return jobs.map(job => ({
      ...job,
      status: optimisticStatus[job.id] || job.status
    }));
  }, [jobs, optimisticStatus]);

  // --- FILTER LOGIC ---
  const myJobs = effectiveJobs.filter(job => 
    job.technician === CURRENT_TECH_NAME && job.status !== 'Completed'
  );

  // --- STATS ---
  const pendingCount = myJobs.filter(j => j.status === 'Pending').length;
  const progressCount = myJobs.filter(j => j.status === 'In Progress').length;
  const completedCount = jobs.filter(j => j.technician === CURRENT_TECH_NAME && j.status === 'Completed').length;

  const displayedJobs = filter === 'All' ? myJobs : myJobs.filter(j => j.priority === filter);

  // --- HANDLERS ---
  const openNoteModal = (job) => {
    setSelectedJob(job);
    setIsNoteOpen(true);
  };

  const handleStartJob = async (id) => {
    setLoadingJobId(id);
    // 🔥 OPTIMISTIC UPDATE: Update UI immediately
    setOptimisticStatus(prev => ({ ...prev, [id]: 'In Progress' }));

    try {
      await startJob(id);
    } catch (error) {
      console.error("Failed to start job");
      // Revert if failed
      setOptimisticStatus(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    await addNote({
      vehicle: selectedJob.vehicle,
      type: 'Technician Note',
      content: `[${selectedJob.id}] ${noteText}`, 
      job_id: selectedJob.id,  // 🔥 THE FIX: This links the note to the history!
      tech: CURRENT_TECH_NAME
    });
    setIsNoteOpen(false);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assigned Jobs</h1>
          <p className="text-slate-500">Tasks assigned to <span className="font-semibold text-blue-600">{CURRENT_TECH_NAME}</span></p>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-700">{pendingCount}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">Pending <Clock size={12} /></div>
          </div>
          <div className="text-right border-l border-slate-100 pl-6">
            <div className="text-3xl font-bold text-blue-600">{progressCount}</div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center justify-end gap-1">Active <PlayCircle size={12} /></div>
          </div>
          <div className="text-right border-l border-slate-100 pl-6">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center justify-end gap-1">Done <CheckCircle size={12} /></div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>{f} Priority</button>
        ))}
      </div>

      {/* JOB CARDS OR EMPTY STATE */}
      <div className="space-y-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => {
             const isLoading = loadingJobId === job.id;
             
             return (
            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${job.priority === 'High' ? 'bg-red-500' : job.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{job.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{job.status}</span>
                    {job.priority === 'High' && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase"><AlertTriangle size={10} /> Urgent</span>}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{job.description}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Wrench size={14} /> {job.vehicle}</div>
                    <div className="flex items-center gap-1"><Clock size={14} /> {new Date(job.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button onClick={() => openNoteModal(job)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add Note"><MessageSquare size={20} /></button>
                  
                  {job.status === 'Pending' ? (
                    <button 
                      onClick={() => handleStartJob(job.id)} 
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                      {isLoading ? 'Starting...' : 'Start'}
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold animate-in zoom-in duration-300">
                      <CheckCircle size={16} /> In Progress
                    </span>
                  )}
                  
                  <Link to={`/technician/jobs/${job.id}`} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Details</Link>
                </div>
              </div>
            </div>
          )})
        ) : (
          // --- EMPTY STATE CARD ---
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 border-dashed text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              {filter === 'All' ? (
                <Coffee size={40} className="text-slate-300" />
              ) : (
                <CalendarCheck size={40} className="text-slate-300" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No {filter === 'All' ? '' : filter} Jobs Assigned</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {filter === 'All' 
                ? "You're all caught up! There are no pending or active jobs in your queue right now." 
                : `There are no ${filter} priority jobs assigned to you at the moment.`}
            </p>
          </div>
        )}
      </div>

      {/* --- ADD NOTE MODAL --- */}
      {isNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Note to {selectedJob?.id}</h3>
              <button onClick={() => setIsNoteOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-700"
                placeholder="Enter observations, parts used, or issues found..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setIsNoteOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                <button onClick={handleSaveNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Note</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignedJobs;