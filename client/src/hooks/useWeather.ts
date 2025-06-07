import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  highTemp: number;
  lowTemp: number;
  icon: string;
  location: string;
}

interface WeatherError {
  message: string;
  code?: string;
}

export const useWeather = (lat?: number, lon?: number) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WeatherError | null>(null);

  // Google Maps API key for Weather API
  const API_KEY = import.meta.env.VITE_GOOGLE_WEATHER_API_KEY;

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      // Google Weather API current conditions endpoint
      const response = await fetch(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}&unitsSystem=METRIC`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Map Google Weather API response to WeatherData
      const weatherData: WeatherData = {
        temperature: Math.round(data.temperature?.degrees ?? 0),
        condition: data.weatherCondition?.description?.text || 'Unknown',
        humidity: Math.round(data.relativeHumidity ?? 0),
        windSpeed: Math.round(data.wind?.speed?.value ?? 0),
        highTemp: Math.round(data.currentConditionsHistory?.maxTemperature?.degrees ?? data.temperature?.degrees ?? 0),
        lowTemp: Math.round(data.currentConditionsHistory?.minTemperature?.degrees ?? data.temperature?.degrees ?? 0),
        icon: data.weatherCondition?.iconBaseUri || '',
        location: data.timeZone?.id || 'Unknown',
      };

      setWeatherData(weatherData);
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to fetch weather data',
        code: err.code
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise<{lat: number, lon: number}>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  useEffect(() => {
    const initWeather = async () => {
      try {
        if (lat && lon) {
          await fetchWeather(lat, lon);
        } else {
          const location = await getCurrentLocation();
          await fetchWeather(location.lat, location.lon);
        }
      } catch (err: any) {
        setError({
          message: err.message || 'Failed to get location',
          code: 'LOCATION_ERROR'
        });
        setLoading(false);
      }
    };

    initWeather();

    // Set up interval to refresh weather data every 10 minutes
    const interval = setInterval(() => {
      if (lat && lon) {
        fetchWeather(lat, lon);
      } else {
        getCurrentLocation()
          .then(location => fetchWeather(location.lat, location.lon))
          .catch(err => console.error('Failed to refresh weather:', err));
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [lat, lon, API_KEY]);

  const refreshWeather = async () => {
    try {
      if (lat && lon) {
        await fetchWeather(lat, lon);
      } else {
        const location = await getCurrentLocation();
        await fetchWeather(location.lat, location.lon);
      }
    } catch (err: any) {
      setError({
        message: err.message,
        code: 'REFRESH_ERROR'
      });
    }
  };

  return {
    weatherData,
    loading,
    error,
    refreshWeather
  };
};