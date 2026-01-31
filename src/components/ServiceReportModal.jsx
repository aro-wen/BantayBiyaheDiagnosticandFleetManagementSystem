import React from 'react';
import { 
  X, Printer, Download, User, Truck, CheckCircle, Calendar, Clock 
} from 'lucide-react';

const ServiceReportModal = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800">Service Report</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Ref: {report.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Status Banner */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100 text-green-800">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-bold text-sm">Maintenance Completed</p>
              <p className="text-xs opacity-80">This job was successfully closed on {report.date}.</p>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Truck size={12} /> Vehicle
              </span>
              <div className="font-bold text-slate-800">{report.vehicle}</div>
              <div className="text-xs text-slate-500">{report.plate || 'ABC-1234'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <User size={12} /> Technician
              </span>
              <div className="font-bold text-slate-800">Juan dela Cruz</div>
              <div className="text-xs text-slate-500">ID: T-1047</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Service Description</label>
            <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed">
              {report.desc}
            </div>
          </div>

          {/* Timeline */}
          <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Timeline</label>
             <div className="relative pl-2 border-l-2 border-slate-100 space-y-6 ml-1">
                {/* Event 1 */}
                <div className="relative pl-4">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Job Created</p>
                    <p className="text-xs text-slate-400">{report.date} • 08:30 AM</p>
                  </div>
                </div>
                {/* Event 2 */}
                <div className="relative pl-4">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Work Started</p>
                    <p className="text-xs text-slate-400">{report.date} • 09:15 AM</p>
                  </div>
                </div>
                {/* Event 3 */}
                <div className="relative pl-4">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Completed</p>
                    <p className="text-xs text-slate-400">{report.date} • 11:45 AM</p>
                  </div>
                </div>
             </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors shadow-sm">
            <Printer size={16} className="mr-2" />
            Print
          </button>
          <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={16} className="mr-2" />
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default ServiceReportModal;