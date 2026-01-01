import React, { useState } from 'react';
import { Car, Users, Zap, Crown, Clock, MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RideDetails } from './BookingFlow';

const rideTypes = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable everyday rides',
    basePrice: 8,
    perMile: 1.5,
    perMin: 0.2,
    eta: 3,
    capacity: 4,
    icon: Car,
    multiplier: 1,
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    basePrice: 12,
    perMile: 2,
    perMin: 0.3,
    eta: 5,
    capacity: 4,
    icon: Zap,
    multiplier: 1.4,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury vehicles, top-rated drivers',
    basePrice: 20,
    perMile: 3,
    perMin: 0.5,
    eta: 7,
    capacity: 4,
    icon: Crown,
    multiplier: 2,
  },
  {
    id: 'xl',
    name: 'XL',
    description: 'SUVs for groups up to 6',
    basePrice: 15,
    perMile: 2.5,
    perMin: 0.35,
    eta: 8,
    capacity: 6,
    icon: Users,
    multiplier: 1.6,
  },
];

interface FareEstimationProps {
  pickup: string;
  dropoff: string;
  distance: number;
  duration: number;
  onSelectRide: (ride: RideDetails['selectedRide']) => void;
}

const FareEstimation: React.FC<FareEstimationProps> = ({
  pickup,
  dropoff,
  distance,
  duration,
  onSelectRide,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const calculateFare = (rideType: typeof rideTypes[0]) => {
    const fare = rideType.basePrice + (distance * rideType.perMile) + (duration * rideType.perMin);
    return Math.round(fare * 100) / 100;
  };

  const handleConfirm = () => {
    const selected = rideTypes.find(r => r.id === selectedType);
    if (selected) {
      onSelectRide({
        id: selected.id,
        name: selected.name,
        price: calculateFare(selected),
        eta: selected.eta,
      });
    }
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-lg border-border shadow-xl animate-scale-in">
      <div className="space-y-6">
        {/* Trip Summary */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Choose your ride</h3>
          
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-0.5 h-8 bg-border" />
              <div className="w-3 h-3 rounded-full bg-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="font-medium text-sm">{pickup}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="font-medium text-sm">{dropoff}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              {distance} mi
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{duration} min
            </span>
          </div>
        </div>

        {/* Ride Options */}
        <div className="space-y-2">
          {rideTypes.map((ride) => {
            const fare = calculateFare(ride);
            const isSelected = selectedType === ride.id;
            const Icon = ride.icon;

            return (
              <button
                key={ride.id}
                onClick={() => setSelectedType(ride.id)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-secondary/30 hover:bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{ride.name}</span>
                      <span className="font-bold text-lg">${fare.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{ride.description}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ride.eta} min
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          disabled={!selectedType}
          onClick={handleConfirm}
        >
          {selectedType ? `Confirm ${rideTypes.find(r => r.id === selectedType)?.name}` : 'Select a ride'}
        </Button>
      </div>
    </Card>
  );
};

export default FareEstimation;
