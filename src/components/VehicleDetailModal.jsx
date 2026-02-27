import React, { useState, useEffect } from 'react';
import { 
  X, Activity, Gauge, Thermometer, Battery, Droplet, 
  AlertTriangle, CheckCircle, MapPin 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import StatusBadge from './StatusBadge';
import { useJobs } from '../contexts/JobContext'; 

// --- IMPORT THRESHOLD HELPERS ---
import { getStatusColor, isMilActive } from '../config/thresholds'; 

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400); 
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const VehicleDetailModal = ({ isOpen, onClose, vehicle, mapKey }) => {
  const { dtcs, vehicles } = useJobs(); 
  const [activeTab, setActiveTab] = useState('diagnostics');

  if (!isOpen || !vehicle) return null;

  const liveVehicle = vehicles.find(v => v.id === vehicle.id) || vehicle;
  const vehicleDtcs = dtcs.filter(d => d.vehicle_id === liveVehicle.id);
  
  const milActive = isMilActive(liveVehicle.mil);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh] relative z-0">
        
        {/* Header */}
        <div className="relative z-20 px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 truncate uppercase tracking-tight">{liveVehicle.id}</h2>
              <StatusBadge type={liveVehicle.status} className="scale-75 md:scale-100 origin-left" />
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
            {['diagnostics', 'dtc', 'location'].map((tab) => {
              const isActive = activeTab === tab;
              const baseStyles = "pb-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2";
              const activeStyles = "border-blue-600 text-blue-600";
              const inactiveStyles = "border-transparent text-slate-400 hover:text-slate-600";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
                >
                  {tab === 'dtc' ? 'DTC Codes' : tab}
                </button>
              );
            })}
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
              
              <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">MIL Status</div>
                  <div className={`text-sm md:text-xl uppercase font-bold ${getStatusColor(liveVehicle.mil, 'MIL')}`}>
                    {milActive ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>
                <div className={`p-2 rounded-full ${milActive ? 'bg-amber-50' : 'bg-green-50'}`}>
                   {milActive ? <AlertTriangle size={20} className="text-amber-500" /> : <CheckCircle size={20} className="text-green-500" />}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DTC CODES */}
          {activeTab === 'dtc' && (
            <div className="space-y-3">
              {vehicleDtcs.length > 0 ? (
                vehicleDtcs.map((dtc) => (
                  <div key={dtc.id} className="p-4 rounded-xl border flex items-start gap-4 bg-red-50 border-red-100">
                    <AlertTriangle size={18} className="text-red-500 mt-1 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 uppercase leading-none">{dtc.code}</span>
                        <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-200 text-red-800">
                          {dtc.severity}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">{dtc.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                  <CheckCircle size={48} className="text-green-200 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase">Systems Healthy</h3>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">No fault codes detected</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4 h-full flex flex-col min-h-[35px]">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shrink-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Coordinates</p>
                <p className="text-xs font-mono font-bold text-slate-700 uppercase">
                  {liveVehicle.lat || 0}° N, {liveVehicle.lng || 0}° E
                </p>
                <div className="mt-3 border-t border-slate-50 pt-3">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Current Address</p>
                  <p className="text-xs font-semibold text-slate-800 uppercase leading-snug">
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

const DiagCard = ({ title, value, unit, icon, color = "text-slate-700" }) => (
  <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div className="min-w-0">
      <div className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-sm md:text-2xl font-bold truncate ${color}`}>{value}</span>
        <span className="text-[10px] md:text-sm font-semibold text-slate-400">{unit}</span>
      </div>
    </div>
    <div className="p-2 md:p-3 bg-slate-50 rounded-xl shrink-0 ml-2 border border-slate-100">
      <div className={color}>{icon}</div>
    </div>
  </div>
);

export default VehicleDetailModal;