import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';

const NoteModal = ({ isOpen, onClose, defaultValues }) => {
  const { addNote } = useJobs();
  
  // Local form state
  const [formData, setFormData] = useState({
    jobId: '',
    vehicle: '',
    type: 'Inspection',
    content: ''
  });

  // Update form when modal opens or defaults change
  useEffect(() => {
    if (isOpen && defaultValues) {
      setFormData({
        jobId: defaultValues.jobId || '',
        vehicle: defaultValues.vehicle || '',
        type: defaultValues.type || 'Inspection',
        content: ''
      });
    }
  }, [isOpen, defaultValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content) return alert("Please enter a note.");
    
    // Save to Global Context
    addNote(formData);
    
    // Close Modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Add Maintenance Note</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Job ID</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                value={formData.jobId}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Vehicle ID</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                value={formData.vehicle}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Action Type</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="Inspection">Inspection</option>
              <option value="Repair">Repair</option>
              <option value="Replacement">Replacement</option>
              <option value="Observation">Observation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <textarea 
              rows="4" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Enter details..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              autoFocus
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} className="mr-2" />
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;