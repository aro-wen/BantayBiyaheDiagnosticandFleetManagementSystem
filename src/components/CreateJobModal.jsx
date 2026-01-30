import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CreateJobModal = ({ isOpen, onClose, onConfirm }) => {
  // Initialize default state
  const initialFormState = {
    vehicle: 'V-101',
    plate: 'ABC 1234',
    type: 'Routine',
    priority: 'Medium',
    desc: ''
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Create New Job</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Select */}
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
              </select>
            </div>

            {/* Type Select */}
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
          </div>

          {/* Priority Radio Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Priority Level</label>
            <div className="flex gap-4">
              {['Low', 'Medium', 'High'].map(p => (
                <label key={p} className="flex items-center cursor-pointer group">
                  <input 
                    type="radio" 
                    name="priority" 
                    value={p}
                    checked={formData.priority === p}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="mr-2 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
            <textarea 
              required
              rows="3"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Describe the issue..."
              value={formData.desc}
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3">
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