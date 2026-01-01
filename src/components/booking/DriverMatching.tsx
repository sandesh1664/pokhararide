import React, { useState, useEffect } from 'react';
import { Car, X, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RideDetails } from './BookingFlow';

const driverPool = [
  { name: 'Michael Chen', rating: 4.95, car: 'Toyota Camry', plate: 'ABC 1234', photo: '👨‍💼' },
  { name: 'Sarah Johnson', rating: 4.88, car: 'Honda Accord', plate: 'XYZ 5678', photo: '👩‍💼' },
  { name: 'David Park', rating: 4.92, car: 'Tesla Model 3', plate: 'EV 9012', photo: '👨‍🦱' },
  { name: 'Emily Rodriguez', rating: 4.97, car: 'BMW 3 Series', plate: 'LUX 3456', photo: '👩‍🦰' },
  { name: 'James Wilson', rating: 4.85, car: 'Hyundai Sonata', plate: 'RDE 7890', photo: '🧔' },
];

interface DriverMatchingProps {
  selectedRide: NonNullable<RideDetails['selectedRide']>;
  onDriverFound: (driver: NonNullable<RideDetails['driver']>) => void;
  onCancel: () => void;
}

const DriverMatching: React.FC<DriverMatchingProps> = ({
  selectedRide,
  onDriverFound,
  onCancel,
}) => {
  const [searchPhase, setSearchPhase] = useState<'searching' | 'found'>('searching');
  const [progress, setProgress] = useState(0);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const [pulseRings, setPulseRings] = useState([1, 2, 3]);

  // Simulate driver search
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Cycle through drivers during search
    const driverInterval = setInterval(() => {
      setCurrentDriverIndex(prev => (prev + 1) % driverPool.length);
    }, 400);

    // Simulate finding driver after ~3 seconds
    const findDriver = setTimeout(() => {
      setSearchPhase('found');
      clearInterval(driverInterval);
      
      // Trigger callback after short delay
      setTimeout(() => {
        const driver = driverPool[Math.floor(Math.random() * driverPool.length)];
        onDriverFound({
          ...driver,
          eta: selectedRide.eta,
        });
      }, 1500);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(driverInterval);
      clearTimeout(findDriver);
    };
  }, [onDriverFound, selectedRide.eta]);

  const currentDriver = driverPool[currentDriverIndex];

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-lg border-border shadow-xl animate-scale-in overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {searchPhase === 'searching' ? 'Finding your driver...' : 'Driver found!'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Animation Area */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Pulse rings */}
          {searchPhase === 'searching' && (
            <div className="absolute inset-0 flex items-center justify-center">
              {pulseRings.map((ring, i) => (
                <div
                  key={ring}
                  className="absolute rounded-full border-2 border-primary/30 animate-ping"
                  style={{
                    width: `${80 + i * 50}px`,
                    height: `${80 + i * 50}px`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Car icon in center */}
          <div className={`relative z-10 transition-all duration-500 ${
            searchPhase === 'found' ? 'scale-110' : ''
          }`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              searchPhase === 'found' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary'
            }`}>
              {searchPhase === 'found' ? (
                <div className="text-4xl animate-bounce">{currentDriver.photo}</div>
              ) : (
                <Car className="w-10 h-10 animate-pulse" />
              )}
            </div>
            
            {searchPhase === 'found' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Match!
              </div>
            )}
          </div>

          {/* Floating driver cards during search */}
          {searchPhase === 'searching' && (
            <>
              <div className="absolute top-4 left-4 bg-card rounded-lg p-2 shadow-lg animate-float opacity-60" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{driverPool[0].photo}</span>
                  <span className="text-xs text-muted-foreground">{driverPool[0].rating}★</span>
                </div>
              </div>
              <div className="absolute top-8 right-4 bg-card rounded-lg p-2 shadow-lg animate-float opacity-60" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{driverPool[1].photo}</span>
                  <span className="text-xs text-muted-foreground">{driverPool[1].rating}★</span>
                </div>
              </div>
              <div className="absolute bottom-8 left-8 bg-card rounded-lg p-2 shadow-lg animate-float opacity-60" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{driverPool[2].photo}</span>
                  <span className="text-xs text-muted-foreground">{driverPool[2].rating}★</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-8 bg-card rounded-lg p-2 shadow-lg animate-float opacity-60" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{driverPool[3].photo}</span>
                  <span className="text-xs text-muted-foreground">{driverPool[3].rating}★</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{selectedRide.name} • ${selectedRide.price.toFixed(2)}</span>
            <span>{searchPhase === 'found' ? 'Connecting...' : 'Searching nearby drivers'}</span>
          </div>
        </div>

        {/* Cancel button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onCancel}
        >
          Cancel Request
        </Button>
      </div>
    </Card>
  );
};

export default DriverMatching;
