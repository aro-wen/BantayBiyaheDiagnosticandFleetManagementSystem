import React from 'react';
import { X, Printer, Calendar, User, Wrench, FileText, Car } from 'lucide-react';

const ServiceReportModal = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Service Report</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">ID: {report.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
          
          {/* Status Badge */}
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Completed
             </div>
             <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-slate-500 text-sm">
                    <Calendar size={14} />
                    {new Date(report.created_at || Date.now()).toLocaleDateString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    {new Date(report.created_at || Date.now()).toLocaleTimeString()}
                </div>
             </div>
          </div>

          {/* Vehicle & Tech Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <Car size={12} /> Vehicle
                </label>
                <div className="font-bold text-slate-800 text-lg">{report.vehicle}</div>
                <div className="text-sm text-slate-500">Fleet Unit #{report.vehicle.split('-')[1] || '000'}</div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                    <User size={12} /> Technician
                </label>
                <div className="font-bold text-slate-800 text-lg">{report.technician || 'Unassigned'}</div>
                <div className="text-sm text-slate-500">ID: T-1047</div>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Wrench size={18} className="text-blue-500"/> Service Details
            </h4>
            <div className="border-l-2 border-blue-500 pl-4 py-1">
                <div className="text-sm font-bold text-slate-700 mb-1">Job Title</div>
                <div className="text-slate-800">{report.description || report.desc}</div>
                <div className="flex gap-2 mt-2">
                     <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                        Type: {report.type}
                     </span>
                     <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                        Priority: {report.priority}
                     </span>
                </div>
            </div>
          </div>

          {/* Report/Notes */}
          <div>
             <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FileText size={18} className="text-slate-400"/> Technicial Findings & Report
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                {report.report || "No additional notes provided."}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-sm"
          >
            <Printer size={16} /> Print Report
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg text-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ServiceReportModal;