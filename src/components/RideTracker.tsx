import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Navigation, Car, Phone, MessageSquare, X, Clock, User } from 'lucide-react';
import { useRideTracking, ActiveRide } from '@/hooks/useRideTracking';
import { cn } from '@/lib/utils';

interface RideTrackerProps {
  className?: string;
}

const statusSteps = ['searching', 'driver_assigned', 'driver_arriving', 'driver_arrived', 'in_progress', 'completed'];

const getProgressValue = (status: string) => {
  const index = statusSteps.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / statusSteps.length) * 100;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'searching':
      return 'Finding driver...';
    case 'driver_assigned':
      return 'Driver assigned';
    case 'driver_arriving':
      return 'Driver on the way';
    case 'driver_arrived':
      return 'Driver arrived';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const RideTracker = ({ className }: RideTrackerProps) => {
  const { activeRide, loading, cancelRide } = useRideTracking();
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Simulate driver movement for demo purposes
  useEffect(() => {
    if (!activeRide || activeRide.status === 'searching' || activeRide.status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      if (activeRide.driver_lat && activeRide.driver_lng) {
        setDriverPosition({
          lat: activeRide.driver_lat + (Math.random() - 0.5) * 0.001,
          lng: activeRide.driver_lng + (Math.random() - 0.5) * 0.001,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRide]);

  if (loading || !activeRide) {
    return null;
  }

  const isSearching = activeRide.status === 'searching';
  const showDriverInfo = !isSearching && activeRide.driver_id;

  return (
    <Card className={cn('bg-card border-border shadow-lg', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Active Ride
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              isSearching ? 'border-amber-500 text-amber-500' : 'border-primary text-primary'
            )}
          >
            {getStatusLabel(activeRide.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={getProgressValue(activeRide.status)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Requested</span>
            <span>Arriving</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Searching animation */}
        {isSearching && (
          <div className="flex flex-col items-center py-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/50 animate-ping animation-delay-150" />
              <div className="absolute inset-4 rounded-full bg-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Finding nearby drivers...</p>
          </div>
        )}

        {/* Driver info */}
        {showDriverInfo && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Your Driver</p>
                <p className="text-sm text-muted-foreground">Toyota Camry • ABC-1234</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {activeRide.eta_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  ETA: <strong>{activeRide.eta_minutes} min</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Route info */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm text-foreground">
                {activeRide.pickup_lat?.toFixed(4)}, {activeRide.pickup_lng?.toFixed(4)}
              </p>
            </div>
          </div>
          
          <div className="ml-1.5 border-l-2 border-dashed border-muted-foreground/30 h-4" />
          
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Navigation className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Dropoff</p>
              <p className="text-sm text-foreground">
                {activeRide.dropoff_lat?.toFixed(4)}, {activeRide.dropoff_lng?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel button */}
        {activeRide.status !== 'in_progress' && activeRide.status !== 'completed' && (
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={cancelRide}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Ride
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RideTracker;
