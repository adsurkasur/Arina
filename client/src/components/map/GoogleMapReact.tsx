import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { getSpectraGrowApiBaseUrl } from '@/lib/spectraGrowApiBaseUrl';

// Fix: define libraries array outside the component to avoid performance warning
const GOOGLE_MAP_LIBRARIES = ['geometry', 'places'] as any;

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
  // Add for syncing location
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapChange?: (center: { lat: number; lng: number }, zoom: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: -6.2088, lng: 106.8456 };

export const GoogleMapReactComponent: React.FC<GoogleMapProps & { isFullScreen?: boolean }> = ({
  onLocationSelect,
  markers = [],
  viewMode = 'map',
  height = '300px',
  className = '',
  isFullScreen = false,
  center,
  zoom,
  onMapChange,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<MapMarker | null>(null);
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [prediction, setPrediction] = React.useState<any>(null); // State for prediction result
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Ensure mapTypeId is set on load
    if (viewMode === 'satellite') {
      map.setMapTypeId('satellite');
    } else {
      map.setMapTypeId('roadmap');
    }
  }, [viewMode]);

  // Ensure mapTypeId updates when viewMode changes
  useEffect(() => {
    if (mapRef.current) {
      if (viewMode === 'satellite') {
        mapRef.current.setMapTypeId('satellite');
      } else {
        mapRef.current.setMapTypeId('roadmap');
      }
    }
  }, [viewMode]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Add marker on map click (waypoint)
  const [waypoint, setWaypoint] = React.useState<{lat: number, lng: number} | null>(null);
  const fetchPrediction = async (lat: number, lon: number) => {
    try {
      const apiBaseUrl = getSpectraGrowApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/predict?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      alert("Failed to fetch prediction from backend");
    }
  };
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setWaypoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      if (onLocationSelect) {
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
      fetchPrediction(e.latLng.lat(), e.latLng.lng()); // Call backend after map click
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (mapRef.current) {
            mapRef.current.setCenter(pos);
            mapRef.current.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Custom marker icons
  const getIcon = (type: 'farm' | 'waypoint' | 'poi') => {
    if (type === 'farm') {
      return {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="white" stroke-width="3"/>
              <path d="M16 8L18 14H24L19 18L21 24L16 20L11 24L13 18L8 14H14L16 8Z" fill="white"/>
            </svg>
          `),
        scaledSize: new window.google.maps.Size(32, 32),
      };
    }
    if (type === 'waypoint') {
      return {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
        scaledSize: new window.google.maps.Size(24, 24),
      };
    }
    return {
      url:
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
      scaledSize: new window.google.maps.Size(24, 24),
    };
  };

  // Track last center/zoom to avoid unnecessary updates
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastZoomRef = useRef<number | null>(null);

  // Effect to update map center/zoom if props change (from parent)
  useEffect(() => {
    if (mapRef.current && center && zoom !== undefined) {
      const map = mapRef.current;
      const currCenter = map.getCenter();
      const currZoom = map.getZoom();
      // Only update if different (avoid loop)
      if (
        (!currCenter || currCenter.lat() !== center.lat || currCenter.lng() !== center.lng) ||
        currZoom !== zoom
      ) {
        map.setCenter(center);
        map.setZoom(zoom);
      }
    }
  }, [center, zoom]);

  // Handler for user panning/zooming
  useEffect(() => {
    if (!mapRef.current || !onMapChange) return;
    const map = mapRef.current;
    const handleIdle = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      if (!c) return;
      const newCenter = { lat: c.lat(), lng: c.lng() };
      // Only call if changed
      if (
        (!lastCenterRef.current || lastCenterRef.current.lat !== newCenter.lat || lastCenterRef.current.lng !== newCenter.lng) ||
        lastZoomRef.current !== (z ?? null)
      ) {
        lastCenterRef.current = newCenter;
        lastZoomRef.current = z ?? null;
        if (typeof z === 'number') {
          onMapChange(newCenter, z);
        }
      }
    };
    map.addListener('idle', handleIdle);
    return () => {
      window.google.maps.event.clearListeners(map, 'idle');
    };
  }, [onMapChange]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || userLocation || defaultCenter}
          zoom={zoom || 13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          mapTypeId={viewMode === 'satellite' ? 'satellite' : 'roadmap'}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
          onClick={handleMapClick}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={getIcon(marker.type)}
              onClick={() => setSelected(marker)}
            />
          ))}
          {waypoint && (
            <Marker
              position={waypoint}
              icon={getIcon('waypoint')}
              onClick={() => setSelected({
                id: 'waypoint',
                lat: waypoint.lat,
                lng: waypoint.lng,
                title: 'Pin Location',
                type: 'waypoint',
              })}
            />
          )}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ padding: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 'bold' }}>{selected.title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                  Lat: {selected.lat.toFixed(6)}<br />
                  Lng: {selected.lng.toFixed(6)}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
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
      <div className="absolute bottom-3 left-1">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Info className="h-3 w-3" />
              <span>{t('map.instructions')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Prediction result from backend */}
      {prediction && (
        isFullScreen ? (
          <div className="absolute bottom-3 right-1 max-w-xs bg-white/90 backdrop-blur-sm rounded shadow p-3 text-xs">
            <h1 className="text-sm font-bold mb-2 text-red-500">{t('map.testOnly')}</h1>
            <h3 className="font-bold mb-1">{t('map.classificationResult')}</h3>
            <div style={{padding: '0.25rem'}}>{t('map.predictedClass')}: <br /> {prediction.classification?.predicted_class}</div>
            <div style={{padding: '0.25rem'}}>{t('map.output')}: <br /> {Array.isArray(prediction.classification?.output) ? prediction.classification.output.map((item: any, idx: number) => (
              <span key={idx}>{item}<br /></span>
            )) : prediction.classification?.output}</div>
            <div style={{padding: '0.25rem'}}>{t('map.parameters')}: <br /> {Array.isArray(prediction.classification?.parameters) ? prediction.classification.parameters.map((item: any, idx: number) => (
              <span key={idx}>{item}<br /></span>
            )) : prediction.classification?.parameters}</div>
            <h3 className="font-bold mt-2 mb-1">{t('map.regressionResult')}</h3>
            <div style={{padding: '0.25rem'}}>{t('map.output')}: <br /> {Array.isArray(prediction.regression?.output) ? prediction.regression.output.map((item: any, idx: number) => (
              <span key={idx}>{item}<br /></span>
            )) : prediction.regression?.output}</div>
            <div style={{padding: '0.25rem'}}>{t('map.parameters')}: <br /> {Array.isArray(prediction.regression?.parameters) ? prediction.regression.parameters.map((item: any, idx: number) => (
              <span key={idx}>{item}<br /></span>
            )) : prediction.regression?.parameters} </div>
          </div>
        ) : (
          <div className="absolute bottom-3 right-1 max-w-xs bg-white/90 backdrop-blur-sm rounded shadow p-3 text-xs border border-dashed border-red-400 text-red-500 cursor-pointer select-none">
            <span>{t('map.useFullscreenPrediction')}</span>
          </div>
        )
      )}
    </div>
  );
};
