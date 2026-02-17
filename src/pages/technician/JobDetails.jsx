import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../contexts/JobContext';
import { supabase } from '../../supabaseClient'; 
import { 
  ArrowLeft, Calendar, MapPin, Activity, AlertTriangle, User, 
  CheckCircle, FileText, Wrench, Play, X, Save, ClipboardList 
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. Get Global Data & Actions
  const { jobs, vehicles, notes, startJob, completeJob, addNote } = useJobs(); 
  
  // 2. Local State
  const [directJob, setDirectJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW: COMPLETION MODAL STATE ---
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [reportData, setReportData] = useState({
    diagnosis: '',
    actionTaken: '',
    partsUsed: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. EFFECT: Find the Job
  useEffect(() => {
    const findOrFetchJob = async () => {
      setIsLoading(true);
      const foundInContext = jobs.find(j => {
        const dbId = String(j.id).toLowerCase().trim();
        const urlId = String(id).toLowerCase().trim();
        return (
          dbId === urlId || 
          dbId === `j-${urlId}` || 
          `j-${dbId}` === urlId ||
          dbId.replace('j-', '') === urlId.replace('j-', '')
        );
      });

      if (foundInContext) {
        setDirectJob(foundInContext);
        setIsLoading(false);
        return;
      }

      console.log("⚠️ Job not in Context. Fetching from DB...");
      let { data } = await supabase.from('jobs').select('*').eq('id', id).single();
      
      if (!data) {
        const altId = id.toUpperCase().startsWith('J-') ? id.replace('J-', '') : `J-${id}`;
        const { data: altData } = await supabase.from('jobs').select('*').eq('id', altId).single();
        if (altData) data = altData;
      }

      setDirectJob(data || null);
      setIsLoading(false);
    };

    findOrFetchJob();
  }, [id, jobs]); 

  // 4. Derived Data
  const job = directJob;
  const vehicle = vehicles.find(v => v.id === job?.vehicle);
  const vehicleHistory = notes
    .filter(n => n.vehicle === job?.vehicle)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // --- 5. HANDLER: SUBMIT COMPLETION REPORT ---
  const handleSubmitCompletion = async () => {
    if (!reportData.actionTaken) return alert("Please describe the action taken.");
    
    setIsSubmitting(true);

    // A. Create the Detailed Note Content
    // We format it nicely so it looks good in the history list
    const noteContent = `[${job.id}] COMPLETED. 
    Diagnosis: ${reportData.diagnosis || 'Routine Maintenance'}. 
    Action: ${reportData.actionTaken}. 
    Parts: ${reportData.partsUsed || 'None'}.`;

    // B. Save the Note
    await addNote({
      vehicle: job.vehicle,
      type: 'Service Record',
      content: noteContent
    });

    // C. Mark Job as Complete
    await completeJob(job.id);

    setIsSubmitting(false);
    setIsCompleteModalOpen(false);
    // Optional: navigate back or stay here
  };

  // --- VIEW: LOADING ---
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  // --- VIEW: NOT FOUND ---
  if (!job) return <div className="p-10 text-center">Job Not Found</div>;

  // --- VIEW: MAIN PAGE ---
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Jobs
        </button>
        
        <div className="flex gap-3">
          {job.status === 'Pending' && (
            <button onClick={() => startJob(job.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <Play size={18} /> Start Job
            </button>
          )}
          {job.status === 'In Progress' && (
            // CHANGED: Now opens the Modal instead of completing immediately
            <button onClick={() => setIsCompleteModalOpen(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
              <CheckCircle size={18} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* JOB CARD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{job.id}</h1>
            <StatusBadge type={job.status} />
            <StatusBadge type={job.priority} />
          </div>
          <p className="text-slate-500">{job.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Scheduled Date</div>
          <div className="font-semibold text-slate-800 flex items-center justify-end gap-2">
            <Calendar size={16} className="text-blue-500" />
            {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* VEHICLE INFO */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs text-slate-400 uppercase font-bold">Vehicle ID</label><div className="text-lg font-medium text-slate-800">{job.vehicle}</div></div>
              <div><label className="text-xs text-slate-400 uppercase font-bold">Plate Number</label><div className="text-lg font-medium text-slate-800">{vehicle?.plate || 'Unknown'}</div></div>
              <div><label className="text-xs text-slate-400 uppercase font-bold">Model</label><div className="text-slate-700">Toyota HiAce Commuter</div></div>
              <div><label className="text-xs text-slate-400 uppercase font-bold">Location</label><div className="flex items-center text-slate-700"><MapPin size={14} className="mr-1 text-slate-400" /> {vehicle?.address || 'Unknown'}</div></div>
            </div>
          </div>

          {/* DISPATCHER REPORT */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Dispatcher Report</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-slate-600 italic mb-3">"{job.report || 'No details.'}"</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User size={12} /> Reported by Dispatcher
              </div>
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Wrench size={20} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Maintenance History</h3>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {vehicleHistory.length > 0 ? (
                vehicleHistory.map((note) => (
                  <div key={note.id} className="flex gap-4 relative">
                    <div className="absolute left-[19px] top-8 bottom-[-16px] w-0.5 bg-slate-100"></div>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${note.type === 'Service Record' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {note.type === 'Service Record' ? <CheckCircle size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase text-slate-500">{note.type}</span>
                        <span className="text-[10px] text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-700">{note.content.replace(/\[.*?\]/g, '')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic">No previous history.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE OBD */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">OBD-II Snapshot</h3>
            <div className="space-y-4">
              <div className={`flex justify-between items-center p-3 rounded-lg border ${vehicle?.mil === 'ON' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                <div className="flex items-center gap-3">
                  {vehicle?.mil === 'ON' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                  <span className="text-sm font-medium">{vehicle?.mil === 'ON' ? 'DTC Detected' : 'Systems Normal'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                   <div className="text-xs text-slate-400 mb-1">Coolant</div><div className="font-bold text-slate-700">{vehicle?.temp || 0}°C</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                   <div className="text-xs text-slate-400 mb-1">RPM</div><div className="font-bold text-slate-700">{vehicle?.rpm || 0}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                   <div className="text-xs text-slate-400 mb-1">Battery</div><div className="font-bold text-slate-700">{vehicle?.battery || 0} V</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                   <div className="text-xs text-slate-400 mb-1">Fuel</div><div className="font-bold text-slate-700">{vehicle?.fuel || 0}%</div>
                </div>
              </div>
              <div className="text-xs text-center text-slate-400 mt-2 flex items-center justify-center gap-2">
                 <Activity size={10} className="animate-pulse text-green-500"/> Live Data Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- COMPLETION REPORT MODAL --- */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-blue-600" /> Completion Report
              </h3>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis / Issues Found</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Worn brake pads, Low oil level"
                  value={reportData.diagnosis}
                  onChange={(e) => setReportData({...reportData, diagnosis: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Action Taken (Required)</label>
                <textarea 
                  className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Describe the repairs made..."
                  value={reportData.actionTaken}
                  onChange={(e) => setReportData({...reportData, actionTaken: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Parts Used</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 1x Oil Filter, 4L Synthetic Oil"
                  value={reportData.partsUsed}
                  onChange={(e) => setReportData({...reportData, partsUsed: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
                Cancel
              </button>
              <button 
                onClick={handleSubmitCompletion} 
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : <><Save size={18} /> Submit & Complete</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetails;