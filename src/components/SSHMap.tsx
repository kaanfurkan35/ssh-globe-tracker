import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData, LiveConnection } from '@/types/ssh';

interface SSHMapProps {
  locations: LocationData[];
  liveConnections?: LiveConnection[];
  onLocationClick: (location: LocationData) => void;
}

export const SSHMap: React.FC<SSHMapProps> = ({ locations, liveConnections = [], onLocationClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Map<string, L.CircleMarker>>(new Map());
  const liveMarkers = useRef<Map<string, L.CircleMarker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    try {
      // Initialize Leaflet map
      map.current = L.map(mapContainer.current, {
        center: [20, 30],
        zoom: 2,
        zoomControl: true,
        worldCopyJump: true,
      });

      // Add OpenStreetMap tile layer (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map.current);

      // Add dark theme overlay for better aesthetics
      const darkOverlay = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 18,
      });
      darkOverlay.addTo(map.current);

      setMapReady(true);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const updateMarkers = () => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    markers.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markers.current.clear();

    locations.forEach(location => {
      if (location.latitude === 0 && location.longitude === 0) {
        return;
      }

      // Calculate marker size based on session count (very slow growth)
      const baseSize = 8;
      const maxSize = 18;
      // Use square root scaling with very slow growth: baseSize + sqrt(sessionCount) * 0.3
      const scaleFactor = 0.3;
      const radius = Math.min(maxSize, baseSize + (Math.sqrt(location.sessionCount) * scaleFactor));
      
      // Choose color based on authentication methods
      const hasPassword = location.methods.includes('password');
      const hasPublickey = location.methods.includes('publickey');
      
      let color = 'hsl(195, 100%, 50%)'; // Primary blue
      if (hasPassword && !hasPublickey) {
        color = 'hsl(0, 75%, 55%)'; // Red for password-only
      } else if (hasPassword && hasPublickey) {
        color = 'hsl(45, 100%, 55%)'; // Warning amber for mixed
      }

      // Create circle marker
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: radius,
        fillColor: color,
        color: 'rgba(255, 255, 255, 0.3)',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      // Add hover effects
      marker.on('mouseover', function() {
        this.setStyle({
          radius: radius * 1.3,
          fillOpacity: 1,
          weight: 3,
        });
      });

      marker.on('mouseout', function() {
        this.setStyle({
          radius: radius,
          fillOpacity: 0.8,
          weight: 2,
        });
      });

      // Add click event
      marker.on('click', () => {
        onLocationClick(location);
      });

      // Create tooltip with basic info
      const tooltipContent = `
        <div class="text-sm">
          <strong>${location.ip}</strong><br/>
          <span>${location.city}, ${location.country}</span><br/>
          <span>${location.sessionCount} sessions</span><br/>
          <span>Methods: ${location.methods.join(', ')}</span>
        </div>
      `;
      
      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -10],
      });

      marker.addTo(map.current!);
      markers.current.set(location.ip, marker);
    });
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const updateLiveConnections = () => {
    if (!map.current || !mapReady) return;

    // Clear existing live markers
    liveMarkers.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    liveMarkers.current.clear();

    liveConnections.forEach(connection => {
      if (connection.latitude === 0 && connection.longitude === 0) {
        return;
      }

      // Create pulsing green marker for live connections
      const marker = L.circleMarker([connection.latitude, connection.longitude], {
        radius: 12,
        fillColor: '#00ff00', // Bright green
        color: 'rgba(255, 255, 255, 0.8)',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'live-connection-marker'
      });

      // Add pulsing animation
      marker.on('add', () => {
        const markerElement = marker.getElement() as HTMLElement;
        if (markerElement) {
          markerElement.style.animation = 'pulse 2s infinite';
          markerElement.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.6)';
        }
      });

      // Create tooltip for live connections
      const tooltipContent = `
        <div class="text-sm">
          <strong>🟢 LIVE CONNECTION</strong><br/>
          <span><strong>IP:</strong> ${connection.ip}</span><br/>
          ${connection.user ? `<span><strong>User:</strong> ${connection.user}</span><br/>` : ''}
          <span><strong>Location:</strong> ${connection.city}, ${connection.country}</span><br/>
          <span><strong>Time:</strong> ${new Date(connection.timestamp).toLocaleTimeString()}</span>
        </div>
      `;
      
      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -15],
        className: 'live-connection-tooltip'
      });

      marker.addTo(map.current!);
      liveMarkers.current.set(connection.ip + connection.timestamp, marker);
    });
  };

  useEffect(() => {
    updateMarkers();
  }, [locations, mapReady]);

  useEffect(() => {
    updateLiveConnections();
  }, [liveConnections, mapReady]);

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          .leaflet-container {
            background: hsl(var(--background));
          }
          
          .leaflet-tooltip {
            background: hsl(var(--popover)) !important;
            border: 1px solid hsl(var(--border)) !important;
            color: hsl(var(--popover-foreground)) !important;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }

          .live-connection-tooltip {
            background: rgba(0, 255, 0, 0.1) !important;
            border: 1px solid rgba(0, 255, 0, 0.3) !important;
            backdrop-filter: blur(10px);
          }
          
          .leaflet-tooltip-top:before {
            border-top-color: hsl(var(--popover)) !important;
          }
          
          .leaflet-control-zoom a {
            background: hsl(var(--background)) !important;
            border: 1px solid hsl(var(--border)) !important;
            color: hsl(var(--foreground)) !important;
          }
          
          .leaflet-control-zoom a:hover {
            background: hsl(var(--accent)) !important;
          }

          .live-connection-marker {
            filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.6));
          }
        `}
      </style>
    </div>
  );
};