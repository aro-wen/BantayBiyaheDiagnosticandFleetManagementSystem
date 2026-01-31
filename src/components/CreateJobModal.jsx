import React, { useState, useEffect } from 'react';
import { X, FileText, Type, User } from 'lucide-react';

// Mock Technicians List
const TECHNICIANS = [
  { id: 'T-101', name: 'Juan dela Cruz' },
  { id: 'T-102', name: 'Maria Santos' },
  { id: 'T-103', name: 'Mark Reyes' },
  { id: 'T-104', name: 'Sarah Geronimo' }
];

const CreateJobModal = ({ isOpen, onClose, onConfirm }) => {
  // Initialize default state
  const initialFormState = {
    vehicle: 'V-101',
    type: 'Routine',
    priority: 'Medium',
    technician: 'Juan dela Cruz', // NEW: Default Technician
    desc: '',      
    report: ''     
  };

  const [formData, setFormData] = useState(initialFormState);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Create New Job</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Form (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Row 1: Vehicle & Technician (Modified) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vehicle</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
              >
                <option value="V-101">V-101 (ABC 1234)</option>
                <option value="V-102">V-102 (PQR 2468)</option>
                <option value="V-103">V-103 (DEF 5678)</option>
                <option value="V-109">V-109 (MNO 7890)</option>
              </select>
            </div>

            {/* NEW: Technician Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Assign Technician</label>
              <div className="relative">
                <select 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                >
                  {TECHNICIANS.map(tech => (
                    <option key={tech.id} value={tech.name}>{tech.name}</option>
                  ))}
                </select>
                <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Row 2: Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Priority</label>
                <div className="flex gap-2 mt-1.5">
                  {['Low', 'Medium', 'High'].map(p => (
                    <label key={p} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priority" 
                        value={p}
                        checked={formData.priority === p}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="mr-1.5 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-xs text-slate-700">{p}</span>
                    </label>
                  ))}
                </div>
            </div>
          </div>

          {/* Row 3: Job Title (Short Description) */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Type size={12} /> Job Title (Short)
            </label>
            <input 
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Tire Replacement, Check Engine Light"
              value={formData.desc}
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
            />
          </div>

          {/* Row 4: Dispatcher Report (Detailed) */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <FileText size={12} /> Dispatcher Report
            </label>
            <textarea 
              required
              rows="4"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50"
              placeholder="Enter detailed report from driver or observations..."
              value={formData.report}
              onChange={(e) => setFormData({...formData, report: e.target.value})}
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-1 text-right">This will appear in the Technician's detailed view.</p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;