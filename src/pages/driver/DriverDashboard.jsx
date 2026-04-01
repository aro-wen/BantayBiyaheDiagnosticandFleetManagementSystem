import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { useVehicleData } from '../../hooks/useVehicleData'; 
import { 
  AlertTriangle, Play, Square, AlertOctagon, CheckCircle,
  CarFront, HeartPulse, Wrench, ShieldAlert, X, Loader2,
  Thermometer, Battery, Fuel as FuelIcon, MapPin, Truck
} from 'lucide-react';

import { calculateDistance, ROUTE_FORWARD, ROUTE_RETURN } from '../../config/routeConfig';
import { VEHICLE_THRESHOLDS, getStatusColor, isMilActive } from '../../config/thresholds';

const DriverDashboard = () => {
  const VEHICLE_ID = "V-101"; 

  // --- 1. DATA & HOOKS ---
  const { vehicleData, isLoading, setVehicleData } = useVehicleData(VEHICLE_ID);
  const [currentTime, setCurrentTime] = useState(new Date());

  // SOS State
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [sosStep, setSosStep] = useState('MENU');
  const [selectedSosType, setSelectedSosType] = useState(null);

  // --- 2. CLOCK & AUTO-RESET ---
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // --- 3. AUTO-IGNITION LOGIC ---
  const isIgnited = vehicleData?.activity === 'System Operational' || vehicleData?.activity === 'Active';

  // --- 4. ROUTE LOGIC ---
  const routeInfo = useMemo(() => {
    const currentAddr = vehicleData?.current_address || "SYNCING...";
    const nextAddr = vehicleData?.next_address || "READY";
    
    const isOutOfBounds = currentAddr === "OUT OF BOUNDARY";
    const isDeviated = currentAddr === "OUT OF ROUTE" || isOutOfBounds;

    let distDisplay = "0.00";
    
    if (!isOutOfBounds) {
      const direction = vehicleData?.trip_direction || 'Forward';
      const activeRoute = direction === 'Return' ? ROUTE_RETURN : ROUTE_FORWARD;
      const nextStop = activeRoute.find(stop => stop.name === nextAddr) || activeRoute[0];

      if (vehicleData?.lat && nextStop) {
        distDisplay = calculateDistance(
          vehicleData.lat, 
          vehicleData.lng, 
          nextStop.lat, 
          nextStop.lng
        ).toFixed(2);
      }
    } else {
      distDisplay = "---";
    }

    return {
      current: currentAddr,
      next: nextAddr,
      distance: distDisplay,
      direction: vehicleData?.trip_direction || 'Forward',
      isDeviated: isDeviated,
      isOutOfBounds: isOutOfBounds
    };
  }, [vehicleData?.current_address, vehicleData?.next_address, vehicleData?.lat, vehicleData?.lng]);

  // --- 5. ACTIONS ---
  const toggleTrip = async () => {
    if (vehicleData?.activity === 'Under Maintenance') return; 
    const nextActivity = vehicleData?.activity === 'Active' ? 'System Operational' : 'Active';
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ activity: nextActivity })
        .eq('id', VEHICLE_ID);

      if (error) throw error;
      setVehicleData(prev => ({ ...prev, activity: nextActivity }));
    } catch (err) {
      console.error("DB Error:", err.message);
    }
  };

  const confirmSendSos = async () => {
    if (!selectedSosType) return;
    setSosStep('SENDING');
    const { error } = await supabase.from('alerts').insert({
      vehicle: VEHICLE_ID,
      message: `SOS: ${selectedSosType.reason.toUpperCase()}`, 
      type: 'Critical',
      status: 'Unread'
    });

    if (!error) {
      setSosStep('SUCCESS');
      setTimeout(() => { 
        setShowSosOverlay(false); 
        setSosStep('MENU'); 
      }, 2000);
    }
  };

  // --- 6. GAUGE COMPONENT ---
  const RPMGauge = ({ rpm }) => {
    const T = VEHICLE_THRESHOLDS.RPM;
    const percentage = Math.min((rpm || 0) / (T.MAX + 1000), 1);
    const rotation = -100 + (percentage * 200); 
    const isWarning = (rpm || 0) >= T.WARNING;

    return (
      <div className="relative w-full h-[12vh] min-h-[55px] flex justify-center items-end overflow-hidden pt-1">
          <svg className="absolute w-[95%] h-[200%] top-0" viewBox="0 0 100 50">
            <path d="M 5 45 A 45 35 0 0 1 95 45" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            <path d="M 5 45 A 45 35 0 0 1 95 45" fill="none" stroke={isWarning ? "#ef4444" : "#22d3ee"} strokeWidth="8" strokeDasharray="135" strokeDashoffset={135 - (135 * percentage)} strokeLinecap="round" className="transition-all duration-500" />
          </svg>
          <div className="absolute bottom-[4px] w-full h-full flex justify-center transition-transform duration-500" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50% 100%' }}>
            <div className={`w-[4px] h-full shadow-lg ${isWarning ? 'bg-red-500 shadow-red-500/50' : 'bg-slate-100'}`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </div>
          <div className="absolute bottom-[-3px] w-[8%] aspect-square bg-slate-400 rounded-full border-2 border-slate-900 z-20 shadow-lg" />
      </div>
    );
  };

  // --- 7. RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={48} />
        <p className="text-slate-500 text-[10px] font-bold uppercase mt-4 tracking-widest text-center italic">
          Syncing Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden flex flex-col p-[1vh] select-none relative">
      
      {!isIgnited && (
        <div className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                <Truck size={48} className="text-slate-700 animate-pulse" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 italic">OBD-II STANDBY</h2>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-2 italic">Waiting for vehicle signal...</p>
        </div>
      )}

      {/* MAIN DASHBOARD - FIXED CSS CONDITION */}
      <div className={`flex-1 rounded-xl border flex flex-col gap-1 p-1 shadow-2xl transition-all duration-700 ${
        isIgnited 
        ? 'bg-slate-900/40 border-slate-700 grayscale-0 brightness-100' 
        : 'bg-slate-950/40 border-slate-800 grayscale brightness-75'
      }`}>
        
        {/* ROW 1: SPEED & RPM */}
        <div className="flex-[2] grid grid-cols-2 gap-1">
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center p-1 relative overflow-hidden">
            <h1 className={`text-[clamp(3rem,14vh,7.5rem)] font-black leading-none tabular-nums tracking-tighter ${vehicleData?.speed >= VEHICLE_THRESHOLDS.SPEED.WARNING ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {Math.round(vehicleData?.speed || 0)}
            </h1>
            <span className="text-cyan-400 text-[9px] font-bold tracking-widest uppercase -mt-1">KM/H</span>
          </div>

          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center pt-2">
            <RPMGauge rpm={vehicleData?.rpm} />
            <div className={`text-[clamp(1.2rem,4vh,2.2rem)] font-black mt-1 tabular-nums ${vehicleData?.rpm >= VEHICLE_THRESHOLDS.RPM.WARNING ? 'text-red-500' : 'text-white'}`}>{vehicleData?.rpm || 0}</div>
            <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">RPM</span>
          </div>
        </div>

        {/* ROW 2: TELEMETRY */}
        <div className="flex-[0.5] grid grid-cols-3 gap-1">
          <div className="bg-slate-900/50 rounded-lg flex items-center justify-between px-3 border border-white/5">
            <Thermometer size={14} className="text-slate-500"/>
            <span className={`text-xs font-black tabular-nums ${getStatusColor(vehicleData?.temp, 'TEMP')}`}>
              {vehicleData?.temp !== null && vehicleData?.temp !== undefined ? `${vehicleData.temp}°` : '---'}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-lg flex items-center justify-between px-3 border border-white/5">
            <Battery size={14} className="text-slate-500"/>
            <span className={`text-xs font-black tabular-nums ${getStatusColor(vehicleData?.battery, 'BATTERY')}`}>
              {vehicleData?.battery !== null && vehicleData?.battery !== undefined ? `${vehicleData.battery}V` : '---'}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-lg flex items-center justify-between px-3 border border-white/5">
            <FuelIcon size={14} className="text-slate-500"/>
            <span className={`text-xs font-black tabular-nums ${getStatusColor(vehicleData?.fuel, 'FUEL')}`}>
              {vehicleData?.fuel !== null && vehicleData?.fuel !== undefined ? `${vehicleData.fuel}%` : '---'}
            </span>
          </div>
        </div>

        {/* ROW 3: POSITION & MIL */}
        <div className="flex-[1.2] grid grid-cols-2 gap-1">
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 p-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-1">
              <MapPin size={12} className="text-cyan-500"/>
              <span className="text-[10px] font-black uppercase text-slate-100 truncate">{routeInfo.current}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[7px] font-black text-amber-500 uppercase">Next Stop</p>
                <p className="text-[9px] font-bold text-slate-400 truncate uppercase max-w-[110px]">{routeInfo.next}</p>
              </div>
              <div className="text-[1.8rem] font-mono font-black text-amber-500 tabular-nums">{routeInfo.distance} <span className="text-[8px] text-slate-500">KM</span></div>
            </div>
          </div>
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex items-center justify-center">
            {isMilActive(vehicleData?.mil) ? (
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <AlertOctagon size={24} /><span className="text-[10px] font-black uppercase tracking-tighter">Check Engine</span>
              </div>
            ) : (
              <div className="text-green-500 flex items-center gap-2">
                <CheckCircle size={24} /><div className="flex flex-col"><span className="text-[10px] font-black uppercase leading-none">System</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Healthy</span></div>
              </div>
            )}
          </div>
        </div>

        {/* ROW 4: ACTIONS */}
        <div className="flex-[0.6] grid grid-cols-2 gap-1">
          <button 
            disabled={vehicleData?.activity === 'Under Maintenance'}
            onClick={toggleTrip} 
            className={`rounded-lg flex items-center justify-center gap-2 font-black uppercase text-[10px] border transition-all active:scale-95 
            ${vehicleData?.activity === 'Active' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-green-600/20 text-green-500 border-green-500/50'}`}
          >
            {vehicleData?.activity === 'Active' ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
            {vehicleData?.activity === 'Active' ? 'End Trip' : 'Start Trip'}
          </button>
          <button onClick={() => setShowSosOverlay(true)} className="bg-red-600 rounded-lg flex items-center justify-center gap-2 font-black uppercase text-[10px] shadow-lg active:scale-95">
            <AlertTriangle size={12} /> SOS Emergency
          </button>
        </div>
      </div>

      {/* SOS OVERLAY */}
      {showSosOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm p-3 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Emergency Alert</h2>
            <button onClick={() => { setShowSosOverlay(false); setSosStep('MENU'); }} className="p-2 bg-slate-800 rounded-full text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
              <button onClick={() => { setSelectedSosType({reason: 'Accident'}); confirmSendSos(); }} className="bg-red-600/20 border border-red-500 rounded-xl flex flex-col items-center justify-center gap-1 active:bg-red-600">
                <CarFront size={32} className="text-red-500" /><span className="text-[12px] font-black uppercase text-red-500">Accident</span>
              </button>
              <button onClick={() => { setSelectedSosType({reason: 'Medical'}); confirmSendSos(); }} className="bg-rose-600/20 border border-rose-500 rounded-xl flex flex-col items-center justify-center gap-1 active:bg-rose-600">
                <HeartPulse size={32} className="text-rose-500" /><span className="text-[12px] font-black uppercase text-rose-500">Medical</span>
              </button>
              <button onClick={() => { setSelectedSosType({reason: 'Breakdown'}); confirmSendSos(); }} className="bg-amber-600/20 border border-amber-500 rounded-xl flex flex-col items-center justify-center gap-1 active:bg-amber-600">
                <Wrench size={32} className="text-amber-500" /><span className="text-[12px] font-black uppercase text-amber-500">Breakdown</span>
              </button>
              <button onClick={() => { setSelectedSosType({reason: 'Threat'}); confirmSendSos(); }} className="bg-slate-700/40 border border-slate-500 rounded-xl flex flex-col items-center justify-center gap-1 active:bg-slate-500">
                <ShieldAlert size={32} className="text-slate-300" /><span className="text-[12px] font-black uppercase text-slate-300">Security</span>
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;