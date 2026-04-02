import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../supabaseClient';
import { useVehicleData } from '../../hooks/useVehicleData'; 
import { useEmergency } from '../../hooks/useEmergency'; 
import { 
  AlertTriangle, Play, Square, AlertCircle, CheckCircle,
  HeartPulse, CarFront, Wrench, ShieldAlert, X, Loader2,
  Thermometer, Battery, Fuel as FuelIcon, MapPin, Navigation, Gauge, Activity
} from 'lucide-react';

import { calculateDistance, ROUTE_FORWARD, ROUTE_RETURN } from '../../config/routeConfig';
import { VEHICLE_THRESHOLDS, getStatusColor, isMilActive } from '../../config/thresholds';
import 'leaflet/dist/leaflet.css';

// --- MAP ASSETS ---
const VehicleIcon = L.divIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="width: 22px; height: 22px; background: #007bff; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

const DriverDashboard = () => {
  const VEHICLE_ID = "V-101"; 
  const { vehicleData, isLoading, setVehicleData } = useVehicleData(VEHICLE_ID);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const {
    showSosOverlay,
    setShowSosOverlay,
    sosStep,
    setSosStep,
    selectedSosType,
    openSosMenu,
    handleSelectReason,
    confirmSendSos
  } = useEmergency(VEHICLE_ID);

  // Connection/Ignition logic
  const isDeviceActive = vehicleData?.activity === 'Active' || vehicleData?.activity === 'System Operational';

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const routeInfo = useMemo(() => {
    const currentAddr = vehicleData?.current_address || "LOCATING...";
    const nextAddr = vehicleData?.next_address || "READY";
    let dist = "0.00";
    if (vehicleData?.lat && !currentAddr.includes("OUT")) {
        const direction = vehicleData?.trip_direction || 'Forward';
        const activeRoute = direction === 'Return' ? ROUTE_RETURN : ROUTE_FORWARD;
        const nextStop = activeRoute.find(stop => stop.name === nextAddr) || activeRoute[0];
        if (nextStop) dist = calculateDistance(vehicleData.lat, vehicleData.lng, nextStop.lat, nextStop.lng).toFixed(2);
    }
    return { current: currentAddr, next: nextAddr, distance: dist };
  }, [vehicleData]);

  const toggleTrip = async () => {
    const nextAct = vehicleData?.activity === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase.from('vehicles').update({ activity: nextAct }).eq('id', VEHICLE_ID);
    if (!error) setVehicleData(prev => ({ ...prev, activity: nextAct }));
  };

  if (isLoading) return (
    <div className="h-screen w-screen bg-[#050810] flex items-center justify-center font-sans text-white">
      <Loader2 className="text-cyan-500 animate-spin mr-3" size={32} />
      <span className="uppercase font-black tracking-widest text-xs">Syncing...</span>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#0B101E] text-white overflow-hidden flex flex-col font-sans">
      
      {/* 1. TOP TELEMETRY BAR - Mapped to thresholds.js */}
      <div className="grid grid-cols-6 gap-2 p-2 h-[90px] shrink-0 border-b border-slate-800 bg-slate-900/50">
        <MetricCard 
            icon={<Gauge size={18}/>} 
            value={isDeviceActive ? Math.round(vehicleData?.speed || 0) : "--"} 
            unit="KM/H" 
          color={isDeviceActive ? getStatusColor(vehicleData?.speed, 'SPEED') : "text-slate-600"} 
        />
        <MetricCard 
            icon={<Activity size={18}/>} 
            value={isDeviceActive ? (vehicleData?.rpm || 0) : "--"} 
            unit="RPM" 
          color={isDeviceActive ? getStatusColor(vehicleData?.rpm, 'RPM') : "text-slate-600"} 
        />
        <MetricCard 
            icon={<Thermometer size={18}/>} 
            value={isDeviceActive ? (vehicleData?.temp ?? '--') : "--"} 
            unit="°C" 
            color={isDeviceActive ? getStatusColor(vehicleData?.temp, 'TEMP') : "text-slate-600"} 
        />
        <MetricCard 
            icon={<Battery size={18}/>} 
            value={isDeviceActive ? (vehicleData?.battery ?? '--') : "--"} 
            unit="VOLTS" 
            color={isDeviceActive ? getStatusColor(vehicleData?.battery, 'BATTERY') : "text-slate-600"} 
        />
        <MetricCard 
            icon={<FuelIcon size={18}/>} 
            value={isDeviceActive ? (vehicleData?.fuel ?? '--') : "--"} 
            unit="%" 
            color={isDeviceActive ? getStatusColor(vehicleData?.fuel, 'FUEL') : "text-slate-600"} 
        />
        <MetricCard 
          icon={<AlertCircle size={18}/>} 
          value={isDeviceActive ? (isMilActive(vehicleData?.mil) ? "ERR" : "OK") : "--"} 
          unit={isDeviceActive ? (isMilActive(vehicleData?.mil) ? "CHECK ENGINE" : "HEALTHY") : "INACTIVE"} 
          color={isDeviceActive ? getStatusColor(vehicleData?.mil, 'MIL') : "text-slate-600"} 
        />
      </div>

      {/* 2. MAIN CONTENT (Map & Nav) */}
      <div className="flex-1 flex p-2 gap-2 min-h-0">
        <div className="flex-[1.6] rounded-xl overflow-hidden border border-slate-700 relative z-10 shadow-2xl">
          <MapContainer 
            center={[vehicleData?.lat || 14.5995, vehicleData?.lng || 120.9842]} 
            zoom={16} 
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {vehicleData?.lat && vehicleData?.lng && (
              <>
                <Marker position={[vehicleData.lat, vehicleData.lng]} icon={VehicleIcon} />
                <RecenterMap lat={vehicleData.lat} lng={vehicleData.lng} />
              </>
            )}
          </MapContainer>

          {/* Clock & Status Overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-[#121827]/90 backdrop-blur border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full ${vehicleData?.activity === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            {vehicleData?.activity || 'INACTIVE'}
          </div>

          <div className="absolute bottom-3 right-3 z-[1000] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl">
            <span className="font-mono text-lg font-black tracking-widest text-white">
                {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
            </span>
          </div>
        </div>

        {/* 3. RIGHT PANEL */}
        <div className="flex-[1] flex flex-col gap-2">
          <div className="bg-[#121827]/90 border border-slate-800 p-3 rounded-xl flex-1 flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <LabelValue label="CURRENT LOCATION" value={isDeviceActive ? routeInfo.current : "---"} icon={<MapPin size={12} className="text-emerald-500"/>} />
              <LabelValue label="NEXT STOP" value={isDeviceActive ? routeInfo.next : "---"} icon={<Navigation size={12} className="text-amber-500"/>} />
            </div>
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">DISTANCE</p>
              <p className="text-3xl font-black text-cyan-400 tabular-nums">
                {isDeviceActive ? routeInfo.distance : "--"} <span className="text-xs text-slate-500 uppercase">km</span>
              </p>
            </div>
          </div>

          <button onClick={toggleTrip} className={`h-[75px] rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${vehicleData?.activity === 'Active' ? 'bg-red-950/30 border-red-900 text-red-500' : 'bg-emerald-950/30 border-emerald-900 text-emerald-500'}`}>
            {vehicleData?.activity === 'Active' ? <Square fill="currentColor" size={20}/> : <Play fill="currentColor" size={20}/>}
            <span className="text-[10px] font-black tracking-[0.2em] mt-1 uppercase">{vehicleData?.activity === 'Active' ? 'END TRIP' : 'START TRIP'}</span>
          </button>

          <button onClick={openSosMenu} className="h-[55px] bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <AlertTriangle size={18} className="text-white fill-white/20"/>
            <span className="font-black text-sm tracking-tighter uppercase">SOS Emergency</span>
          </button>
        </div>
      </div>

      {showSosOverlay && <SosOverlayUI step={sosStep} setSosStep={setSosStep} selectedSosType={selectedSosType} handleSelectReason={handleSelectReason} confirmSendSos={confirmSendSos} onClose={() => setShowSosOverlay(false)} />}
    </div>
  );
};

