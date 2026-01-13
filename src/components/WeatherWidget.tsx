'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=39.7446&longitude=-8.8063&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        const current = data.current;

        // Map WMO weather codes to conditions
        const weatherConditions: { [key: number]: string } = {
          0: 'Limpo',
          1: 'Maioritariamente Limpo',
          2: 'Parcialmente Nublado',
          3: 'Nublado',
          45: 'Nevoeiro',
          48: 'Nevoeiro',
          51: 'Chuviscos Leves',
          53: 'Chuviscos',
          55: 'Chuviscos Fortes',
          61: 'Chuva Leve',
          63: 'Chuva',
          65: 'Chuva Forte',
          71: 'Neve Leve',
          73: 'Neve',
          75: 'Neve Forte',
          77: 'Granizo',
          80: 'Aguaceiros Leves',
          81: 'Aguaceiros',
          82: 'Aguaceiros Fortes',
          85: 'Aguaceiros de Neve Leves',
          86: 'Aguaceiros de Neve',
          95: 'Trovoada',
          96: 'Trovoada com Granizo',
          99: 'Trovoada com Granizo',
        };

        const weatherIcons: { [key: number]: string } = {
          0: '☀️',
          1: '🌤️',
          2: '⛅',
          3: '☁️',
          45: '🌫️',
          48: '🌫️',
          51: '🌦️',
          53: '🌦️',
          55: '🌧️',
          61: '🌦️',
          63: '🌧️',
          65: '⛈️',
          71: '🌨️',
          73: '🌨️',
          75: '🌨️',
          77: '🌨️',
          80: '🌦️',
          81: '🌧️',
          82: '⛈️',
          85: '🌨️',
          86: '🌨️',
          95: '⛈️',
          96: '⛈️',
          99: '⛈️',
        };

        const condition =
          weatherConditions[current.weather_code] || 'Desconhecido';
        const icon = weatherIcons[current.weather_code] || '🌡️';

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          icon,
        });
      } catch (err) {
        console.warn('Weather fetch error:', err);
        setError('Não foi possível carregar o tempo');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-w-[220px]"
      >
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
      </motion.div>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 border border-blue-200 min-w-[220px] backdrop-blur-sm bg-opacity-90 transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
            Leiria, Portugal
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {weather.temp}°C
              </p>
              <p className="text-xs text-gray-600">{weather.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/60 rounded px-2 py-1">
              <p className="text-gray-500">Humidade</p>
              <p className="font-semibold text-gray-700">{weather.humidity}%</p>
            </div>
            <div className="bg-white/60 rounded px-2 py-1">
              <p className="text-gray-500">Vento</p>
              <p className="font-semibold text-gray-700">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
