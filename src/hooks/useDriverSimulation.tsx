import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimulatedDriver {
  lat: number;
  lng: number;
  status: 'searching' | 'driver_assigned' | 'arriving' | 'in_progress' | 'completed';
}

export const useDriverSimulation = (rideId: string | null, pickupLat?: number, pickupLng?: number, dropoffLat?: number, dropoffLng?: number) => {
  const [driver, setDriver] = useState<SimulatedDriver | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const startSimulation = useCallback(async () => {
    if (!rideId || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return;

    setIsSimulating(true);
    
    // Start from a random point near pickup
    const startLat = pickupLat + (Math.random() - 0.5) * 0.02;
    const startLng = pickupLng + (Math.random() - 0.5) * 0.02;
    
    setDriver({ lat: startLat, lng: startLng, status: 'driver_assigned' });

    // Update active ride with driver assigned
    await supabase
      .from('active_rides')
      .update({ 
        status: 'driver_assigned',
        driver_lat: startLat,
        driver_lng: startLng,
        eta_minutes: 5
      })
      .eq('id', rideId);

    toast.info('Driver assigned! On their way to pickup.');

    // Simulate driver moving to pickup
    const stepsToPickup = 10;
    const latStepToPickup = (pickupLat - startLat) / stepsToPickup;
    const lngStepToPickup = (pickupLng - startLng) / stepsToPickup;

    for (let i = 1; i <= stepsToPickup; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newLat = startLat + latStepToPickup * i;
      const newLng = startLng + lngStepToPickup * i;
      
      const status = i === stepsToPickup ? 'arriving' : 'driver_assigned';
      
      setDriver({ lat: newLat, lng: newLng, status });
      
      await supabase
        .from('active_rides')
        .update({ 
          driver_lat: newLat, 
          driver_lng: newLng,
          status,
          eta_minutes: Math.max(1, stepsToPickup - i)
        })
        .eq('id', rideId);

      if (i === stepsToPickup) {
        toast.success('Driver has arrived at pickup!');
      }
    }

    // Wait at pickup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDriver(prev => prev ? { ...prev, status: 'in_progress' } : null);
    
    await supabase
      .from('active_rides')
      .update({ status: 'in_progress' })
      .eq('id', rideId);

    toast.info('Trip started! Heading to destination.');

    // Simulate driver moving to dropoff
    const stepsToDropoff = 15;
    const latStepToDropoff = (dropoffLat - pickupLat) / stepsToDropoff;
    const lngStepToDropoff = (dropoffLng - pickupLng) / stepsToDropoff;

    for (let i = 1; i <= stepsToDropoff; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const newLat = pickupLat + latStepToDropoff * i;
      const newLng = pickupLng + lngStepToDropoff * i;
      
      const status = i === stepsToDropoff ? 'completed' : 'in_progress';
      
      setDriver({ lat: newLat, lng: newLng, status });
      
      await supabase
        .from('active_rides')
        .update({ 
          driver_lat: newLat, 
          driver_lng: newLng,
          status,
          eta_minutes: i === stepsToDropoff ? 0 : Math.max(1, stepsToDropoff - i)
        })
        .eq('id', rideId);

      if (i === stepsToDropoff) {
        toast.success('You have arrived at your destination!');
      }
    }

    setIsSimulating(false);
  }, [rideId, pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    setDriver(null);
  }, []);

  return { driver, isSimulating, startSimulation, stopSimulation };
};
