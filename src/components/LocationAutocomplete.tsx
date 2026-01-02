import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMapStore } from '@/stores/mapStore';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder: string;
  icon?: 'pickup' | 'dropoff';
  className?: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder,
  icon = 'pickup',
  className,
}: LocationAutocompleteProps) => {
  const { mapboxToken } = useMapStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (!mapboxToken || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5&types=address,poi,place`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(
          data.features.map((feature: any) => ({
            id: feature.id,
            place_name: feature.place_name,
            center: feature.center,
          }))
        );
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.place_name, suggestion.center);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const Icon = icon === 'pickup' ? MapPin : Navigation;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Icon className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5',
          icon === 'pickup' ? 'text-primary' : 'text-muted-foreground'
        )} />
        <Input
          variant="ride"
          inputSize="lg"
          placeholder={placeholder}
          className="pl-12 pr-10"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground line-clamp-2">
                {suggestion.place_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {!mapboxToken && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground">
            Add a Mapbox token above to enable location autocomplete
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
