import React, { useState, useMemo } from 'react';
import { Users, Car, Navigation, Map, Plus, Search, Filter } from 'lucide-react'; // Added Search, Filter
import { useJobs } from '../../contexts/JobContext';
import StatusBadge from '../../components/StatusBadge';
import AssignVehicleModal from '../../components/AssignVehicleModal';

const Drivers = () => {
  const { drivers, vehicles, assignDriver, unassignDriver } = useJobs();
  
  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDriverId, setModalDriverId] = useState('');
  
  // --- NEW: SEARCH & FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // --- KPI CALCULATIONS ---
  const totalDrivers = drivers.length;
  const assignedDrivers = drivers.filter(d => d.vehicle !== 'Not assigned').length;
  const activeDrivers = drivers.filter(d => d.status === 'Active').length;
  const totalTrips = drivers.reduce((acc, curr) => acc + curr.trips, 0);

  // --- FILTER LOGIC (For the Table) ---
  const filteredDrivers = drivers.filter(driver => {
    // 1. Search Logic (Checks Name, ID, and License)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchLower) ||
      driver.id.toLowerCase().includes(searchLower) ||
      driver.license.toLowerCase().includes(searchLower);

    // 2. Dropdown Filter Logic
    const matchesStatus = statusFilter === 'All Status' || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- MODAL DATA PREPARATION ---
  const currentlyAssignedVehicleIds = useMemo(() => 
    drivers.map(d => d.vehicle).filter(v => v !== 'Not assigned'), 
  [drivers]);

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => v.avail === 'Available' && !currentlyAssignedVehicleIds.includes(v.id)), 
  [vehicles, currentlyAssignedVehicleIds]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(d => d.vehicle === 'Not assigned' || d.id === modalDriverId);
  }, [drivers, modalDriverId]);


  // --- HANDLERS ---
  const openAssignModal = (driverId = '') => {
    setModalDriverId(driverId);
    setIsModalOpen(true);
  };

  const handleUnassignClick = (id) => {
    if (confirm('Are you sure you want to unassign this vehicle?')) {
      unassignDriver(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
          <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DriverMetricCard title="Total Drivers" value={totalDrivers} subtitle="Registered drivers" icon={<Users size={20} />} color="slate"/>
        <DriverMetricCard title="Assigned Drivers" value={assignedDrivers} subtitle="With vehicles" icon={<Car size={20} />} color="blue"/>
        <DriverMetricCard title="Active on Road" value={activeDrivers} subtitle="Currently driving" icon={<Navigation size={20} />} color="green"/>
        <DriverMetricCard title="Trips Today" value={totalTrips} subtitle="Total completed" icon={<Map size={20} />} color="slate"/>
      </div>

      {/* DRIVER LIST SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* --- NEW: TOOLBAR ROW --- */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">Driver List</h2>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Name, ID, or License..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-slate-200 pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Idle</option>
                <option>Completed</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>

            {/* Assign Button */}
            <button 
              onClick={() => openAssignModal()} 
              className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Assign Vehicle
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Driver ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">License Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Trip Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center">Trips Today</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm">{driver.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{driver.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{driver.license}</td>
                    <td className="px-6 py-4 text-sm">
                      {driver.vehicle === 'Not assigned' ? (
                        <span className="text-slate-400 italic">Not assigned</span>
                      ) : (
                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{driver.vehicle}</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={driver.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-center font-bold">{driver.trips}</td>
                    <td className="px-6 py-4 text-right">
                      {driver.vehicle !== 'Not assigned' ? (
                        <button 
                          onClick={() => handleUnassignClick(driver.id)}
                          className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium"
                        >
                          Unassign
                        </button>
                      ) : (
                        <button 
                          onClick={() => openAssignModal(driver.id)}
                          className="text-xs border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No drivers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

const DriverMetricCard = ({ title, value, subtitle, icon, color }) => {
  const iconColors = {
    slate: 'text-slate-600 bg-slate-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${iconColors[color] || iconColors.slate}`}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

export default Drivers;