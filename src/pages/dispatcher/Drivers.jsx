import React, { useState } from 'react';
import { Users, Car, Navigation, Map, Plus, MoreHorizontal, UserMinus } from 'lucide-react';
import { useJobs } from '../../contexts/JobContext';

// --- MOCK DATA ---
const INITIAL_DRIVERS = [
  { id: 'DRV-001', name: 'Roberto Tan', license: 'N01-12-345678', vehicle: 'JPN-001', status: 'Active', trips: 3 },
  { id: 'DRV-002', name: 'Carmen Lopez', license: 'N01-13-876543', vehicle: 'JPN-002', status: 'Idle', trips: 2 },
  { id: 'DRV-003', name: 'Miguel Fernandez', license: 'N01-14-234567', vehicle: 'JPN-004', status: 'Active', trips: 4 },
  { id: 'DRV-004', name: 'Sofia Ramirez', license: 'N01-15-765432', vehicle: 'Not assigned', status: 'Idle', trips: 0 },
  { id: 'DRV-005', name: 'Luis Mendoza', license: 'N01-16-987654', vehicle: 'JPN-006', status: 'Completed', trips: 5 },
];

const Drivers = () => {
  const { drivers, unassignDriver } = useJobs();

  // --- KPI CALCULATIONS ---
  const totalDrivers = drivers.length;
  const assignedDrivers = drivers.filter(d => d.vehicle !== 'Not assigned').length;
  const activeDrivers = drivers.filter(d => d.status === 'Active').length;
  const totalTrips = drivers.reduce((acc, curr) => acc + curr.trips, 0);

  const handleUnassignClick = (id) => {
    if (confirm('Are you sure you want to unassign this vehicle?')) {
      unassignDriver(id); // <--- Call Context Action
    }
  };

  // --- ACTIONS ---
  const handleUnassign = (id) => {
    if (confirm('Are you sure you want to unassign this vehicle?')) {
      setDrivers(drivers.map(d => d.id === id ? { ...d, vehicle: 'Not assigned', status: 'Idle' } : d));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
          <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DriverMetricCard 
          title="Total Drivers" 
          value={totalDrivers} 
          subtitle="Registered drivers" 
          icon={<Users size={20} />} 
          color="slate"
        />
        <DriverMetricCard 
          title="Assigned Drivers" 
          value={assignedDrivers} 
          subtitle="With vehicles" 
          icon={<Car size={20} />} 
          color="blue"
        />
        <DriverMetricCard 
          title="Active on Road" 
          value={activeDrivers} 
          subtitle="Currently driving" 
          icon={<Navigation size={20} />} 
          color="green"
        />
        <DriverMetricCard 
          title="Trips Today" 
          value={totalTrips} 
          subtitle="Total completed" 
          icon={<Map size={20} />} 
          color="slate"
        />
      </div>

      {/* 3. DRIVER LIST SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Driver List</h2>
          <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            <Plus size={16} className="mr-2" />
            Assign Vehicle
          </button>
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
              {drivers.map((driver) => (
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
                  <td className="px-6 py-4">
                    <StatusBadge status={driver.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-center font-bold">{driver.trips}</td>
                  <td className="px-6 py-4 text-right">
                    {driver.vehicle !== 'Not assigned' && (
                      <button 
                        onClick={() => handleUnassignClick(driver.id)} // Use new handler
                        className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium"
                        >
                        Unassign
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const DriverMetricCard = ({ title, value, subtitle, icon, color }) => {
  const iconColors = {
    slate: 'text-slate-600 bg-slate-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${iconColors[color] || iconColors.slate}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Idle: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Completed: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const icons = {
    Active: <Navigation size={12} className="mr-1" />,
    Idle: <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>,
    Completed: <div className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></div>,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Completed}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default Drivers;