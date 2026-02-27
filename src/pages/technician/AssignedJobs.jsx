import React, { useState } from 'react';
import { Wrench, Clock, CheckCircle, PlayCircle, MessageSquare, X, Coffee, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAssignedJobs } from '../../hooks/useAssignedJobs';

const AssignedJobs = () => {
  const TECH_NAME = "Juan dela Cruz";
  const [filter, setFilter] = useState('All');
  const [noteState, setNoteState] = useState({ isOpen: false, job: null, text: '' });

  const { displayedJobs, stats, loadingJobId, initiateJob, addNote } = useAssignedJobs(filter, TECH_NAME);

  const handleSaveNote = async () => {
    if (!noteState.text.trim()) return;
    await addNote({
      vehicle: noteState.job.vehicle,
      type: 'Technician Note',
      content: `[${noteState.job.id}] ${noteState.text}`,
      job_id: noteState.job.id,
      tech: TECH_NAME
    });
    setNoteState({ isOpen: false, job: null, text: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* Header & KPIs */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Assigned Jobs</h1>
          <p className="text-sm font-medium text-slate-500">Queue for <span className="text-blue-600">{TECH_NAME}</span></p>
        </div>
        <div className="flex gap-8">
          <KPIDisplay label="Pending" value={stats.pending} color="text-slate-600" />
          <KPIDisplay label="Active" value={stats.active} color="text-blue-600" border />
          <KPIDisplay label="Done" value={stats.completed} color="text-green-600" border />
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['All', 'High', 'Medium', 'Low'].map(p => (
          <button 
            key={p} 
            onClick={() => setFilter(p)}
            className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${filter === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            {p} Priority
          </button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {displayedJobs.length > 0 ? (
          displayedJobs.map(job => (
            <JobItem 
              key={job.id} 
              job={job} 
              isStarting={loadingJobId === job.id} 
              onStart={() => initiateJob(job.id)}
              onNote={() => setNoteState({ ...noteState, isOpen: true, job })}
            />
          ))
        ) : <EmptyQueue filter={filter} />}
      </div>

      {noteState.isOpen && (
        <NoteModal 
          state={noteState} 
          setState={setNoteState} 
          onSave={handleSaveNote} 
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KPIDisplay = ({ label, value, color, border }) => (
  <div className={`text-center ${border ? 'border-l border-slate-100 pl-8' : ''}`}>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

const JobItem = ({ job, isStarting, onStart, onNote }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${job.priority === 'High' ? 'bg-red-500' : job.priority === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'}`} />
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ml-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-slate-400">{job.id}</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${job.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500'}`}>{job.status}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-snug">{job.description}</h3>
        <div className="flex gap-4 mt-2 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1"><Wrench size={14} className="text-blue-500" /> {job.vehicle}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button onClick={onNote} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><MessageSquare size={20} /></button>
        {job.status === 'Pending' ? (
          <button 
            onClick={onStart} 
            disabled={isStarting}
            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isStarting ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />} Start
          </button>
        ) : (
          <span className="px-6 py-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm font-bold">Active</span>
        )}
        <Link to={`/technician/jobs/${job.id}`} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">Details</Link>
      </div>
    </div>
  </div>
);

const NoteModal = ({ state, setState, onSave }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800">Add Service Note</h3>
        <button onClick={() => setState({ ...state, isOpen: false })} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
      </div>
      <div className="p-6">
        <textarea 
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none text-sm font-medium text-slate-700 transition-all"
          placeholder="Enter observations or parts replaced..."
          value={state.text}
          onChange={(e) => setState({ ...state, text: e.target.value })}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setState({ ...state, isOpen: false })} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
          <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Save Note</button>
        </div>
      </div>
    </div>
  </div>
);

const EmptyQueue = ({ filter }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <Coffee size={40} className="text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-1">Queue Empty</h3>
    <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">
      {filter === 'All' ? "No active jobs assigned to you." : `No ${filter} priority jobs found.`}
    </p>
  </div>
);

export default AssignedJobs;