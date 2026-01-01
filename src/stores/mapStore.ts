import { create } from 'zustand';

interface MapStore {
  mapboxToken: string | null;
  setMapboxToken: (token: string) => void;
  pickupLocation: [number, number] | null;
  dropoffLocation: [number, number] | null;
  setPickupLocation: (location: [number, number] | null) => void;
  setDropoffLocation: (location: [number, number] | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  mapboxToken: localStorage.getItem('mapbox_token'),
  setMapboxToken: (token: string) => {
    localStorage.setItem('mapbox_token', token);
    set({ mapboxToken: token });
  },
  pickupLocation: null,
  dropoffLocation: null,
  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDropoffLocation: (location) => set({ dropoffLocation: location }),
}));
