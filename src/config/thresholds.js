// src/config/thresholds.js

export const VEHICLE_THRESHOLDS = {
  RPM: { MAX: 7000, WARNING: 6000 },
  SPEED: { MAX: 140, WARNING: 100 },
  TEMP: { CRITICAL: 105, WARNING: 95 },
  
  // --- BATTERY (Volts) ---
  BATTERY: { 
    CRITICAL_LOW: 11.5, 
    WARNING_LOW: 11.8,   // Added to match SQL Trigger
    CRITICAL_HIGH: 15.5 
  },

  // --- FUEL CONSUMPTION ---
  FUEL: {
    IDLING: { // Speed <= 5 (L/h) - Higher is worse
      CRITICAL: 4.0,
      WARNING: 2.5,
    },
    MOVING: { // Speed > 5 (km/L) - Lower is worse
      CRITICAL: 4.0,
      WARNING: 6.0,
    }
  },

  MIL: {
    TRIGGER_VALUES: [true, 'ON', 'on', 'TRUE', 1, 'Check Engine', 'CHECK ENGINE'] 
  }
};

export const getStatusColor = (value, type, speed = 0) => {
  const T = VEHICLE_THRESHOLDS;

  switch (type) {
    case 'RPM':
      if (value >= T.RPM.MAX) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.RPM.WARNING) return 'text-orange-500 font-bold';
      return 'text-green-500 font-bold tracking-wider';

    case 'SPEED':
      if (value >= T.SPEED.MAX) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.SPEED.WARNING) return 'text-orange-500 font-bold';
      return 'text-green-500 font-bold tracking-wider';

    case 'TEMP':
      if (value >= T.TEMP.CRITICAL) return 'text-red-500 animate-pulse font-bold';
      if (value >= T.TEMP.WARNING) return 'text-orange-500';
      return 'text-green-500 font-bold tracking-wider'; 

    case 'BATTERY':
      // Updated to handle three states: Critical, Warning, and Normal
      if (value <= T.BATTERY.CRITICAL_LOW || value >= T.BATTERY.CRITICAL_HIGH) 
        return 'text-red-500 animate-pulse font-bold';
      if (value <= T.BATTERY.WARNING_LOW) 
        return 'text-orange-500 font-bold';
      return 'text-green-500 font-bold tracking-wider';

    case 'FUEL':
      if (speed <= 5) {
        if (value >= T.FUEL.IDLING.CRITICAL) return 'text-red-500 animate-pulse font-bold';
        if (value >= T.FUEL.IDLING.WARNING) return 'text-orange-500';
        return 'text-green-500 font-bold tracking-wider';
      } else {
        if (value <= T.FUEL.MOVING.CRITICAL) return 'text-red-500 animate-pulse font-bold';
        if (value <= T.FUEL.MOVING.WARNING) return 'text-orange-500';
        return 'text-green-500 font-bold tracking-wider';
      }

    case 'MIL':
      if (T.MIL.TRIGGER_VALUES.includes(value)) return 'text-amber-500 animate-pulse font-bold tracking-wider';
      return 'text-green-500 font-bold tracking-wider';

    default:
      return 'text-slate-200';
  }
};

export const isMilActive = (value) => {
  return VEHICLE_THRESHOLDS.MIL.TRIGGER_VALUES.includes(value);
};