import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationData } from '@/types/ssh';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Globe } from 'lucide-react';

interface SSHMapProps {
  locations: LocationData[];
  onLocationClick: (location: LocationData) => void;
}

export const SSHMap: React.FC<SSHMapProps> = ({ locations, onLocationClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [accessToken, setAccessToken] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !accessToken) return;

    try {
      mapboxgl.accessToken = accessToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe' as any,
        zoom: 1.5,
        center: [30, 20],
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'hsl(215, 28%, 8%)',
          'high-color': 'hsl(195, 100%, 50%)',
          'horizon-blend': 0.1,
        });
        setMapReady(true);
      });

      // Disable rotation for better UX
      map.current.dragRotate.disable();
      map.current.touchZoomRotate.disableRotation();
      
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const updateMarkers = () => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    locations.forEach(location => {
      if (location.latitude === 0 && location.longitude === 0) return;

      // Calculate marker size based on session count
      const baseSize = 12;
      const maxSize = 40;
      const size = Math.min(maxSize, baseSize + (location.sessionCount * 2));
      
      // Choose color based on authentication methods
      const hasPassword = location.methods.includes('password');
      const hasPublickey = location.methods.includes('publickey');
      
      let color = 'hsl(195, 100%, 50%)'; // Primary blue
      if (hasPassword && !hasPublickey) {
        color = 'hsl(0, 75%, 55%)'; // Red for password-only
      } else if (hasPassword && hasPublickey) {
        color = 'hsl(45, 100%, 55%)'; // Warning amber for mixed
      }

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'ssh-marker';
      markerElement.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 15px ${color}66;
        transition: all 0.3s ease;
        position: relative;
      `;

      // Add pulse animation for high-activity IPs
      if (location.sessionCount > 10) {
        markerElement.style.animation = 'pulse 2s infinite';
      }

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
        markerElement.style.boxShadow = `0 0 25px ${color}`;
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.boxShadow = `0 0 15px ${color}66`;
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        onLocationClick(location);
      });

      markers.current.set(location.ip, marker);
    });
  };

  useEffect(() => {
    if (accessToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [accessToken]);

  useEffect(() => {
    updateMarkers();
  }, [locations, mapReady]);

  if (!accessToken) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-warning">
          <AlertCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
        </div>
        <p className="text-muted-foreground">
          Please enter your Mapbox public token to display the interactive map.
        </p>
        <p className="text-sm text-muted-foreground">
          Get your token from{' '}
          <a 
            href="https://mapbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
        <div className="max-w-md mx-auto flex space-x-2">
          <Input
            type="password"
            placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOi..."
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <Button 
            onClick={initializeMap}
            disabled={!accessToken}
            className="shrink-0"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};