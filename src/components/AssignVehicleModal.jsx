import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AssignVehicleModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  drivers, 
  vehicles, 
  preSelectedDriverId 
}) => {
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');

  // Reset or Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDriverId(preSelectedDriverId || '');
      setVehicleId('');
    }
  }, [isOpen, preSelectedDriverId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!driverId || !vehicleId) return;
    onConfirm(driverId, vehicleId);
    onClose();
  };

  // Find the selected driver object for display fallback (in case they are not in the 'available' list because they are the current selection)
  // Note: For this specific modal logic, we usually pass the full list or handle the specific driver display in the parent, 
  // but simpler is to just rely on the 'drivers' prop being the list of OPTIONS.
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Assign Vehicle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Driver Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Driver</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
            >
              <option value="">Select a Driver...</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
            {drivers.length === 0 && !driverId && (
              <p className="text-xs text-orange-500 mt-1">No unassigned drivers available.</p>
            )}
          </div>

          {/* Vehicle Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              <option value="">Select a Vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.plate}
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No available vehicles in fleet.</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!driverId || !vehicleId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Confirm Assignment
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssignVehicleModal;