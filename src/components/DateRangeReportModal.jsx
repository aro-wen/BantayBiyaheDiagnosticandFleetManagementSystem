import React, { useState, useMemo, useRef } from 'react';
import { X, Printer, Calendar, FileText, Car, ChevronDown } from 'lucide-react';

const DateRangeReportModal = ({ isOpen, onClose, jobs }) => {
  // Default to current month
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0].slice(0, 7) + '-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicles');

  // --- 1. GET UNIQUE VEHICLES ---
  const uniqueVehicles = useMemo(() => {
    if (!jobs) return ['All Vehicles'];
    // Extract unique vehicle IDs and sort them
    const vehicles = [...new Set(jobs.map(j => j.vehicle))].sort();
    return ['All Vehicles', ...vehicles];
  }, [jobs]);

  // --- 2. FILTER LOGIC (Date + Vehicle) ---
  const reportData = useMemo(() => {
    if (!jobs) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include the full end day

    return jobs.filter(j => {
      // Date Check
      const jobDate = new Date(j.created_at || j.date);
      const isDateInRange = jobDate >= start && jobDate <= end;

      // Vehicle Check
      const isVehicleMatch = selectedVehicle === 'All Vehicles' || j.vehicle === selectedVehicle;

      return isDateInRange && isVehicleMatch && j.status === 'Completed';
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [jobs, startDate, endDate, selectedVehicle]);

  // --- PRINT FUNCTION ---
  const handlePrint = () => {
    const printContent = document.getElementById('printable-report');
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    
    // Restore app state
    document.body.innerHTML = originalContents;
    window.location.reload(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="text-blue-600" size={20}/> Generate Summary Report
            </h3>
            <p className="text-xs text-slate-500">Select parameters to compile maintenance records.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* CONTROLS (Vehicle Filter Added Here) */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-end">
            
            {/* Start Date */}
            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Start Date</label>
                <div className="relative">
                  <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-3 pr-2 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
            </div>

            {/* End Date */}
            <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">End Date</label>
                <div className="relative">
                  <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-3 pr-2 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
            </div>

            {/* NEW: Vehicle Selector */}
            <div className="min-w-[180px]">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Vehicle Filter</label>
                <div className="relative">
                  <select 
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none bg-white cursor-pointer transition-all"
                  >
                    {uniqueVehicles.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <Car className="absolute right-8 top-2.5 text-slate-400 pointer-events-none" size={16} />
                  <ChevronDown className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Result Counter */}
            <div className="flex-1 text-right pb-2">
                 <span className="text-sm font-bold text-slate-600 mr-2">
                    Found: {reportData.length} Records
                 </span>
            </div>
        </div>

        {/* PREVIEW AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div id="printable-report" className="bg-white p-8 shadow-sm border border-slate-100 max-w-[210mm] mx-auto min-h-[297mm]">
                
                {/* REPORT HEADER */}
                <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Maintenance Summary</h1>
                        <p className="text-slate-500 text-sm mt-1">BantayBiyahe Fleet Management System</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Scope</p>
                        <p className="text-sm font-bold text-slate-800 mb-1">{selectedVehicle}</p>
                        
                        <p className="text-xs font-bold text-slate-400 uppercase">Period</p>
                        <p className="text-sm font-bold text-slate-800">
                            {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* REPORT TABLE */}
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-300">
                            <th className="py-2 font-black text-slate-700 uppercase">Date</th>
                            <th className="py-2 font-black text-slate-700 uppercase">Vehicle</th>
                            <th className="py-2 font-black text-slate-700 uppercase">Type</th>
                            <th className="py-2 font-black text-slate-700 uppercase">Job Title</th>
                            <th className="py-2 font-black text-slate-700 uppercase">Tech</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reportData.length > 0 ? (
                            reportData.map((job) => (
                                <tr key={job.id}>
                                    <td className="py-3 text-slate-600 font-mono">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 font-bold text-slate-800">{job.vehicle}</td>
                                    <td className="py-3 text-slate-600">
                                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold text-[10px] uppercase">
                                        {job.type}
                                      </span>
                                    </td>
                                    <td className="py-3 text-slate-800">{job.description}</td>
                                    <td className="py-3 text-slate-600">{job.technician || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                                    No completed maintenance records found for the selected vehicle and date range.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* SUMMARY FOOTER */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <div className="text-xs text-slate-400">
                        Generated on {new Date().toLocaleString()} by Technician Portal
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Services</div>
                        <div className="text-xl font-black text-slate-900">{reportData.length}</div>
                    </div>
                </div>

                {/* SIGNATURE AREA */}
                <div className="mt-16 grid grid-cols-2 gap-12">
                    <div>
                        <div className="border-b border-slate-400 h-8"></div>
                        <div className="text-xs font-bold text-slate-500 mt-2 uppercase">Prepared By (Technician)</div>
                    </div>
                    <div>
                        <div className="border-b border-slate-400 h-8"></div>
                        <div className="text-xs font-bold text-slate-500 mt-2 uppercase">Approved By (Dispatcher)</div>
                    </div>
                </div>

            </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">
                Cancel
            </button>
            <button 
                onClick={handlePrint}
                disabled={reportData.length === 0}
                className={`flex items-center gap-2 px-6 py-2 text-white font-bold rounded-lg transition-colors shadow-lg ${
                    reportData.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                <Printer size={18} /> Print Report
            </button>
        </div>

      </div>
    </div>
  );
};

export default DateRangeReportModal;