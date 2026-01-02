import { useState } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-city.jpg";
import LiveMap from "@/components/LiveMap";
import MapboxTokenInput from "@/components/MapboxTokenInput";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useMapStore } from "@/stores/mapStore";
import { BookingFlow } from "@/components/booking";

const HeroSection = () => {
  const { mapboxToken, setPickupLocation, setDropoffLocation } = useMapStore();
  const [showBooking, setShowBooking] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const handlePickupChange = (value: string, coordinates?: [number, number]) => {
    setPickup(value);
    if (coordinates) {
      setPickupLocation(coordinates);
    }
  };

  const handleDropoffChange = (value: string, coordinates?: [number, number]) => {
    setDropoff(value);
    if (coordinates) {
      setDropoffLocation(coordinates);
    }
  };

  const handleRequestRide = () => {
    if (pickup && dropoff) {
      setShowBooking(true);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background - Show map if token exists, otherwise show image */}
      <div className="absolute inset-0">
        {mapboxToken ? (
          <LiveMap className="w-full h-full" />
        ) : (
          <>
            <img
              src={heroImage}
              alt="City streets at night"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-hero/95 via-hero/80 to-hero/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-hero via-transparent to-transparent" />
          </>
        )}
        {/* Overlay gradient for map */}
        {mapboxToken && (
          <div className="absolute inset-0 bg-gradient-to-r from-hero/90 via-hero/60 to-transparent pointer-events-none" />
        )}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-hero-foreground leading-tight mb-6">
              Get there.
              <br />
              <span className="text-gradient">Your way.</span>
            </h1>
            <p className="text-lg md:text-xl text-hero-muted mb-8 max-w-lg">
              Request a ride in seconds. Choose your comfort level. Arrive safely at your destination.
            </p>

            {/* Show Booking Flow or Input Form */}
            {showBooking ? (
              <BookingFlow 
                initialPickup={pickup || "Current Location"} 
                initialDropoff={dropoff || "Times Square, NYC"}
                onClose={() => {
                  setShowBooking(false);
                  setPickup("");
                  setDropoff("");
                }}
              />
            ) : (
              <div className="bg-card rounded-2xl p-6 shadow-xl max-w-md animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="space-y-4">
                  {/* Mapbox Token Input */}
                  {!mapboxToken && (
                    <div className="mb-4">
                      <MapboxTokenInput />
                    </div>
                  )}
                  
                  <LocationAutocomplete
                    value={pickup}
                    onChange={handlePickupChange}
                    placeholder="Pickup location"
                    icon="pickup"
                  />
                  <LocationAutocomplete
                    value={dropoff}
                    onChange={handleDropoffChange}
                    placeholder="Where to?"
                    icon="dropoff"
                  />
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleRequestRide}
                    disabled={!pickup || !dropoff}
                  >
                    Request Ride
                  </Button>
                  
                  {mapboxToken && (
                    <div className="pt-2">
                      <MapboxTokenInput />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Stats (only show when no map and no booking flow) */}
          {!mapboxToken && !showBooking && (
            <div className="hidden lg:flex flex-col items-end gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-hero-foreground mb-1">2M+</div>
                <div className="text-hero-muted">Active riders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-hero-foreground mb-1">500K+</div>
                <div className="text-hero-muted">Verified drivers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-primary mb-1">4.9★</div>
                <div className="text-hero-muted">Average rating</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
