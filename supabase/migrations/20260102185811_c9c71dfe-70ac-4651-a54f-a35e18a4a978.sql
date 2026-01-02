-- Create drivers table for vehicle information
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  license_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(license_plate)
);

-- Enable RLS on drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own profile
CREATE POLICY "Drivers can view their own profile"
ON public.drivers FOR SELECT
USING (auth.uid() = user_id);

-- Drivers can update their own profile
CREATE POLICY "Drivers can update their own profile"
ON public.drivers FOR UPDATE
USING (auth.uid() = user_id);

-- Drivers can insert their own profile
CREATE POLICY "Drivers can insert their own profile"
ON public.drivers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trips table for ride history
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  fare DECIMAL(10, 2) NOT NULL,
  distance_miles DECIMAL(10, 2),
  duration_minutes INTEGER,
  ride_type TEXT NOT NULL DEFAULT 'economy',
  status TEXT NOT NULL DEFAULT 'completed',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Riders can view their own trips
CREATE POLICY "Riders can view their own trips"
ON public.trips FOR SELECT
USING (auth.uid() = rider_id);

-- Drivers can view trips they drove
CREATE POLICY "Drivers can view trips they drove"
ON public.trips FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- System can insert trips (for completed rides)
CREATE POLICY "Authenticated users can create trips"
ON public.trips FOR INSERT
WITH CHECK (auth.uid() = rider_id);

-- Create trigger for updating drivers updated_at
CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();