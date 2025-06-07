import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Target, Layers, Satellite, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'farm' | 'waypoint' | 'poi';
}

interface GoogleMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: MapMarker[];
  viewMode?: 'map' | 'satellite';
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  markers = [],
  viewMode = 'map',
  height = '300px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps API');
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const defaultCenter = { lat: -6.2088, lng: 106.8456 }; // Jakarta default

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: userLocation || defaultCenter,
      zoom: 13,
      mapTypeId: viewMode === 'satellite' ? 'satellite' : 'roadmap',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    });

    // Add click listener for pin placement
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
      
      // Add marker at clicked location
      addMarker(lat, lng, 'Pin Lokasi', 'waypoint');
    });

    setMap(mapInstance);
  }, [isLoaded, userLocation, viewMode, onLocationSelect]);

  // Update map type when viewMode changes
  useEffect(() => {
    if (map) {
      map.setMapTypeId(viewMode === 'satellite' ? 'satellite' : 'roadmap');
    }
  }, [map, viewMode]);

  // Add markers
  const addMarker = useCallback((lat: number, lng: number, title: string, type: 'farm' | 'waypoint' | 'poi') => {
    if (!map || !window.google) return;

    const iconConfig = {
      farm: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="white" stroke-width="3"/>
            <path d="M16 8L18 14H24L19 18L21 24L16 20L11 24L13 18L8 14H14L16 8Z" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
      waypoint: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      },
      poi: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      },
    };

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: title,
      icon: iconConfig[type],
      animation: window.google.maps.Animation.DROP,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${title}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            Lat: ${lat.toFixed(6)}<br/>
            Lng: ${lng.toFixed(6)}
          </p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      // Close other info windows
      markersRef.current.forEach(m => m.infoWindow?.close());
      infoWindow.open(map, marker);
    });

    markersRef.current.push({ marker, infoWindow });
    return marker;
  }, [map]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      addMarker(markerData.lat, markerData.lng, markerData.title, markerData.type);
    });
  }, [map, markers, addMarker]);

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (map) {
            map.setCenter(pos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden"
      />
      
      {/* Control buttons */}
      <div className="absolute top-2 right-2 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={getUserLocation}
          className="h-8 w-8 p-0 bg-white text-[#1F3A13] shadow-md hover:bg-gray-100"
          title="Use My Location"
        >
          <Target className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-2 left-2">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              <span>Klik pada peta untuk menambah pin</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};