import React, { useState } from 'react';
import { Filter, CheckCircle, FileText, AlertTriangle, Search } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useJobs } from '../../contexts/JobContext';
import NoteModal from '../../components/NoteModal'; // <--- Import Modal

const DTCs = () => {
  const { dtcs, resolveDTC, stats } = useJobs();
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDTCs = dtcs.filter(dtc => {
    const matchesSeverity = filterSeverity === 'All' || dtc.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || dtc.status === filterStatus;
    const matchesSearch = dtc.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dtc.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  // Helper to open modal
  const handleOpenNote = (dtc) => {
    setModalData({
      jobId: 'N/A', // DTCs might not always be linked to a Job ID yet
      vehicle: dtc.vehicle,
      type: 'Observation' // Default for diagnostics
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Diagnostic Trouble Codes (DTCs)</h2>
            <p className="text-slate-500 text-sm">Monitor and manage active fault codes across the fleet</p>
          </div>
          <div className="text-right">
             <span className="text-3xl font-bold text-red-600 block">{stats.activeDTCs}</span>
             <span className="text-xs text-slate-500 uppercase font-semibold">Active Alerts</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input type="text" placeholder="Search Code or Vehicle..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4 w-1/3">Description</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDTCs.map((dtc) => (
              <tr key={dtc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-800">{dtc.code}</td>
                <td className="px-6 py-4"><div className="font-medium text-slate-800">{dtc.vehicle}</div><div className="text-xs text-slate-500">{dtc.plate}</div></td>
                <td className="px-6 py-4 text-sm text-slate-600">{dtc.desc}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${dtc.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                    <AlertTriangle size={12} className="mr-1" />{dtc.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{dtc.timestamp}</td>
                <td className="px-6 py-4"><StatusBadge type={dtc.status} /></td>
                <td className="px-6 py-4 text-right space-x-2">
                  {dtc.status === 'Active' && (
                    <button onClick={() => resolveDTC(dtc.id)} className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                      <CheckCircle size={14} className="mr-1.5" /> Resolve
                    </button>
                  )}
                  
                  {/* --- Modal Trigger --- */}
                  <button 
                    onClick={() => handleOpenNote(dtc)}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                  >
                    <FileText size={14} className="mr-1.5" /> Notes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDTCs.length === 0 && <div className="p-8 text-center text-slate-500">No DTCs found.</div>}
      </div>

      {/* --- Render Modal --- */}
      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultValues={modalData}
      />
    </div>
  );
};

export default DTCs;