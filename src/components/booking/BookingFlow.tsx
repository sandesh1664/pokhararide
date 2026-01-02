import React, { useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import FareEstimation from './FareEstimation';
import DriverMatching from './DriverMatching';
import RideConfirmation from './RideConfirmation';

export type BookingStep = 'input' | 'fare' | 'matching' | 'confirmed';

export interface RideDetails {
  pickup: string;
  dropoff: string;
  selectedRide: {
    id: string;
    name: string;
    price: number;
    eta: number;
  } | null;
  driver: {
    name: string;
    rating: number;
    car: string;
    plate: string;
    photo: string;
    eta: number;
  } | null;
  distance: number;
  duration: number;
}

interface BookingFlowProps {
  initialPickup?: string;
  initialDropoff?: string;
  onClose?: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ 
  initialPickup = '', 
  initialDropoff = '',
  onClose 
}) => {
  const { user } = useAuth();
  const { pickupLocation, dropoffLocation } = useMapStore();
  const [step, setStep] = useState<BookingStep>('fare');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [rideDetails, setRideDetails] = useState<RideDetails>({
    pickup: initialPickup || 'Current Location',
    dropoff: initialDropoff || 'Times Square, NYC',
    selectedRide: null,
    driver: null,
    distance: 3.2, // miles
    duration: 12, // minutes
  });

  const handleSelectRide = async (ride: RideDetails['selectedRide']) => {
    setRideDetails(prev => ({ ...prev, selectedRide: ride }));
    
    // Create trip record
    if (user && ride) {
      try {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .insert({
            rider_id: user.id,
            pickup_address: rideDetails.pickup,
            dropoff_address: rideDetails.dropoff,
            pickup_lat: pickupLocation?.[1],
            pickup_lng: pickupLocation?.[0],
            dropoff_lat: dropoffLocation?.[1],
            dropoff_lng: dropoffLocation?.[0],
            fare: ride.price,
            ride_type: ride.name.toLowerCase(),
            distance_miles: rideDetails.distance,
            duration_minutes: rideDetails.duration,
            status: 'pending',
          })
          .select()
          .single();

        if (tripError) throw tripError;
        if (tripData) {
          setTripId(tripData.id);
        }
      } catch (error) {
        console.error('Error creating trip:', error);
      }
    }
    
    setStep('matching');
  };

  const handleDriverFound = async (driver: RideDetails['driver']) => {
    setRideDetails(prev => ({ ...prev, driver }));
    
    // Create active ride
    if (user) {
      try {
        const { data: rideData, error: rideError } = await supabase
          .from('active_rides')
          .insert({
            rider_id: user.id,
            trip_id: tripId,
            pickup_lat: pickupLocation?.[1],
            pickup_lng: pickupLocation?.[0],
            dropoff_lat: dropoffLocation?.[1],
            dropoff_lng: dropoffLocation?.[0],
            status: 'searching',
          })
          .select()
          .single();

        if (rideError) throw rideError;
        if (rideData) {
          setActiveRideId(rideData.id);
          // Simulate a driver ID for demo purposes
          setDriverId(rideData.driver_id);
        }
      } catch (error) {
        console.error('Error creating active ride:', error);
      }
    }
    
    setStep('confirmed');
  };

  const handleCancelRide = async () => {
    // Clean up active ride
    if (activeRideId) {
      try {
        await supabase
          .from('active_rides')
          .delete()
          .eq('id', activeRideId);
      } catch (error) {
        console.error('Error deleting active ride:', error);
      }
    }
    
    setStep('fare');
    setActiveRideId(null);
    setTripId(null);
    setDriverId(null);
    setRideDetails(prev => ({ ...prev, selectedRide: null, driver: null }));
  };

  const handleNewRide = () => {
    setStep('fare');
    setActiveRideId(null);
    setTripId(null);
    setDriverId(null);
    setRideDetails({
      pickup: 'Current Location',
      dropoff: '',
      selectedRide: null,
      driver: null,
      distance: 0,
      duration: 0,
    });
    onClose?.();
  };

  return (
    <div className="w-full max-w-md">
      {step === 'fare' && (
        <FareEstimation
          pickup={rideDetails.pickup}
          dropoff={rideDetails.dropoff}
          distance={rideDetails.distance}
          duration={rideDetails.duration}
          onSelectRide={handleSelectRide}
        />
      )}
      
      {step === 'matching' && rideDetails.selectedRide && (
        <DriverMatching
          selectedRide={rideDetails.selectedRide}
          onDriverFound={handleDriverFound}
          onCancel={handleCancelRide}
        />
      )}
      
      {step === 'confirmed' && rideDetails.driver && rideDetails.selectedRide && (
        <RideConfirmation
          driver={rideDetails.driver}
          ride={rideDetails.selectedRide}
          pickup={rideDetails.pickup}
          dropoff={rideDetails.dropoff}
          onCancel={handleCancelRide}
          onNewRide={handleNewRide}
          activeRideId={activeRideId}
          tripId={tripId}
          driverId={driverId}
        />
      )}
    </div>
  );
};

export default BookingFlow;
