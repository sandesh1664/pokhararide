-- Create ratings table for ride feedback
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, rider_id)
);

-- Enable Row Level Security
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Riders can create ratings for their own trips
CREATE POLICY "Riders can create ratings for their trips"
ON public.ratings
FOR INSERT
WITH CHECK (
  auth.uid() = rider_id 
  AND trip_id IN (SELECT id FROM public.trips WHERE rider_id = auth.uid())
);

-- Riders can view their own ratings
CREATE POLICY "Riders can view their own ratings"
ON public.ratings
FOR SELECT
USING (auth.uid() = rider_id);

-- Drivers can view ratings they received
CREATE POLICY "Drivers can view their received ratings"
ON public.ratings
FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);