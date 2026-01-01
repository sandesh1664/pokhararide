import React, { useState } from 'react';
import { useMapStore } from '@/stores/mapStore';
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
  const [step, setStep] = useState<BookingStep>('fare');
  const [rideDetails, setRideDetails] = useState<RideDetails>({
    pickup: initialPickup || 'Current Location',
    dropoff: initialDropoff || 'Times Square, NYC',
    selectedRide: null,
    driver: null,
    distance: 3.2, // miles
    duration: 12, // minutes
  });

  const handleSelectRide = (ride: RideDetails['selectedRide']) => {
    setRideDetails(prev => ({ ...prev, selectedRide: ride }));
    setStep('matching');
  };

  const handleDriverFound = (driver: RideDetails['driver']) => {
    setRideDetails(prev => ({ ...prev, driver }));
    setStep('confirmed');
  };

  const handleCancelRide = () => {
    setStep('fare');
    setRideDetails(prev => ({ ...prev, selectedRide: null, driver: null }));
  };

  const handleNewRide = () => {
    setStep('fare');
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
        />
      )}
    </div>
  );
};

export default BookingFlow;
