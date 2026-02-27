import React, { useState } from 'react';
import { Users, Car, Navigation, Map, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import { useDriverManagement } from '../../hooks/useDriverManagement';
import StatusBadge from '../../components/StatusBadge';
import AssignVehicleModal from '../../components/AssignVehicleModal';

const Drivers = () => {
  const { assignDriver, unassignDriver } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDriverId, setModalDriverId] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const { 
    filteredDrivers, stats, availableVehicles, setOptimisticOverrides, displayDrivers 
  } = useDriverManagement(searchTerm, statusFilter);

  const handleUnassign = async (id) => {
    if (window.confirm('Unassign this vehicle?')) {
      setProcessingId(id);
      setOptimisticOverrides(prev => ({ ...prev, [id]: 'Not assigned' }));
      try { await unassignDriver(id); } 
      finally { setProcessingId(null); }
    }
  };

  const handleAssign = async (driverId, vehicleId) => {
    setIsModalOpen(false);
    setProcessingId(driverId);
    setOptimisticOverrides(prev => ({ ...prev, [driverId]: vehicleId }));
    try { await assignDriver(driverId, vehicleId); } 
    finally { setProcessingId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Drivers & Assignments</h1>
          <p className="text-sm font-medium text-slate-500">Manage fleet personnel and active duty</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Personnel" value={stats.total} icon={<Users size={20}/>} color="bg-slate-100 text-slate-600" />
        <MetricCard title="Units Assigned" value={stats.assigned} icon={<Car size={20}/>} color="bg-blue-50 text-blue-600" />
        <MetricCard title="Active Duty" value={stats.active} icon={<Navigation size={20}/>} color="bg-green-50 text-green-600" />
        <MetricCard title="Fleet Trips" value={stats.trips} icon={<Map size={20}/>} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <select 
              className="flex-1 lg:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Idle</option>
              <option>On Leave</option>
            </select>
            <button 
              onClick={() => { setModalDriverId(''); setIsModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-sm"
            >
              <Plus size={16} /> Assign
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Information</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Assignment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Trips</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{driver.name}</div>
                    <div className="text-xs text-slate-400 font-mono font-medium">{driver.id} • {driver.license}</div>
                  </td>
                  <td className="px-6 py-4">
                    {driver.vehicle && driver.vehicle !== 'Not assigned' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                        <Car size={14} /> {driver.vehicle}
                      </span>
                    ) : <span className="text-slate-300 italic text-sm font-medium">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge type={driver.status} /></td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600">{driver.trips}</td>
                  <td className="px-6 py-4 text-right">
                    {processingId === driver.id ? (
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 px-3"><Loader2 size={14} className="animate-spin" /> Syncing</span>
                    ) : (
                      <button 
                        onClick={() => driver.vehicle !== 'Not assigned' ? handleUnassign(driver.id) : (setModalDriverId(driver.id), setIsModalOpen(true))}
                        className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition-all ${driver.vehicle !== 'Not assigned' ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-blue-600 border-blue-100 hover:bg-blue-50'}`}
                      >
                        {driver.vehicle !== 'Not assigned' ? 'Unassign' : 'Assign Unit'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleAssign}
        drivers={displayDrivers.filter(d => !d.vehicle || d.vehicle === 'Not assigned' || d.id === modalDriverId)}
        vehicles={availableVehicles}
        preSelectedDriverId={modalDriverId}
      />
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
  </div>
);

export default Drivers;