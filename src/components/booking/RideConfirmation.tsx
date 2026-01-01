import React, { useState, useEffect } from 'react';
import { Car, Phone, MessageSquare, Star, MapPin, Navigation, Clock, Shield, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RideDetails } from './BookingFlow';

interface RideConfirmationProps {
  driver: NonNullable<RideDetails['driver']>;
  ride: NonNullable<RideDetails['selectedRide']>;
  pickup: string;
  dropoff: string;
  onCancel: () => void;
  onNewRide: () => void;
}

const RideConfirmation: React.FC<RideConfirmationProps> = ({
  driver,
  ride,
  pickup,
  dropoff,
  onCancel,
  onNewRide,
}) => {
  const [eta, setEta] = useState(driver.eta);
  const [status, setStatus] = useState<'arriving' | 'arrived' | 'inProgress' | 'completed'>('arriving');

  // Simulate ETA countdown
  useEffect(() => {
    if (status !== 'arriving') return;

    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          setStatus('arrived');
          return 0;
        }
        return prev - 1;
      });
    }, 3000); // Speed up for demo

    return () => clearInterval(interval);
  }, [status]);

  const getStatusText = () => {
    switch (status) {
      case 'arriving':
        return `Arriving in ${eta} min`;
      case 'arrived':
        return 'Your driver has arrived!';
      case 'inProgress':
        return 'On the way to destination';
      case 'completed':
        return 'Ride completed!';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'arriving':
        return 'bg-primary';
      case 'arrived':
        return 'bg-green-500';
      case 'inProgress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-primary';
    }
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-lg border-border shadow-xl animate-scale-in">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="font-semibold">{getStatusText()}</span>
          </div>
          {status === 'arriving' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl">
            {driver.photo}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{driver.name}</span>
              <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                {driver.rating}
              </div>
            </div>
            <p className="text-muted-foreground">{driver.car}</p>
            <p className="text-sm font-mono font-bold tracking-wider">{driver.plate}</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2">
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="w-0.5 h-6 bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
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
        </div>

        {/* Fare Summary */}
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div>
            <p className="text-sm text-muted-foreground">{ride.name}</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Protected ride</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${ride.price.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Estimated fare</p>
          </div>
        </div>

        {/* Action Buttons */}
        {status === 'arriving' ? (
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={onCancel}
          >
            Cancel Ride
          </Button>
        ) : status === 'arrived' ? (
          <Button
            variant="hero"
            className="w-full"
            onClick={() => setStatus('inProgress')}
          >
            Start Trip
          </Button>
        ) : status === 'inProgress' ? (
          <Button
            variant="hero"
            className="w-full"
            onClick={() => setStatus('completed')}
          >
            Complete Trip
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              <span className="font-semibold">Thanks for riding!</span>
            </div>
            <Button
              variant="hero"
              className="w-full"
              onClick={onNewRide}
            >
              Book Another Ride
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RideConfirmation;
