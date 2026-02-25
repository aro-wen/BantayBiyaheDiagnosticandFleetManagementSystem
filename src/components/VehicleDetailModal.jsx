import React, { useState } from 'react';
import { 
  X, Activity, Gauge, Thermometer, Battery, Droplet, 
  AlertTriangle, CheckCircle, MapPin 
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useJobs } from '../contexts/JobContext'; 

const VehicleDetailModal = ({ isOpen, onClose, vehicle }) => {
  // 1. Pull the live 'vehicles' array from context alongside dtcs
  const { dtcs, vehicles } = useJobs(); 
  const [activeTab, setActiveTab] = useState('diagnostics');

  if (!isOpen || !vehicle) return null;

  // 🔥 THE FIX: Find the live, real-time version of this vehicle from the context
  const liveVehicle = vehicles.find(v => v.id === vehicle.id) || vehicle;

  // Filter DTCs for this specific vehicle
  const vehicleDtcs = dtcs.filter(d => d.vehicle_id === liveVehicle.id);
  const hasDTCs = liveVehicle.mil === 'ON' || vehicleDtcs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-white">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{liveVehicle.id}</h2>
              <StatusBadge type={liveVehicle.status} />
            </div>
            <p className="text-slate-500 font-medium">Plate: {liveVehicle.plate}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 pt-2 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-6">
            {['diagnostics', 'dtc', 'location'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'dtc' ? 'DTC Codes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
          
          {/* TAB 1: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DiagCard 
                title="RPM" 
                value={liveVehicle.rpm || 0} 
                unit="" 
                icon={<Activity size={20} className="text-blue-500" />} 
              />
              <DiagCard 
                title="Speed" 
                value={liveVehicle.speed || 0} 
                unit="km/h" 
                icon={<Gauge size={20} className="text-green-500" />} 
              />
              <DiagCard 
                title="Coolant Temp" 
                value={liveVehicle.coolant_temp || liveVehicle.temp || 0} 
                unit="°C" 
                icon={<Thermometer size={20} className="text-orange-500" />} 
              />
              <DiagCard 
                title="Battery" 
                value={liveVehicle.battery_voltage || liveVehicle.battery || 0} 
                unit="V" 
                icon={<Battery size={20} className="text-yellow-500" />} 
              />
              <DiagCard 
                title="Fuel Level" 
                value={liveVehicle.fuel_level || liveVehicle.fuel || 0} 
                unit="%" 
                icon={<Droplet size={20} className="text-cyan-500" />} 
              />
              
              {/* Check Engine Indicator */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check Engine</div>
                  <div className={`text-xl font-bold ${hasDTCs ? 'text-red-600' : 'text-green-600'}`}>
                    {hasDTCs ? 'ON' : 'OFF'}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${hasDTCs ? 'bg-red-50' : 'bg-green-50'}`}>
                   {hasDTCs ? <AlertTriangle size={20} className="text-red-500" /> : <CheckCircle size={20} className="text-green-500" />}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DTC CODES (Connected to DB) */}
          {activeTab === 'dtc' && (
            <div className="space-y-4">
              {vehicleDtcs.length > 0 ? (
                vehicleDtcs.map((dtc) => (
                  <div key={dtc.id} className="p-4 rounded-xl border flex items-start gap-4 bg-red-50 border-red-100">
                    <div className="mt-1 p-1.5 rounded-full bg-red-200 text-red-700">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{dtc.code}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-200 text-red-800">
                          {dtc.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{dtc.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Diagnostic Trouble Codes</h3>
                  <p className="text-slate-500 text-sm">Vehicle systems operating normally</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION (Connected to DB) */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
                  <MapPin size={20} className="text-blue-600" />
                  GPS Coordinates
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Latitude</label>
                    <div className="text-xl font-mono text-slate-800">{liveVehicle.lat || 0}° N</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Longitude</label>
                    <div className="text-xl font-mono text-slate-800">{liveVehicle.lng || 0}° E</div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <label className="text-xs font-bold text-slate-400 uppercase">Current Address</label>
                  <div className="text-lg text-slate-800 mt-1">{liveVehicle.address || 'Location unavailable'}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const DiagCard = ({ title, value, unit, icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">
      {icon}
    </div>
  </div>
);

export default VehicleDetailModal;