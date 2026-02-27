import { useState } from 'react';
import { supabase } from '../supabaseClient';

export const useEmergency = (vehicleId) => {
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [sosStep, setSosStep] = useState('MENU'); // 'MENU', 'CONFIRM', 'SENDING', 'SUCCESS'
  const [selectedSosType, setSelectedSosType] = useState(null);

  const openSosMenu = () => {
    setShowSosOverlay(true);
    setSosStep('MENU');
    setSelectedSosType(null);
  };

  const handleSelectReason = (reason, type, colorClass) => {
    setSelectedSosType({ reason, type, colorClass });
    setSosStep('CONFIRM');
  };

  const confirmSendSos = async () => {
    if (!selectedSosType) return;
    setSosStep('SENDING');

    const { error } = await supabase
      .from('alerts')
      .insert([
        {
          vehicle: vehicleId,
          message: `SOS: ${selectedSosType.reason.toUpperCase()}`,
          type: selectedSosType.type,
          status: "Unread"
        }
      ]);

    if (!error) {
      setSosStep('SUCCESS');
      setTimeout(() => {
        setShowSosOverlay(false);
        setSosStep('MENU');
      }, 2000);
    } else {
      console.error("SOS Error:", error.message);
      setSosStep('MENU');
      alert(`Failed to send SOS: ${error.message}`);
    }
  };

  return {
    showSosOverlay,
    setShowSosOverlay,
    sosStep,
    setSosStep,
    selectedSosType,
    openSosMenu,
    handleSelectReason,
    confirmSendSos
  };
};