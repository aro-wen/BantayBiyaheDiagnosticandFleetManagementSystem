import React from 'react';
import { X, Calendar, User, Wrench, FileText, CheckCircle, ClipboardList } from 'lucide-react';

const ServiceReportModal = ({ isOpen, onClose, report, relatedNotes = [] }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Service Report</h2>
              <p className="text-xs text-slate-500 font-mono uppercase">ID: {report.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. KEY DETAILS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
              <div className="text-lg font-bold text-slate-800 mt-1">{report.vehicle}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Date</span>
              <div className="text-lg font-bold text-slate-800 mt-1">
                {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* 2. JOB DESCRIPTION */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Wrench size={16} className="text-blue-500" /> Service Performed
            </h3>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700 text-sm leading-relaxed">
              {report.desc || report.description}
            </div>
          </div>

          {/* 3. 🔥 CONNECTED NOTES SECTION 🔥 */}
          {relatedNotes && relatedNotes.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ClipboardList size={16} className="text-orange-500" /> Technician Observations
              </h3>
              <div className="space-y-3">
                {relatedNotes.map(note => (
                  <div key={note.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
                    <div className="mt-0.5">
                      <FileText size={14} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{note.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{note.tech || 'Tech'}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400">
                           {note.created_at ? new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SIGNATURE / FOOTER */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                {report.technician ? report.technician.charAt(0) : 'J'}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-800">Technician Signature</p>
                <p className="text-xs text-slate-500">Verified by {report.technician || 'Juan dela Cruz'}</p>
             </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors">
            Print Report
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceReportModal;