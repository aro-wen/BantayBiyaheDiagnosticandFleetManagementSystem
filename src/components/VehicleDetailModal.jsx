import React, { useState } from 'react';
import { 
  X, Activity, Gauge, Thermometer, Battery, Droplet, 
  AlertTriangle, CheckCircle, MapPin, Power, AlertOctagon, Loader2
} from 'lucide-react';
import { useJobs } from '../contexts/JobContext'; 
import { getStatusColor, isMilActive } from '../config/thresholds'; 
import { useVehicleDTC } from '../hooks/useVehicleDTC'; // Added the new hook

const VehicleDetailModal = ({ isOpen, onClose, vehicle }) => {
  const { vehicles } = useJobs(); 
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Fetch live translated DTCs for this specific vehicle
  const { translatedDTCs, hasFaults, isLoading: dtcLoading } = useVehicleDTC(vehicle?.id);

  if (!isOpen || !vehicle) return null;

  const liveVehicle = vehicles.find(v => v.id === vehicle.id) || vehicle;
  const milActive = isMilActive(liveVehicle.mil);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] relative z-0">
        
        {/* Header */}
        <div className="relative z-20 px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate uppercase tracking-tight">
                {liveVehicle.id}
              </h2>
              
              {/* --- DUAL BADGES (ROUNDED SQUARES) --- */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border 
                  ${liveVehicle.activity === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                    liveVehicle.activity === 'Under Maintenance' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {liveVehicle.activity || 'Inactive'}
                </span>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border animate-in fade-in
                  ${liveVehicle.status === 'Critical' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' :
                    liveVehicle.status === 'Warning' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-green-100 text-green-700 border-green-200'}`}>
                  {liveVehicle.status || 'NORMAL'}
                </span>
              </div>
            </div>
            <p className="text-[10px] md:text-sm text-slate-400 font-semibold uppercase tracking-widest">Plate: {liveVehicle.plate}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 md:px-8 pt-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-4 md:gap-6 whitespace-nowrap">
            {['diagnostics', 'dtc', 'location'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab === 'dtc' ? 'DTC Codes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 overflow-y-auto bg-slate-50/50 flex-1">
          
          {/* TAB 1: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <DiagCard title="RPM" value={liveVehicle.rpm || 0} unit="" icon={<Activity size={18} className="text-blue-500" />} />
              <DiagCard title="Speed" value={liveVehicle.speed || 0} unit="km/h" icon={<Gauge size={18} className="text-green-500" />} />
              
              <DiagCard 
                title="Coolant" 
                value={liveVehicle.temp || 0} 
                unit="°C" 
                color={getStatusColor(liveVehicle.temp, 'TEMP')} 
                icon={<Thermometer size={18} />} 
              />
              <DiagCard 
                title="Battery" 
                value={liveVehicle.battery || 0} 
                unit="V" 
                color={getStatusColor(liveVehicle.battery, 'BATTERY')} 
                icon={<Battery size={18} />} 
              />
              <DiagCard 
                title="Fuel" 
                value={liveVehicle.fuel || 0} 
                unit="%" 
                color={getStatusColor(liveVehicle.fuel, 'FUEL')} 
                icon={<Droplet size={18} />} 
              />
              
              {/* --- MIL STATUS CARD --- */}
              <div className={`bg-white p-3 md:p-5 rounded-xl border shadow-sm flex items-center justify-between ${
                milActive ? 'border-red-200 bg-red-50' : 'border-slate-200'
              }`}>
                <div className="min-w-0">
                  <div className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">MIL Status</div>
                  <div className={`text-sm md:text-xl uppercase font-black ${
                    milActive ? 'text-red-600 animate-pulse' : 'text-green-600'
                  }`}>
                    {milActive ? 'CHECK ENGINE' : 'OPERATIONAL'}
                  </div>
                </div>
                <div className={`p-2 rounded-full ${
                  milActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                   {milActive ? <AlertOctagon size={20} /> : <CheckCircle size={20} />}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DTC CODES (INTEGRATED WITH NEW HOOK) */}
          {activeTab === 'dtc' && (
            <div className="space-y-3">
              {dtcLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed animate-pulse">
                  <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase">Scanning Systems</h3>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Retrieving OBD-II Telemetry</p>
                </div>
              ) : hasFaults ? (
                translatedDTCs.map((fault, index) => (
                  <div key={index} className="p-4 rounded-xl border flex items-start gap-4 bg-red-50 border-red-100 shadow-sm animate-in slide-in-from-bottom-2">
                    <AlertTriangle size={20} className="text-red-500 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 uppercase leading-none">{fault.code}</span>
                        <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-200 text-red-800 tracking-widest truncate">
                          {fault.category}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-700 font-semibold leading-relaxed">{fault.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed animate-in zoom-in-95 duration-300">
                  <CheckCircle size={48} className="text-green-400 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase">Systems Healthy</h3>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">No fault codes detected by OBD-II</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Activity</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{liveVehicle.activity}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direction</p>
                    <p className="text-xs font-bold text-blue-600 uppercase">{liveVehicle.trip_direction || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-50 pt-4">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Current Address</p>
                  <p className="text-sm font-semibold text-slate-800 uppercase leading-snug">
                    {liveVehicle.current_address || 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponent for Diagnostic Tab
const DiagCard = ({ title, value, unit, icon, color = "text-slate-700" }) => (
  <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div className="min-w-0">
      <div className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-sm md:text-2xl font-black truncate ${color}`}>{value}</span>
        <span className="text-[10px] md:text-sm font-semibold text-slate-400">{unit}</span>
      </div>
    </div>
    <div className="p-2 md:p-3 bg-slate-50 rounded-xl shrink-0 ml-2 border border-slate-100">
      <div className={color}>{icon}</div>
    </div>
  </div>
);

export default VehicleDetailModal;