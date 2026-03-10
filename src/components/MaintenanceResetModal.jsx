import React, { useState, useEffect } from 'react';
import { X, Gauge, ShieldCheck, Cog, Loader2, AlertCircle, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const MaintenanceResetModal = ({ isOpen, onClose, vehicleId, currentOdo, onJobCreated }) => {
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Oil Change',
    technician: '',
    priority: 'Medium'
  });

  // Fetch technician names from the drivers table
  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('drivers') 
        .select('name')
        .order('name', { ascending: true });

      if (!error && data) {
        setTechnicians(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, technician: data[0].name }));
      }
    };

    if (isOpen) fetchTechnicians();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FIX: Generate a unique ID to satisfy the 'not-null constraint'
    const customId = `J-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        id: customId, // Manually providing ID to fix your error
        vehicle: vehicleId, 
        type: formData.type,
        priority: formData.priority,
        technician: formData.technician || 'Unassigned',
        description: `Scheduled Reset: ${formData.type} at ${currentOdo?.toFixed(1)} KM`,
        status: 'Pending'
      }])
      .select();

    if (error) {
      console.error("Supabase Error:", error.message);
      alert("Failed to create job: " + error.message);
    } else {
      // Success: Notify the parent component
      onJobCreated(`Job ${customId} created for ${vehicleId}`);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Command Center styling */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gauge size={16} className="text-cyan-400" />
              <h2 className="text-lg font-black uppercase tracking-tighter tabular-nums">Maintenance Reset</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jeepney ID: {vehicleId}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Service Category Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Reset Category</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'Oil Change', icon: <Cog size={16} /> },
                { name: 'Tire Rotation', icon: <Gauge size={16} /> },
                { name: 'Brake Inspection', icon: <ShieldCheck size={16} /> }
              ].map((service) => (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => setFormData({...formData, type: service.name})}
                  className={`w-full p-3 flex items-center gap-3 rounded-2xl border-2 transition-all text-sm font-black uppercase ${
                    formData.type === service.name 
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {service.icon}
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {/* Technician Dropdown */}
          <div className="pt-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Technician</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select 
                value={formData.technician}
                onChange={(e) => setFormData({...formData, technician: e.target.value})}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 outline-none appearance-none cursor-pointer"
              >
                {technicians.length === 0 ? (
                  <option disabled>Loading technicians...</option>
                ) : (
                  technicians.map((tech, idx) => (
                    <option key={idx} value={tech.name}>{tech.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Notice of Reset Reading */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <p className="text-[10px] font-bold text-amber-800 leading-tight uppercase">
              Notice: Odometer baseline will reset to {currentOdo?.toFixed(1)} KM upon job completion.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-900/20 active:scale-[0.98] transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Dispatch & Log Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceResetModal;