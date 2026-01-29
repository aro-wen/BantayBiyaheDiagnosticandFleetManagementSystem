import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, Play, FileText, User } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useJobs } from '../../contexts/JobContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, startJob, completeJob } = useJobs();

  // Find the specific job
  const job = jobs.find(j => j.id === id);

  if (!job) return <div className="p-8">Job not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header with Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </button>
        <div className="flex gap-3">
          {job.status === 'Pending' && (
            <button onClick={() => startJob(job.id)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Play size={16} className="mr-2" /> Start Job
            </button>
          )}
          {job.status === 'In Progress' && (
            <button onClick={() => completeJob(job.id)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              <CheckCircle size={16} className="mr-2" /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* 2. Job Identity Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{job.id}</h1>
            <StatusBadge type={job.status} />
            <StatusBadge type={job.priority} />
          </div>
          <p className="text-slate-500">{job.desc}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Scheduled Date</div>
          <div className="font-semibold text-slate-800 flex items-center justify-end gap-2">
            <Calendar size={16} className="text-blue-500" />
            {job.date}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Left Column: Vehicle & Dispatcher Info */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Vehicle Context */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Vehicle ID</label>
                <div className="text-lg font-medium text-slate-800">{job.vehicle}</div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Plate Number</label>
                <div className="text-lg font-medium text-slate-800">{job.plate}</div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Model</label>
                <div className="text-slate-700">Toyota HiAce Commuter</div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Location</label>
                <div className="flex items-center text-slate-700">
                  <MapPin size={14} className="mr-1 text-slate-400" />
                  Quezon City Terminal
                </div>
              </div>
            </div>
          </div>

          {/* Dispatcher Report (Mock Data for context) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Dispatcher Report</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
              <p className="text-sm text-slate-700 italic">
                "Driver reported loss of power during uphill climbs. Check Engine light is solid. P0171 code appeared on remote dashboard."
              </p>
              <div className="mt-2 flex items-center text-xs text-slate-500 font-medium">
                <User size={12} className="mr-1" /> Reported by Dispatcher: Marco Polo
              </div>
            </div>
          </div>
        </div>

        {/* 4. Right Column: OBD Snapshot */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">OBD-II Snapshot</h3>
            <div className="space-y-4">
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-700">DTC Codes</span>
                </div>
                <span className="font-bold text-red-600">P0171</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-400 mb-1">Coolant Temp</div>
                  <div className="font-bold text-slate-700">98°C</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-400 mb-1">RPM</div>
                  <div className="font-bold text-slate-700">850</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-400 mb-1">Battery</div>
                  <div className="font-bold text-slate-700">12.4 V</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-400 mb-1">Fuel</div>
                  <div className="font-bold text-slate-700">45%</div>
                </div>
              </div>
              
              <div className="text-xs text-center text-slate-400 mt-2">
                Snapshot captured: {job.date} 09:15 AM
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetails;