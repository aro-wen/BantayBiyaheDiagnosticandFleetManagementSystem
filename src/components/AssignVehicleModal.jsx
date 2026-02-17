import React, { useState, useEffect } from 'react';
import { X, User, Car, Check } from 'lucide-react';

const AssignVehicleModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  drivers = [], 
  vehicles = [], 
  preSelectedDriverId = '' 
}) => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDriver(preSelectedDriverId || '');
      setSelectedVehicle('');
    }
  }, [isOpen, preSelectedDriverId]);

  const handleSubmit = () => {
    if (!selectedDriver || !selectedVehicle) return alert('Please select both a driver and a vehicle.');
    onConfirm(selectedDriver, selectedVehicle);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Assign Vehicle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          
          {/* Driver Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <User size={14} /> Select Driver
            </label>
            <div className="relative">
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                disabled={!!preSelectedDriverId}
              >
                <option value="" disabled>-- Choose a Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Vehicle Select */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Car size={14} /> Select Vehicle
            </label>
            <div className="relative">
              <select 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="" disabled>-- Choose a Vehicle --</option>
                {vehicles.length > 0 ? (
                  vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.id} {v.plate ? `(${v.plate})` : ''} - {v.status || 'Active'}
                    </option>
                  ))
                ) : (
                  <option disabled>No available vehicles</option>
                )}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            {/* Helpful Note */}
            <p className="text-xs text-slate-400 mt-1">
              Showing {vehicles.length} unassigned vehicles.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            <Check size={16} /> Confirm Assignment
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignVehicleModal;