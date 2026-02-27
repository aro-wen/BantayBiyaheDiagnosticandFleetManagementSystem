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
    activity: 'Inactive' // Initializing activity state
  });
  
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // SOS State Machine
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [sosStep, setSosStep] = useState('MENU'); 
  const [selectedSosType, setSelectedSosType] = useState(null);

  // --- LOGIC: DATA FETCHING & REAL-TIME UPDATES ---
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLatest();

    const channel = supabase.channel('driver-dashboard-telemetry')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' }, (payload) => {
          if (payload.new.id === VEHICLE_ID) {
            setVehicleData(prev => ({...prev, ...payload.new}));
            // Update local toggle state based on database 'activity' column
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
      // Ensure the button state matches the database activity on load
      setIsTripActive(data.activity === 'Active');
    }
    setIsLoading(false);
  };

  // --- UPDATED TRIP LOGIC (Uses 'activity' column) ---
  const toggleTrip = async () => {
    // Safety check: Prevent starting trip if vehicle is being serviced
    if (vehicleData.activity === 'Under Maintenance') {
      alert("Vehicle is currently Under Maintenance and cannot start a trip.");
      return;
    }

    const nextActivity = !isTripActive ? 'Active' : 'Inactive';
    
    // Optimistically update local UI
    setIsTripActive(!isTripActive);
    
    // Sync to Supabase 'activity' column
    const { error } = await supabase
      .from('vehicles')
      .update({ activity: nextActivity })
      .eq('id', VEHICLE_ID);

    if (error) {
      console.error("Database Update Error:", error.message);
      setIsTripActive(isTripActive); // Rollback on failure
    }
  };

  // --- DISTANCE TO NEXT STOP LOGIC ---
  const distToNext = useMemo(() => {
    if (!vehicleData.lat || !vehicleData.lng || !vehicleData.next_address || vehicleData.next_address === "END OF ROUTE") return "0.00";
    const target = PANDACAN_ROUTE.find(s => s.name === vehicleData.next_address);
    return target ? calculateDistance(vehicleData.lat, vehicleData.lng, target.lat, target.lng).toFixed(2) : "0.00";
  }, [vehicleData.lat, vehicleData.lng, vehicleData.next_address]);

  // --- SOS FUNCTIONS ---
  const openSosMenu = () => {
    setShowSosOverlay(true);
    setSosStep('MENU');
    setSelectedSosType(null);
  };

  const handleSelectReason = (reason, type = 'Critical') => {
    setSelectedSosType({ reason, type });
    setSosStep('CONFIRM');
  };

  const confirmSendSos = async () => {
    if (!selectedSosType) return;
    setSosStep('SENDING');
    const { error } = await supabase.from('alerts').insert({
      vehicle: VEHICLE_ID,
      message: `SOS: ${selectedSosType.reason.toUpperCase()}`, 
      type: selectedSosType.type,
      status: "Unread"
    });

    if (!error) {
      setSosStep('SUCCESS');
      setTimeout(() => {
        setShowSosOverlay(false);
        setSosStep('MENU');
      }, 2000);
    } else {
      setSosStep('MENU');
      alert("Failed to send SOS. Check connection.");
    }
  };

  // --- UI GAUGE HELPERS ---
  const renderSpeedBars = (speed) => {
    const totalBars = 20;
    const activeBars = Math.min(Math.floor((speed / VEHICLE_THRESHOLDS.SPEED.MAX) * totalBars), totalBars);
    return (
      <div className="flex gap-1 h-8 mt-4 w-full px-4">
        {[...Array(totalBars)].map((_, i) => (
          <div key={i} className={`flex-1 rounded-sm skew-x-[-12deg] transition-all duration-100 ${i < activeBars ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`} />
        ))}
      </div>
    );
  };

  const RPMGauge = ({ rpm }) => {
    const maxRPM = VEHICLE_THRESHOLDS.RPM.MAX + 1000;
    const percentage = Math.min(rpm / maxRPM, 1);
    const rotation = -90 + (percentage * 180); 
    const isRedlining = rpm >= VEHICLE_THRESHOLDS.RPM.MAX;
    return (
      <div className="relative w-48 h-24 overflow-hidden flex justify-center items-end mb-2">
         <div className="absolute w-44 h-44 rounded-full border-[12px] border-slate-800 border-b-0 top-0"></div>
         <svg className="absolute w-44 h-44 top-0" viewBox="0 0 100 100">
             <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isRedlining ? "#ef4444" : "#22d3ee"} strokeWidth="12" strokeDasharray="126" strokeDashoffset={126 - (126 * percentage)} strokeLinecap="round" className="transition-all duration-300 ease-out"/>
         </svg>
         <div className={`absolute bottom-0 w-1 h-24 origin-bottom transition-transform duration-300 ease-out z-10 ${isRedlining ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-white'}`} style={{ transform: `rotate(${rotation}deg)` }}></div>
         <div className="absolute bottom-[-10px] w-4 h-4 bg-slate-200 rounded-full z-20"></div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-4 select-none relative">
      <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-700/50 shadow-2xl p-2 grid grid-rows-[3fr_1.5fr_1.8fr_1fr] gap-2 overflow-hidden">
        
        {/* ROW 1: SPEED & RPM */}
        <div className="grid grid-cols-2 gap-2 min-h-0">
          <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative p-2">
            <div className={`text-[120px] leading-none font-black tracking-tighter ${vehicleData.speed > VEHICLE_THRESHOLDS.SPEED.WARNING ? 'text-red-500' : 'text-white'}`}>
              {Math.round(vehicleData.speed)}
            </div>
            <div className={`font-bold uppercase text-lg mb-2 ${vehicleData.speed > VEHICLE_THRESHOLDS.SPEED.WARNING ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>KM/H</div>
            {renderSpeedBars(vehicleData.speed)}
          </div>
          <div className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center pt-8">
            <RPMGauge rpm={vehicleData.rpm} />
            <div className={`text-4xl font-bold mt-2 ${vehicleData.rpm >= VEHICLE_THRESHOLDS.RPM.WARNING ? 'text-red-500' : 'text-cyan-400'}`}>{vehicleData.rpm}</div>
            <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">RPM</div>
          </div>
        </div>

        {/* ROW 2: TELEMETRY */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
          {['temp', 'battery', 'fuel'].map((k) => (
            <div key={k} className="bg-black/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2 text-center">
              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">{k}</div>
              <div className={`text-3xl font-bold ${getStatusColor(vehicleData[k], k.toUpperCase())}`}>
                {vehicleData[k]}{k === 'temp' ? '°C' : k === 'fuel' ? '%' : 'V'}
              </div>
            </div>
          ))}
        </div>

        {/* ROW 3: LOCATION & DIAGNOSTIC  */}
        <div className="grid grid-cols-2 gap-2 min-h-0">
          <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col justify-center overflow-hidden">
            <div className="mb-2 border-b border-slate-800/50 pb-1">
              <div className="text-cyan-400 text-[10px] font-bold uppercase flex items-center gap-2"><CheckCircle size={12}/> Position</div>
              <div className="text-lg font-black truncate uppercase">
                {isLoading ? <Loader2 className="animate-spin" size={20}/> : (vehicleData.current_address || "SEARCHING...")}
              </div>
            </div>
            <div className="relative">
              <div className="text-amber-500 text-[10px] font-bold uppercase flex items-center gap-2"><MapPin size={12}/> Next Stop</div>
              <div className="text-md font-bold text-slate-200 truncate uppercase">{vehicleData.next_address || "END OF ROUTE"}</div>
              <div className="text-3xl font-mono font-black text-amber-500">{distToNext} <span className="text-sm font-sans text-slate-500">KM</span></div>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Diagnostic</div>
            {isMilActive(vehicleData.mil) ? (
                 <div className="flex flex-col items-center animate-pulse text-amber-500">
                    <AlertOctagon size={32} className="mb-1" />
                    <div className="font-bold">CHECK ENGINE</div>
                 </div>
            ) : (
                <div className="flex flex-col items-center text-green-500">
                    <CheckCircle size={32} className="mb-1" />
                    <div className="font-bold">SYSTEM OK</div>
                </div>
            )}
          </div>
        </div>

        {/* ROW 4: BUTTONS */}
        <div className="grid grid-cols-2 gap-2 min-h-0">
          <button 
            disabled={vehicleData.activity === 'Under Maintenance'}
            onClick={toggleTrip} 
            className={`rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest transition-all active:scale-95 
              ${vehicleData.activity === 'Under Maintenance' ? 'opacity-50 bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 
                isTripActive ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-green-900/20 text-green-400 border border-green-500/50 hover:bg-green-900/40'}`}
          >
            {isTripActive ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isTripActive ? 'End Trip' : 'Start Trip'}
          </button>
          <button onClick={openSosMenu} className="bg-red-600 text-white rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest shadow-lg animate-pulse active:scale-95 transition-all">
            <AlertTriangle size={24} /> SOS
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-4 mt-2 text-[10px] font-mono text-slate-600 uppercase">
        <div>HUD V1.7.0 • BANTAY BIYAHE</div>
        <div>{currentTime.toLocaleTimeString()}</div>
      </div>

      {/* SOS OVERLAY (same as original) */}
      {showSosOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in duration-200">
          {sosStep === 'MENU' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Select Emergency</h2>
                <button onClick={() => setShowSosOverlay(false)} className="p-3 bg-slate-800 rounded-full text-slate-400"><X size={32} /></button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
                <button onClick={() => handleSelectReason('Accident')} className="bg-red-600 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95"><CarFront size={64} className="text-white" /><span className="text-2xl font-black uppercase text-white">Accident</span></button>
                <button onClick={() => handleSelectReason('Medical')} className="bg-rose-500 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95"><HeartPulse size={64} className="text-white" /><span className="text-2xl font-black uppercase text-white">Medical</span></button>
                <button onClick={() => handleSelectReason('Breakdown')} className="bg-orange-500 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95"><Wrench size={64} className="text-white" /><span className="text-2xl font-black uppercase text-white">Breakdown</span></button>
                <button onClick={() => handleSelectReason('Threat')} className="bg-slate-800 border-2 border-slate-600 rounded-3xl flex flex-col items-center justify-center gap-4 active:scale-95"><ShieldAlert size={64} className="text-white" /><span className="text-2xl font-black uppercase text-white">Threat</span></button>
              </div>
              <button onClick={() => setShowSosOverlay(false)} className="w-full py-6 bg-slate-900 border border-slate-700 rounded-2xl text-xl font-bold text-slate-400 uppercase">Cancel Request</button>
            </>
          )}

          {sosStep === 'CONFIRM' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-300">
              <div className="bg-red-900/30 p-8 rounded-full mb-4"><AlertTriangle size={80} className="text-red-500 animate-bounce" /></div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight">{selectedSosType?.reason}</h2>
              <div className="w-full space-y-4">
                <button onClick={confirmSendSos} className="w-full py-8 bg-red-600 rounded-3xl text-3xl font-black text-white uppercase tracking-widest shadow-2xl transition-all">Confirm Send</button>
                <button onClick={() => setSosStep('MENU')} className="w-full py-6 bg-slate-800 rounded-3xl text-xl font-bold text-slate-300 uppercase flex items-center justify-center gap-2"><ArrowLeft size={24} /> Go Back</button>
              </div>
            </div>
          )}

          {(sosStep === 'SENDING' || sosStep === 'SUCCESS') && (
            <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center animate-in fade-in">
              {sosStep === 'SENDING' ? (
                <><Loader2 size={80} className="text-white animate-spin mb-4" /><h2 className="text-4xl font-black text-white uppercase animate-pulse">Sending...</h2></>
              ) : (
                <><CheckCircle size={100} className="text-green-500 mb-4 animate-in zoom-in" /><h2 className="text-4xl font-black text-green-500 uppercase">Alert Sent</h2></>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;