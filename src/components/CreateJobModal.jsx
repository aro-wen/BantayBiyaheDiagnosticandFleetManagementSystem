import React, { useState, useEffect } from 'react';
import { X, FileText, Type, User, Car } from 'lucide-react';
import { useJobs } from '../contexts/JobContext'; 

// 1. Add onSuccess to props
const CreateJobModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const { addNewJob, vehicles, drivers } = useJobs();

  const initialFormState = {
    vehicleId: '',
    technicianId: '',
    type: 'Routine',
    priority: 'Medium',
    desc: '',      
    report: ''     
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormState,
        vehicleId: vehicle?.id || '', 
        desc: vehicle?.message ? `Fix: ${vehicle.message}` : '', 
        report: vehicle?.code ? `DTC Code: ${vehicle.code}` : ''
      });
    }
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.desc) {
      alert("Please select a vehicle and enter a job title.");
      return;
    }

    const selectedTech = drivers.find(d => d.id === formData.technicianId);
    const randomId = `J-${Math.floor(10000 + Math.random() * 90000)}`;

    const newJob = {
      id: randomId, 
      vehicle: formData.vehicleId,
      technician: selectedTech ? selectedTech.name : 'Unassigned',
      type: formData.type,
      priority: formData.priority,
      status: 'Pending',
      description: formData.desc,   
      report: formData.report,      
      created_at: new Date().toISOString()
    };

    await addNewJob(newJob);

    // 2. TRIGGER SUCCESS CALLBACK
    if (onSuccess) onSuccess();

    onClose();
  };

  // ... rest of the render code (Header, Form, etc.) remains exactly the same ...
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* ... existing JSX content ... */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Create New Job</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
             {/* ... form fields (same as before) ... */}
             
             {/* COPY THE FORM FIELDS FROM PREVIOUS CODE BLOCK IF NEEDED, THEY DONT CHANGE */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Car size={12}/> Vehicle</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.vehicleId} onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}>
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.id} {v.plate ? `(${v.plate})` : ''}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><User size={12}/> Assign Technician</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.technicianId} onChange={(e) => setFormData({...formData, technicianId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {drivers.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Routine">Routine Maintenance</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Repair">Repair</option>
                  </select>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Priority</label>
                    <div className="flex gap-2 mt-1.5">
                      {['Low', 'Medium', 'High'].map(p => (
                        <label key={p} className="flex items-center cursor-pointer">
                          <input type="radio" name="priority" value={p} checked={formData.priority === p} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="mr-1.5 text-slate-900 focus:ring-slate-900"/>
                          <span className={`text-xs font-medium ${p === 'High' ? 'text-red-600' : 'text-slate-700'}`}>{p}</span>
                        </label>
                      ))}
                    </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Type size={12} /> Job Title (Short)</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none" placeholder="e.g. Engine Overheating Check" value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})}/>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><FileText size={12} /> Dispatcher Report</label>
                <textarea rows="4" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none resize-none bg-slate-50" placeholder="Enter detailed instructions..." value={formData.report} onChange={(e) => setFormData({...formData, report: e.target.value})}/>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">Create Job</button>
              </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;