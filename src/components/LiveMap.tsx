import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '@/stores/mapStore';
import { Car } from 'lucide-react';

// Simulated driver locations near a default location
const generateDrivers = (center: [number, number], count: number = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `driver-${i}`,
    lng: center[0] + (Math.random() - 0.5) * 0.02,
    lat: center[1] + (Math.random() - 0.5) * 0.02,
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    eta: Math.floor(2 + Math.random() * 8),
  }));
};

interface LiveMapProps {
  className?: string;
  showRoute?: boolean;
}

const LiveMap: React.FC<LiveMapProps> = ({ className = '', showRoute = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayerAdded = useRef(false);
  
  const { mapboxToken, pickupLocation, dropoffLocation } = useMapStore();
  const [drivers, setDrivers] = useState<ReturnType<typeof generateDrivers>>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([-73.985428, 40.748817]); // Default: NYC

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(newLocation);
        },
        () => {
          console.log('Using default location');
        }
      );
    }
  }, []);

  // Generate drivers around user location
  useEffect(() => {
    setDrivers(generateDrivers(userLocation));
    
    // Simulate driver movement every 3 seconds
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        lng: driver.lng + (Math.random() - 0.5) * 0.001,
        lat: driver.lat + (Math.random() - 0.5) * 0.001,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation,
      zoom: 14,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add user location marker
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'user-location-marker';
    userMarkerEl.innerHTML = `
      <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg relative">
        <div class="absolute inset-0 bg-primary rounded-full animate-ping opacity-50"></div>
      </div>
    `;
    
    new mapboxgl.Marker(userMarkerEl)
      .setLngLat(userLocation)
      .addTo(map.current);

    map.current.on('load', () => {
      // Add 3D buildings
      map.current?.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#1a1a2e',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  // Update driver markers
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new driver markers
    drivers.forEach(driver => {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg border-2 border-primary transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(152, 76%, 42%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
            ${driver.eta} min
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([driver.lng, driver.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [drivers, mapboxToken]);

  // Draw route when pickup and dropoff are set
  useEffect(() => {
    if (!map.current || !showRoute || !pickupLocation || !dropoffLocation) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLocation[0]},${pickupLocation[1]};${dropoffLocation[0]},${dropoffLocation[1]}?geometries=geojson&access_token=${mapboxToken}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry;

          if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: route,
            });
          } else {
            map.current?.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route,
                },
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': 'hsl(152, 76%, 42%)',
                'line-width': 5,
                'line-opacity': 0.8,
              },
            });
          }

          // Fit bounds to show the entire route
          const coordinates = route.coordinates;
          const bounds = coordinates.reduce(
            (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          map.current?.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [pickupLocation, dropoffLocation, showRoute, mapboxToken]);

  if (!mapboxToken) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden" />
      
      {/* Map overlay gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-t from-background/20 to-transparent" />
      
      {/* Driver count badge */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium">{drivers.length} drivers nearby</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
