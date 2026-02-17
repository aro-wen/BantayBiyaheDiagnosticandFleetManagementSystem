import React, { useState, useMemo } from 'react';
import { Users, Car, Navigation, Map, Plus, Search, Filter } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';
import StatusBadge from '../../components/StatusBadge';
import AssignVehicleModal from '../../components/AssignVehicleModal';

const Drivers = () => {
  const { drivers, vehicles, assignDriver, unassignDriver } = useJobs();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDriverId, setModalDriverId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // --- KPI CALCULATIONS ---
  const totalDrivers = drivers.length;
  const assignedDrivers = drivers.filter(d => d.vehicle && d.vehicle !== 'Not assigned').length;
  const activeDrivers = drivers.filter(d => d.status === 'Active').length;
  const totalTrips = drivers.reduce((acc, curr) => acc + (curr.trips || 0), 0);

  // --- FILTERING LOGIC ---
  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchLower) ||
      driver.id.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All Status' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- VEHICLE AVAILABILITY LOGIC ---
  // 1. Get list of taken Vehicle IDs
  const takenVehicleIds = useMemo(() => 
    drivers
      .map(d => d.vehicle)
      .filter(v => v && v !== 'Not assigned'), 
  [drivers]);

  // 2. Filter Master List: If it's NOT in the taken list, it's available.
  const availableVehicles = useMemo(() => 
    vehicles.filter(v => !takenVehicleIds.includes(v.id)), 
  [vehicles, takenVehicleIds]);

  // 3. Available Drivers (Unassigned OR the specific one selected)
  const availableDrivers = useMemo(() => 
    drivers.filter(d => !d.vehicle || d.vehicle === 'Not assigned' || d.id === modalDriverId),
  [drivers, modalDriverId]);

  // --- HANDLERS ---
  const openAssignModal = (driverId = '') => {
    setModalDriverId(driverId);
    setIsModalOpen(true);
  };

  const handleUnassignClick = (id) => {
    if (window.confirm('Are you sure you want to unassign this vehicle?')) {
      unassignDriver(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drivers & Assignments</h1>
          <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DriverMetricCard title="Total Drivers" value={totalDrivers} subtitle="Registered" icon={<Users size={20} />} color="slate"/>
        <DriverMetricCard title="Assigned" value={assignedDrivers} subtitle="Has Vehicle" icon={<Car size={20} />} color="blue"/>
        <DriverMetricCard title="Active" value={activeDrivers} subtitle="On Road" icon={<Navigation size={20} />} color="green"/>
        <DriverMetricCard title="Total Trips" value={totalTrips} subtitle="Completed" icon={<Map size={20} />} color="slate"/>
      </div>

      {/* LIST SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Driver List</h2>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Driver..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Idle</option>
                <option>On Leave</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>

            {/* Main Assign Button */}
            <button 
              onClick={() => openAssignModal()} 
              className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Assign Vehicle
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trips</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Driver Info */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{driver.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{driver.id} • {driver.license}</div>
                  </td>

                  {/* Vehicle Info */}
                  <td className="px-6 py-4">
                    {driver.vehicle && driver.vehicle !== 'Not assigned' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <Car size={14} /> {driver.vehicle}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">Not assigned</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <StatusBadge type={driver.status} />
                  </td>

                  {/* Trips */}
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    {driver.trips}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    {driver.vehicle && driver.vehicle !== 'Not assigned' ? (
                      <button 
                        onClick={() => handleUnassignClick(driver.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Unassign
                      </button>
                    ) : (
                      <button 
                        onClick={() => openAssignModal(driver.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDrivers.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No drivers found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <AssignVehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={assignDriver}
        drivers={availableDrivers}
        vehicles={availableVehicles}
        preSelectedDriverId={modalDriverId}
      />

    </div>
  );
};

// Helper Component for Cards
const DriverMetricCard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600'
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-sm font-bold uppercase">{title}</span>
        <div className={`p-2 rounded-lg ${colors[color] || colors.slate}`}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

export default Drivers;