-- Create active_rides table for real-time ride tracking
CREATE TABLE public.active_rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'searching',
  driver_lat DOUBLE PRECISION,
  driver_lng DOUBLE PRECISION,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  eta_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.active_rides ENABLE ROW LEVEL SECURITY;

-- Riders can view their own active rides
CREATE POLICY "Riders can view their active rides"
ON public.active_rides FOR SELECT
USING (auth.uid() = rider_id);

-- Riders can create their own rides
CREATE POLICY "Riders can create their active rides"
ON public.active_rides FOR INSERT
WITH CHECK (auth.uid() = rider_id);

-- Riders can update their own rides
CREATE POLICY "Riders can update their active rides"
ON public.active_rides FOR UPDATE
USING (auth.uid() = rider_id);

-- Drivers can view rides assigned to them
CREATE POLICY "Drivers can view assigned rides"
ON public.active_rides FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- Drivers can update rides assigned to them
CREATE POLICY "Drivers can update assigned rides"
ON public.active_rides FOR UPDATE
USING (
  driver_id IN (
    SELECT id FROM public.drivers WHERE user_id = auth.uid()
  )
);

-- Enable realtime for active_rides
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_rides;

-- Create trigger for updating active_rides updated_at
CREATE TRIGGER update_active_rides_updated_at
BEFORE UPDATE ON public.active_rides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create payment_methods table for storing customer payment info
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_method_id TEXT,
  card_last_four TEXT,
  card_brand TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stripe_payment_method_id)
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment methods
CREATE POLICY "Users can view their payment methods"
ON public.payment_methods FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users can insert their payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update their payment methods"
ON public.payment_methods FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete their payment methods"
ON public.payment_methods FOR DELETE
USING (auth.uid() = user_id);