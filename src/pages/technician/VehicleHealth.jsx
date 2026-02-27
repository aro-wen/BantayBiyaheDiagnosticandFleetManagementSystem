import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, MapPin, Truck, Wrench, AlertOctagon, Activity, Thermometer, Zap, Loader2 } from 'lucide-react';
import L from 'leaflet';

import StatusBadge from '../../components/StatusBadge';
import VehicleDetailModal from '../../components/VehicleDetailModal';
import { getStatusColor, isMilActive } from '../../config/thresholds'; 
import { useFleetMonitoring } from '../../hooks/useFleetMonitoring';

// --- FIXED MAP RENDERING HELPER ---
// Ensures Leaflet tiles don't turn grey during transitions
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

// --- UPDATED TECHNICIAN MARKER LOGIC ---
// Colors now sync with the Activity Status Badge palette
const getTechMarkerIcon = (activity, mil) => {
  const a = activity?.toLowerCase();
  const isError = isMilActive(mil);
  
  // Mapping logic: MIL Error > Active > Maintenance > Inactive
  const colorClass = isError ? 'bg-red-500 animate-pulse shadow-[0_0_10px_red]' : 
                     a === 'active' ? 'bg-green-500 shadow-green-500/50 animate-pulse' : 
                     a === 'under maintenance' ? 'bg-amber-500 shadow-amber-500/50' : 
                     'bg-slate-400';

  const borderColor = isError ? 'border-red-200' : 
                      a === 'under maintenance' ? 'border-amber-200' : 
                      'border-slate-200';

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-full h-full bg-white rounded-full shadow-md border-2 ${borderColor}"></div>
            <div class="absolute w-3.5 h-3.5 rounded-full ${colorClass} shadow-lg"></div>
          </div>`,
    iconSize: [32, 32], 
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const VehicleHealth = () => {
  const { 
    filteredVehicles, searchTerm, setSearchTerm, 
    statusFilter, setStatusFilter, 
    selectedVehicle, isModalOpen, openModal, closeModal, mapKey 
  } = useFleetMonitoring();

  // Statistics for Maintenance Overview
  const stats = {
    critical: filteredVehicles.filter(v => isMilActive(v.mil) || v.temp > 100).length,
    maintenance: filteredVehicles.filter(v => v.activity?.toLowerCase() === 'under maintenance').length,
    total: filteredVehicles.length
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 md:space-y-6 p-2 md:p-6 animate-fade-in relative z-0">
      
      {/* 1. HEADER & SUMMARY CARDS */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight uppercase">
            <Wrench className="text-blue-600" /> Maintenance Hub
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Diagnostic oversight for BantayBiyahe fleet</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <HealthStatCard label="Critical / MIL" value={stats.critical} color="text-red-600" icon={<AlertOctagon size={18}/>} />
          <HealthStatCard label="In Service" value={stats.maintenance} color="text-amber-600" icon={<Wrench size={18}/>} />
          <HealthStatCard label="Total Units" value={stats.total} color="text-slate-600" icon={<Truck size={18}/>} className="hidden md:flex" />
        </div>
      </div>

      {/* 2. LIVE MAP SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
        <div className="h-[300px] md:h-[450px] w-full relative">
          <MapContainer 
            center={[14.5813, 120.9930]} 
            zoom={12} 
            className="h-full w-full z-0"
            style={{ zIndex: 0 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredVehicles.map((v) => (
              v.lat && v.lng && (
                <Marker 
                  key={v.id} 
                  position={[v.lat, v.lng]} 
                  icon={getTechMarkerIcon(v.activity, v.mil)}
                >
                  <Popup className="tech-popup">
                    <div className="text-center p-1">
                      <div className="font-black text-slate-800 text-sm uppercase">{v.id}</div>
                      <div className="text-[9px] font-bold text-slate-400 mb-2 uppercase border-b pb-1">{v.plate}</div>
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="text-[10px] font-bold text-slate-500">Status: {v.activity}</div>
                        {isMilActive(v.mil) && <div className="text-[10px] font-bold text-red-500 animate-pulse">!! CHECK ENGINE !!</div>}
                      </div>
                      <button 
                        onClick={() => openModal(v)} 
                        className="w-full bg-slate-900 text-white text-[10px] font-black uppercase py-2.5 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        Run Diagnostics
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
            <MapResizer />
          </MapContainer>
        </div>
      </div>

      {/* 3. FILTER & SEARCH UI */}
      <div className="flex flex-col lg:flex-row gap-3 w-full bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
          <input 
            type="text" 
            placeholder="Search Vehicle ID or Plate..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['all', 'under maintenance', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DIAGNOSTIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => (
          <div 
            key={v.id}
            onClick={() => openModal(v)}
            className={`bg-white p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-xl group relative overflow-hidden ${
              v.temp > 100 || isMilActive(v.mil) ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isMilActive(v.mil) ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isMilActive(v.mil) ? <AlertOctagon size={24} /> : <Activity size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase leading-none mb-1">{v.id}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.plate}</p>
                </div>
              </div>
              <StatusBadge type={v.activity} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className={`text-lg font-black font-mono ${getStatusColor(v.temp, 'TEMP')}`}>{v.temp || 0}°C</p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Engine Temp</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className={`text-lg font-black font-mono ${getStatusColor(v.battery, 'BATTERY')}`}>{v.battery || 0}V</p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Battery</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal integration  */}
      <VehicleDetailModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        vehicle={selectedVehicle} 
        mapKey={mapKey} 
      />
    </div>
  );
};

const HealthStatCard = ({ label, value, color, icon, className = "" }) => (
  <div className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between ${className}`}>
    <div className="min-w-0">
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
      <p className={`text-xl md:text-2xl font-black ${color}`}>{value}</p>
    </div>
    <div className={`p-3 bg-slate-50 rounded-xl ${color}`}>{icon}</div>
  </div>
);

export default VehicleHealth;