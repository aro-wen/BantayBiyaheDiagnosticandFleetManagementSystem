import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Activity, AlertTriangle, User, 
  CheckCircle, FileText, Wrench, Play, X, Save, ClipboardList, Loader2 
} from 'lucide-react';
import { useJobDetails } from '../../hooks/useJobDetails';
import StatusBadge from '../../components/StatusBadge';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Destructuring all necessary functions and states from your existing hook
  const { 
    job, 
    vehicle, 
    history, 
    isLoading, 
    isSubmitting, 
    startJob, 
    completeJob, 
    addNote, 
    setIsSubmitting 
  } = useJobDetails(id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [report, setReport] = useState({ diagnosis: '', actionTaken: '', partsUsed: '' });

  const handleSubmit = async () => {
    if (!report.actionTaken) return alert("Action taken is required.");
    
    setIsSubmitting(true);
    try {
      // 1. Construct the content for the Service Record
      const content = `[${job.id}] Diagnosis: ${report.diagnosis || 'N/A'}. Action: ${report.actionTaken}. Parts: ${report.partsUsed || 'None'}.`;
      
      // 2. Add the formal note to the maintenance_history table
      await addNote({
        vehicle: job.vehicle,
        type: 'Service Record',
        content,
        job_id: job.id,
        tech: 'Juan dela Cruz' // This could be replaced with auth user context later
      });

      // 3. Update the job status to 'Completed' (which triggers the vehicle activity sync via your DB trigger)
      await completeJob(job.id);
      
      setIsModalOpen(false);
      setReport({ diagnosis: '', actionTaken: '', partsUsed: '' });
    } catch (err) {
      console.error("Error completing job:", err);
      alert("Failed to sync completion report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Syncing job data...</p>
    </div>
  );

  if (!job) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <X className="mx-auto text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold uppercase text-xs tracking-widest">Return to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10 p-2 md:p-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Jobs
        </button>
        
        <div className="flex gap-2">
          {job.status === 'Pending' && (
            <button 
              onClick={() => startJob(job.id)} 
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Play size={18} fill="currentColor" /> Start Job
            </button>
          )}
          {job.status === 'In Progress' && (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <CheckCircle size={18} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Primary Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{job.id}</h1>
            <StatusBadge type={job.status} />
            <StatusBadge type={job.priority} />
          </div>
          <p className="text-slate-500 font-medium">{job.description}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</div>
          <div className="font-bold text-slate-700 flex items-center justify-end gap-2">
            <Calendar size={16} className="text-blue-500" />
            {job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
          <InfoSection title="Vehicle Information">
            <div className="grid grid-cols-2 gap-6">
              <DataItem label="Vehicle ID" value={job.vehicle} />
              <DataItem label="Plate Number" value={vehicle?.plate} />
              <DataItem label="Model" value={vehicle?.model || "HINO XZU342LJ"} />
              <DataItem label="Live Location" value={vehicle?.current_address} icon={<MapPin size={14} className="text-blue-500"/>} />
            </div>
          </InfoSection>

          <InfoSection title="Dispatcher Instructions">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-600 font-medium relative">
              <div className="absolute -top-2 left-4 px-2 bg-white text-[8px] font-black text-blue-600 uppercase border border-slate-100 rounded">Internal Report</div>
              "{job.report || 'No additional instructions provided.'}"
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-4 not-italic font-bold uppercase tracking-tighter">
                <User size={12} /> Logged by Command Center
              </div>
            </div>
          </InfoSection>

          <HistorySection history={history} />
        </div>

        {/* Right Column: OBD Real-time Telemetry */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">OBD-II Real-time Snapshot</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center gap-3 font-bold text-sm transition-colors ${vehicle?.mil === 'ON' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                {vehicle?.mil === 'ON' ? <AlertTriangle size={20} className="animate-pulse" /> : <CheckCircle size={20} />}
                <div className="flex flex-col">
                  <span className="leading-none">{vehicle?.mil === 'ON' ? 'DTC Error Detected' : 'Systems Operational'}</span>
                  <span className="text-[9px] opacity-70 uppercase tracking-widest mt-1">Check Engine Light: {vehicle?.mil || 'OFF'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TelemetryTile label="Coolant" value={`${vehicle?.temp || 0}°C`} />
                <TelemetryTile label="RPM" value={vehicle?.rpm || 0} />
                <TelemetryTile label="Battery" value={`${vehicle?.battery || 0}V`} />
                <TelemetryTile label="Fuel Level" value={`${vehicle?.fuel || 0}%`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Report Modal */}
      {isModalOpen && (
        <ReportModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmit} 
          report={report} 
          setReport={setReport}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// --- Modular Components ---

const InfoSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">{title}</h3>
    {children}
  </div>
);

const DataItem = ({ label, value, icon }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1.5">{label}</label>
    <div className="text-base font-bold text-slate-800 flex items-center gap-1.5 truncate">
      {icon && <span className="shrink-0">{icon}</span>}
      {value || '---'}
    </div>
  </div>
);

const TelemetryTile = ({ label, value }) => (
  <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</div>
    <div className="font-bold text-slate-700 text-lg">{value}</div>
  </div>
);

const HistorySection = ({ history }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2 font-black text-[11px] text-slate-400 uppercase tracking-widest">
      <Wrench size={14} className="text-blue-600" /> Maintenance History
    </div>
    <div className="space-y-4">
      {history.length > 0 ? history.map(note => (
        <div key={note.id} className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {note.type === 'Service Record' ? <CheckCircle className="text-green-500" size={18}/> : <FileText className="text-blue-500" size={18}/>}
          </div>
          <div className="flex-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-100">{note.type}</span>
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{note.content.replace(/\[.*?\]/g, '')}</p>
            <div className="mt-3 text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <User size={10} /> Technician: {note.tech || 'System'}
            </div>
          </div>
        </div>
      )) : (
        <p className="text-center py-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No previous records found</p>
      )}
    </div>
  </div>
);

const ReportModal = ({ onClose, onSubmit, report, setReport, isSubmitting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
      <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
          <ClipboardList className="text-blue-600" /> Completion Report
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white rounded-lg transition-all text-slate-400"><X size={24}/></button>
      </div>
      <div className="p-6 space-y-4">
        <ModalField label="Diagnosis / Issues Found" value={report.diagnosis} onChange={v => setReport({...report, diagnosis: v})} placeholder="e.g. Worn brake pads, loose calipers" />
        <ModalField label="Action Taken (Required)" value={report.actionTaken} onChange={v => setReport({...report, actionTaken: v})} placeholder="Describe repairs performed..." isArea />
        <ModalField label="Parts Used" value={report.partsUsed} onChange={v => setReport({...report, partsUsed: v})} placeholder="e.g. 1x Front Brake Pad Set" />
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-bold text-sm uppercase tracking-widest">Cancel</button>
          <button 
            onClick={onSubmit} 
            disabled={isSubmitting} 
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? 'Syncing...' : 'Submit & Complete'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ModalField = ({ label, value, onChange, placeholder, isArea }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</label>
    {isArea ? (
      <textarea className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none text-sm font-semibold transition-all resize-none" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none text-sm font-semibold transition-all" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

export default JobDetails;