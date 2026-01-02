import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, DollarSign, Car, ArrowLeft, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface Trip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  distance_miles: number | null;
  duration_minutes: number | null;
  ride_type: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

const RideHistory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('rider_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTrips(data);
      }
      setLoading(false);
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  const getRideTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'comfort':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'xl':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ride History</h1>
            <p className="text-muted-foreground">View your past trips and receipts</p>
          </div>
        </div>

        {trips.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Car className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No rides yet</h3>
              <p className="text-muted-foreground mb-6">Your completed rides will appear here</p>
              <Button variant="hero" onClick={() => navigate('/')}>
                Book your first ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card key={trip.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={getRideTypeColor(trip.ride_type)}
                        >
                          {trip.ride_type.charAt(0).toUpperCase() + trip.ride_type.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          {trip.completed_at 
                            ? format(new Date(trip.completed_at), 'MMM d, yyyy • h:mm a')
                            : format(new Date(trip.created_at), 'MMM d, yyyy • h:mm a')
                          }
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{trip.pickup_address}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Navigation className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{trip.dropoff_address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {trip.distance_miles && (
                          <span>{trip.distance_miles.toFixed(1)} mi</span>
                        )}
                        {trip.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {trip.duration_minutes} min
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:flex-col md:items-end">
                      <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                        <DollarSign className="w-5 h-5" />
                        {Number(trip.fare).toFixed(2)}
                      </div>
                      <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;