// Internal Components
const MetricCard = ({ icon, value, unit, color }) => (
  <div className="bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-1 overflow-hidden">
    <div className="text-slate-500 mb-0.5">{icon}</div>
    <div className={`text-2xl font-black tabular-nums leading-none transition-colors duration-500 ${color}`}>{value}</div>
    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center whitespace-nowrap">{unit}</div>
  </div>
);

const LabelValue = ({ label, value, icon }) => (
  <div>
    <p className="text-[8px] font-black text-slate-500 tracking-[0.2em] flex items-center gap-1.5 mb-0.5 uppercase">{icon} {label}</p>
    <p className="text-xs font-bold text-white leading-tight uppercase truncate">{value}</p>
  </div>
);

const SosOverlayUI = ({ step, setSosStep, selectedSosType, handleSelectReason, confirmSendSos, onClose }) => (
    <div className="absolute inset-0 z-[2000] bg-black/95 backdrop-blur-md flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
      {step === 'MENU' && (
        <>
          <div className="flex justify-between items-center mb-6 text-white">
            <h2 className="text-2xl font-black text-red-500 uppercase italic tracking-tighter flex items-center gap-3"><AlertTriangle size={32} className="animate-pulse" /> Select Emergency</h2>
            <button onClick={onClose} className="p-3 bg-slate-800 rounded-full"><X size={24}/></button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <SosOption icon={<HeartPulse size={40}/>} label="Medical" color="red" onClick={() => handleSelectReason('Medical', 'Critical', 'text-red-500')} />
            <SosOption icon={<CarFront size={40}/>} label="Accident" color="orange" onClick={() => handleSelectReason('Accident', 'Critical', 'text-orange-500')} />
            <SosOption icon={<Wrench size={40}/>} label="Breakdown" color="amber" onClick={() => handleSelectReason('Breakdown', 'Warning', 'text-amber-500')} />
            <SosOption icon={<ShieldAlert size={40}/>} label="Security" color="blue" onClick={() => handleSelectReason('Security', 'Critical', 'text-blue-500')} />
          </div>
        </>
      )}
      {step === 'CONFIRM' && (
         <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-black text-white mb-2 tracking-widest uppercase">Confirm Distress Signal?</h3>
            <p className={`mb-8 uppercase text-sm font-bold ${selectedSosType?.colorClass}`}>{selectedSosType?.reason}</p>
            <div className="flex gap-4">
              <button onClick={() => setSosStep('MENU')} className="px-8 py-4 bg-slate-800 rounded-xl font-black uppercase text-xs">Back</button>
              <button onClick={confirmSendSos} className="px-8 py-4 bg-red-600 rounded-xl font-black uppercase text-xs shadow-lg">Confirm</button>
            </div>
         </div>
      )}
      {step === 'SENDING' && (
         <div className="flex-1 flex flex-col items-center justify-center"><Loader2 size={64} className="text-red-500 animate-spin mb-4" /><h2 className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Broadcasting...</h2></div>
      )}
      {step === 'SUCCESS' && (
         <div className="flex-1 flex flex-col items-center justify-center text-center"><CheckCircle size={80} className="text-green-500 mb-6" /><h2 className="text-2xl font-black text-green-400 uppercase tracking-widest">Signal Received</h2><p className="text-green-600 font-bold uppercase tracking-tighter">HQ has been notified</p></div>
      )}
    </div>
  );
  
  const SosOption = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} className={`bg-${color}-950/20 border-2 border-${color}-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all group`}>
      <span className={`text-${color}-500 group-hover:scale-110 transition-transform`}>{icon}</span>
      <span className={`text-lg font-black uppercase tracking-widest text-${color}-500`}>{label}</span>
    </button>
  );

export default DriverDashboard;