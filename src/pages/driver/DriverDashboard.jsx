import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  AlertTriangle, Play, Square, AlertOctagon, CheckCircle,
  CarFront, HeartPulse, Wrench, ShieldAlert, X, ArrowLeft, MapPin, Loader2 
} from 'lucide-react';

// Hooks & Config
import { calculateDistance, PANDACAN_ROUTE } from '../../config/routeConfig'; 
import { VEHICLE_THRESHOLDS, getStatusColor, isMilActive } from '../../config/thresholds'; 

const DriverDashboard = () => {
  const VEHICLE_ID = "V-101"; 

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState({ 
    speed: 0, rpm: 0, temp: 85, battery: 12.8, fuel: 65, mil: 'OFF', 
    current_address: "Searching...", next_address: "Loading Route...", lat: null, lng: null,
    activity: 'Inactive' 
  });
  
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [sosStep, setSosStep] = useState('MENU'); 
  const [selectedSosType, setSelectedSosType] = useState(null);

  // --- LOGIC: SUPABASE SYNC ---
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLatest();

    const channel = supabase.channel('telemetry')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' }, (payload) => {
          if (payload.new.id === VEHICLE_ID) {
            setVehicleData(prev => ({...prev, ...payload.new}));
            setIsTripActive(payload.new.activity === 'Active');
          }
      })
      .subscribe();

    return () => { 
      clearInterval(clockInterval); 
      supabase.removeChannel(channel); 
    };
  }, []);

  const fetchLatest = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('vehicles').select('*').eq('id', VEHICLE_ID).single();
    if (data) {
      setVehicleData(data);
      setIsTripActive(data.activity === 'Active');
    }
    setIsLoading(false);
  };

  const toggleTrip = async () => {
    if (vehicleData.activity === 'Under Maintenance') return;
    const nextActivity = !isTripActive ? 'Active' : 'Inactive';
    setIsTripActive(!isTripActive);
    await supabase.from('vehicles').update({ activity: nextActivity }).eq('id', VEHICLE_ID);
  };

  const distToNext = useMemo(() => {
    if (!vehicleData.lat || !vehicleData.lng || !vehicleData.next_address || vehicleData.next_address === "END OF ROUTE") return "0.00";
    const target = PANDACAN_ROUTE.find(s => s.name === vehicleData.next_address);
    return target ? calculateDistance(vehicleData.lat, vehicleData.lng, target.lat, target.lng).toFixed(2) : "0.00";
  }, [vehicleData.lat, vehicleData.lng, vehicleData.next_address]);

  // --- UI HELPERS ---
  const RPMGauge = ({ rpm }) => {
    const percentage = Math.min(rpm / (VEHICLE_THRESHOLDS.RPM.MAX + 1000), 1);
    const rotation = -90 + (percentage * 180); 
    const isRed = rpm >= VEHICLE_THRESHOLDS.RPM.MAX;
    return (
      <div className="relative w-full h-[12vh] overflow-hidden flex justify-center items-end">
         <div className="absolute w-[75%] aspect-square rounded-full border-[6px] border-slate-800 border-b-0 top-0"></div>
         <svg className="absolute w-[75%] aspect-square top-0" viewBox="0 0 100 100">
             <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isRed ? "#ef4444" : "#22d3ee"} strokeWidth="10" strokeDasharray="126" strokeDashoffset={126 - (126 * percentage)} strokeLinecap="round" className="transition-all duration-300"/>
         </svg>
         <div className={`absolute bottom-0 w-[2px] h-[100%] origin-bottom transition-transform duration-300 ${isRed ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white'}`} style={{ transform: `rotate(${rotation}deg)` }}></div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden flex flex-col p-[1vh] select-none">
      <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800/40 flex flex-col gap-1 p-1">
        
        {/* ROW 1: PRIMARY GAUGE ZONE */}
        <div className="flex-[2] grid grid-cols-2 gap-1">
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center p-1">
            <h1 className="text-[clamp(3.5rem,14vh,7rem)] font-black leading-none tabular-nums tracking-tighter">
              {Math.round(vehicleData.speed)}
            </h1>
            <span className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase -mt-2">KM/H</span>
            <div className="flex gap-1 h-[2.5vh] mt-2 w-[90%]">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm skew-x-[-12deg] ${i < (vehicleData.speed/160)*15 ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
          
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex flex-col items-center justify-center">
            <RPMGauge rpm={vehicleData.rpm} />
            <div className={`text-[clamp(1.2rem,3.5vh,2rem)] font-black tabular-nums ${vehicleData.rpm >= VEHICLE_THRESHOLDS.RPM.WARNING ? 'text-red-500' : 'text-white'}`}>
              {vehicleData.rpm}
            </div>
            <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">RPM</span>
          </div>
        </div>

        {/* ROW 2: MINI TELEMETRY (Slimmed for 480px height) */}
        <div className="flex-[0.5] grid grid-cols-3 gap-1">
          {['temp', 'battery', 'fuel'].map((k) => (
            <div key={k} className="bg-slate-900/40 rounded-lg flex items-center justify-between px-3">
              <span className="text-slate-500 text-[8px] font-black uppercase">{k}</span>
              <span className={`text-xs font-black tabular-nums ${getStatusColor(vehicleData[k], k.toUpperCase())}`}>
                {vehicleData[k]}{k === 'temp' ? '°' : k === 'fuel' ? '%' : 'V'}
              </span>
            </div>
          ))}
        </div>

        {/* ROW 3: POSITION & SYSTEM */}
        <div className="flex-[1.2] grid grid-cols-2 gap-1">
          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 p-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-0.5 border-b border-white/5 pb-0.5">
              <CheckCircle size={10} className="text-cyan-500"/>
              <span className="text-[10px] font-black uppercase truncate text-slate-100">
                {isLoading ? "SYNC..." : (vehicleData.current_address || "SEARCHING...")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="min-w-0">
                <p className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">Next Stop</p>
                <p className="text-[9px] font-bold text-slate-400 truncate uppercase">{vehicleData.next_address || "END ROUTE"}</p>
              </div>
              <div className="text-[1.8rem] font-mono font-black text-amber-500 tabular-nums">{distToNext} <span className="text-[8px] text-slate-500">KM</span></div>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-lg border border-slate-800/50 flex items-center justify-center gap-3">
            {isMilActive(vehicleData.mil) ? (
              <div className="text-red-500 animate-pulse flex items-center gap-2">
                <AlertOctagon size={24} />
                <span className="text-[10px] font-black uppercase">Check Engine</span>
              </div>
            ) : (
              <div className="text-green-500 flex items-center gap-2">
                <CheckCircle size={24} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase leading-none">System</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Operational</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROW 4: ACTION CONTROLS */}
        <div className="flex-[0.6] grid grid-cols-2 gap-1">
          <button onClick={toggleTrip} className={`rounded-lg flex items-center justify-center gap-2 font-black uppercase text-[10px] border ${isTripActive ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-green-900/20 text-green-400 border-green-500/50'}`}>
            {isTripActive ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
            {isTripActive ? 'End Trip' : 'Start Trip'}
          </button>
          <button onClick={() => setShowSosOverlay(true)} className="bg-red-600 rounded-lg flex items-center justify-center gap-2 font-black uppercase text-[10px] shadow-lg animate-pulse">
            <AlertTriangle size={12} /> SOS Emergency
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;