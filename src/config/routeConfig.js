import { supabase } from '../supabaseClient';
import pandacanRouteData from '../data/pandacanRoute.json';

export const ROUTE_FORWARD = pandacanRouteData.slice(0, 33); 
export const ROUTE_RETURN = pandacanRouteData.slice(33);

// --- CONFIGURATION ---
const DEVIATION_THRESHOLD_KM = 0.5; // 500 meters allowed before "Out of Route"
const BOUNDARY_MAX_KM = 2.0;       // 2km allowed before "Out of Boundary"

/**
 * Standard Haversine formula for distance calculation
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2 || !lon1 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(3));
};

/**
 * Synchronizes the human-readable address and checks for route deviation
 */
export const syncVehicleAddress = async (vehicleId) => {
  if (!vehicleId) return;

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('lat, lng, trip_direction, activity')
    .eq('id', vehicleId)
    .single();

  if (error || !vehicle || !vehicle.lat) return;

  const activeRoute = vehicle.trip_direction === 'Return' ? ROUTE_RETURN : ROUTE_FORWARD;

  // 1. Calculate distances to all points in the active route
  const pointsWithDistance = activeRoute.map((stop, index) => ({
    ...stop,
    index,
    dist: calculateDistance(vehicle.lat, vehicle.lng, stop.lat, stop.lng)
  }));

  // Sort by closest distance
  const sortedPoints = pointsWithDistance.sort((a, b) => a.dist - b.dist);
  const closest = sortedPoints[0];
  
  let currentAddress = closest.name;
  let nextAddress = "";
  let isDeviated = false;

  // 2. DEVIATION LOGIC
  // If the closest point is further than the threshold, the vehicle is off-track
  if (closest.dist > BOUNDARY_MAX_KM) {
    currentAddress = "OUT OF BOUNDARY";
    nextAddress = "RE-ENTRY REQUIRED";
    isDeviated = true;
  } else if (closest.dist > DEVIATION_THRESHOLD_KM) {
    currentAddress = "OUT OF ROUTE";
    nextAddress = `NEAREST: ${closest.name}`;
    isDeviated = true;
  } else {
    // 3. Normal Routing
    let nextIndex = closest.index + 1;
    nextAddress = nextIndex < activeRoute.length 
      ? activeRoute[nextIndex].name 
      : (vehicle.trip_direction === 'Return' ? "Pandacan Cooperative" : "Leon Guinto Terminal");
  }

  // 4. Update Supabase
  // We update current_address and potentially a 'status' or 'is_deviated' flag if you have one
  await supabase
    .from('vehicles')
    .update({ 
      current_address: currentAddress,
      next_address: nextAddress,
      // If you have a status column for tracking health + route
      status: (isDeviated && vehicle.activity === 'Active') ? 'Warning' : vehicle.status 
    })
    .eq('id', vehicleId);
    
  return { currentAddress, nextAddress, direction: vehicle.trip_direction, isDeviated };
};