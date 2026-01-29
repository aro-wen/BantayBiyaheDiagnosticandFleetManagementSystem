import React, { useState } from 'react';
import { Save, Search, User } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext'; // <--- Import Context

const Notes = () => {
  const { notes, addNote } = useJobs(); // <--- Get Data & Action

  // Local State for the Form
  const [formData, setFormData] = useState({
    jobId: '',
    vehicle: '',
    type: 'Inspection',
    content: ''
  });

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Stop page refresh
    
    // Simple Validation
    if (!formData.jobId || !formData.vehicle || !formData.content) {
      alert("Please fill in all required fields.");
      return;
    }

    // Send to Context
    addNote({
      jobId: formData.jobId,
      vehicle: formData.vehicle,
      type: formData.type,
      content: formData.content
    });

    // Reset Form
    setFormData({
      jobId: '',
      vehicle: '',
      type: 'Inspection',
      content: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ADD NEW NOTE FORM */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Note</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Job ID *</label>
              <input 
                type="text" 
                placeholder="e.g., J-2401" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.jobId}
                onChange={(e) => setFormData({...formData, jobId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Vehicle ID *</label>
              <input 
                type="text" 
                placeholder="e.g., V-101" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Action Type</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Inspection">Inspection</option>
                <option value="Repair">Repair</option>
                <option value="Replacement">Replacement</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes *</label>
            <textarea 
              rows="3" 
              placeholder="Enter detailed notes about the work performed..." 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save size={16} className="mr-2" />
              Save Note
            </button>
          </div>
        </form>
      </div>

      {/* 2. DYNAMIC NOTES LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-between">
          Recent Notes
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {notes.length} Records
          </span>
        </h3>
        
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No notes recorded yet.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{note.jobId}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    note.type === 'Repair' ? 'bg-red-50 text-red-700 border-red-100' : 
                    note.type === 'Replacement' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {note.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{note.time}</div>
              </div>
              
              <p className="text-slate-600 text-sm mb-3 leading-relaxed">{note.content}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                 <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                   Vehicle: {note.vehicle}
                 </div>
                 <div className="flex items-center text-xs text-slate-400">
                   <User size={12} className="mr-1" />
                   {note.tech}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notes;