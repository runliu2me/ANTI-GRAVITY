'use client';

import React, { useEffect, useState } from 'react';
import { fetchWeatherData, WeatherData } from '@/lib/weather';
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import WeatherChart from './WeatherChart';
import { Loader2, MapPin, RefreshCw } from 'lucide-react';

const WeatherDashboard: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState('定位中...');

    const fetchLocationName = async (lat: number, lon: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
            );
            const data = await response.json();
            // Try to get specific locality: locality -> city -> principalSubdivision -> countryName
            // User asked for "specific to you, then next administrative level".
            // BigDataCloud returns: city, locality, principalSubdivision, etc.
            // Example: locality="Haidian District", city="Beijing", principalSubdivision="Beijing"
            // Let's combine meaningful parts.
            const parts = [];
            if (data.city && data.city !== data.principalSubdivision) parts.push(data.city); // e.g. Seattle
            if (data.locality && data.locality !== data.city) parts.push(data.locality); // e.g. District
            if (data.principalSubdivision) parts.push(data.principalSubdivision); // e.g. Washington or Beijing

            // Filter duplicates and empty
            const uniqueParts = [...new Set(parts)].filter(Boolean);

            if (uniqueParts.length > 0) {
                // Return at most 2 levels to avoid too long string, e.g. "Seattle, Washington" or "Haidian, Beijing"
                return uniqueParts.slice(0, 2).join(', ');
            }

            return '未知地点';
        } catch (e) {
            console.error('Reverse geocoding failed', e);
            return '我的位置';
        }
    };

    const loadWeather = async (lat: number, lon: number, name: string) => {
        setLoading(true);
        setError(null);
        try {
            let finalName = name;
            // If name is generic 'My Location', try to resolve it
            if (name === '我的位置') {
                const resolvedName = await fetchLocationName(lat, lon);
                if (resolvedName !== '未知地点') {
                    finalName = resolvedName;
                }
            }

            const data = await fetchWeatherData(lat, lon);
            setWeather(data);
            setLocationName(finalName);
        } catch (err) {
            setError('无法获取天气数据，请检查网络连接。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Attempt geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadWeather(position.coords.latitude, position.coords.longitude, '我的位置');
                },
                (err) => {
                    console.warn("Geolocation denied or failed:", err);
                    // Fallback to Beijing
                    loadWeather(39.9042, 116.4074, '北京 (默认)');
                }
            );
        } else {
            loadWeather(39.9042, 116.4074, '北京 (默认)');
        }
    }, []);

    const handleRefresh = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadWeather(position.coords.latitude, position.coords.longitude, '我的位置');
                },
                () => {
                    loadWeather(39.9042, 116.4074, '北京 (默认)');
                }
            );
        } else {
            loadWeather(39.9042, 116.4074, '北京 (默认)');
        }
    };

    if (loading && !weather) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-lg font-light tracking-widest animate-pulse">正在获取天气信息...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white px-4">
                <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-2xl backdrop-blur-md text-center max-w-md">
                    <h3 className="text-xl font-bold mb-2">出错了</h3>
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center justify-center mx-auto"
                    >
                        <RefreshCw size={18} className="mr-2" /> 重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-12 flex flex-col items-center max-w-5xl">
            <header className="w-full flex justify-between items-center mb-12">
                <div className="flex items-center text-white bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                    <MapPin size={18} className="mr-2 text-blue-200" />
                    <h1 className="text-lg font-medium tracking-wide">{locationName}</h1>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                    title="刷新天气"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            <main className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {weather && <CurrentWeather data={weather.current} />}
                {weather && <Forecast data={weather.daily.slice(0, 3)} />}
                {weather && <WeatherChart data={weather.daily} />}
            </main>

            <footer className="mt-16 text-white/40 text-sm font-light">
                Powered by OpenMeteo
            </footer>
        </div>
    );
};

export default WeatherDashboard;
