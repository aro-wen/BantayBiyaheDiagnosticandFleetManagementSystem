import React from 'react';
import { X, Calendar, User, Car, Tag } from 'lucide-react';

const ViewNoteModal = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Note Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Metadata Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Car size={12} /> Vehicle
              </label>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800">
                {note.vehicle}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Tag size={12} /> Type
              </label>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800">
                {note.type}
              </div>
            </div>
          </div>

          {/* Main Note Content */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Note Content</label>
            <div className="w-full p-4 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {note.content}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User size={16} className="text-slate-400" />
              <span className="font-medium text-slate-700">{note.tech || 'Unknown Tech'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={14} />
              <span>
                {note.created_at 
                  ? new Date(note.created_at).toLocaleString() 
                  : note.time || 'N/A'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewNoteModal;