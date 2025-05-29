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

  // OpenWeatherMap API key - Ganti dengan API key Anda
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=id`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        highTemp: Math.round(data.main.temp_max),
        lowTemp: Math.round(data.main.temp_min),
        icon: data.weather[0].icon,
        location: data.name
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
          // Use provided coordinates
          await fetchWeather(lat, lon);
        } else {
          // Get current location
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