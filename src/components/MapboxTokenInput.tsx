import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMapStore } from '@/stores/mapStore';
import { Map, ExternalLink } from 'lucide-react';

const MapboxTokenInput = () => {
  const { mapboxToken, setMapboxToken } = useMapStore();
  const [token, setToken] = useState('');
  const [isEditing, setIsEditing] = useState(!mapboxToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setMapboxToken(token.trim());
      setIsEditing(false);
    }
  };

  if (mapboxToken && !isEditing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Map className="w-4 h-4 text-primary" />
        <span>Map connected</span>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-primary hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Map className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Enable Live Map</h4>
          <p className="text-sm text-muted-foreground">
            Enter your Mapbox public token to see real-time driver locations
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="pk.eyJ1IjoieW91ci10b2tlbiIsImEi..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="bg-background"
        />
        <div className="flex items-center justify-between">
          <a 
            href="https://account.mapbox.com/access-tokens/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Get your token <ExternalLink className="w-3 h-3" />
          </a>
          <Button type="submit" size="sm" disabled={!token.trim()}>
            Connect Map
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MapboxTokenInput;
