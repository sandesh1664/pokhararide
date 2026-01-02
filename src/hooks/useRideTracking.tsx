import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ActiveRide {
  id: string;
  trip_id: string | null;
  rider_id: string;
  driver_id: string | null;
  status: string;
  driver_lat: number | null;
  driver_lng: number | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  eta_minutes: number | null;
  created_at: string;
  updated_at: string;
}

type RideStatus = 'searching' | 'driver_assigned' | 'driver_arriving' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';

const statusMessages: Record<RideStatus, { title: string; description: string }> = {
  searching: { title: 'Finding a driver', description: 'We\'re matching you with a nearby driver.' },
  driver_assigned: { title: 'Driver assigned!', description: 'A driver has accepted your ride.' },
  driver_arriving: { title: 'Driver on the way', description: 'Your driver is heading to the pickup location.' },
  driver_arrived: { title: 'Driver arrived!', description: 'Your driver is waiting at the pickup location.' },
  in_progress: { title: 'Ride in progress', description: 'Enjoy your ride!' },
  completed: { title: 'Ride completed', description: 'Thank you for riding with RideFlow!' },
  cancelled: { title: 'Ride cancelled', description: 'Your ride has been cancelled.' },
};

export const useRideTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Send browser notification
  const sendNotification = useCallback((title: string, body: string) => {
    // Toast notification
    toast({
      title,
      description: body,
    });

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'ride-update',
      });
    }
  }, [toast]);

  // Fetch active ride
  const fetchActiveRide = useCallback(async () => {
    if (!user) {
      setActiveRide(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('active_rides')
      .select('*')
      .eq('rider_id', user.id)
      .not('status', 'in', '("completed","cancelled")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setActiveRide(data as ActiveRide);
    } else {
      setActiveRide(null);
    }
    setLoading(false);
  }, [user]);

  // Create a new ride
  const createRide = useCallback(async (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number
  ) => {
    if (!user) return null;

    await requestNotificationPermission();

    const { data, error } = await supabase
      .from('active_rides')
      .insert({
        rider_id: user.id,
        status: 'searching',
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        dropoff_lat: dropoffLat,
        dropoff_lng: dropoffLng,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error creating ride',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }

    setActiveRide(data as ActiveRide);
    sendNotification('Ride requested', 'We\'re finding a driver for you.');
    return data;
  }, [user, toast, sendNotification, requestNotificationPermission]);

  // Cancel ride
  const cancelRide = useCallback(async () => {
    if (!activeRide) return;

    const { error } = await supabase
      .from('active_rides')
      .update({ status: 'cancelled' })
      .eq('id', activeRide.id);

    if (error) {
      toast({
        title: 'Error cancelling ride',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    sendNotification('Ride cancelled', 'Your ride has been cancelled.');
    setActiveRide(null);
  }, [activeRide, toast, sendNotification]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchActiveRide();

    const channel = supabase
      .channel('active-rides-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_rides',
          filter: `rider_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Ride update received:', payload);
          
          if (payload.eventType === 'DELETE') {
            setActiveRide(null);
            return;
          }

          const newRide = payload.new as ActiveRide;
          setActiveRide(newRide);

          // Send notification on status change
          if (newRide.status !== previousStatus && previousStatus !== null) {
            const statusInfo = statusMessages[newRide.status as RideStatus];
            if (statusInfo) {
              sendNotification(statusInfo.title, statusInfo.description);
            }
          }
          setPreviousStatus(newRide.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchActiveRide, previousStatus, sendNotification]);

  return {
    activeRide,
    loading,
    createRide,
    cancelRide,
    refetch: fetchActiveRide,
  };
};
