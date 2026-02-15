
import React from 'react';
import { CurrentWeather as CurrentWeatherType, getWeatherIcon, getWeatherDescription } from '@/lib/weather';
import { Wind } from 'lucide-react';

interface CurrentWeatherProps {
    data: CurrentWeatherType;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
    const Icon = getWeatherIcon(data.weatherCode, data.isDay);
    const description = getWeatherDescription(data.weatherCode);

    return (
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 text-white shadow-lg flex flex-col items-center justify-center space-y-6 w-full max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300 border border-white/30">
            <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white/20 to-transparent rounded-full shadow-inner ring-1 ring-white/40">
                <Icon size={72} className="text-white drop-shadow-lg" />
            </div>
            <div className="text-center">
                <h2 className="text-7xl font-bold tracking-tighter drop-shadow-md">{Math.round(data.temperature)}°</h2>
                <p className="text-2xl font-light mt-2 drop-shadow-sm">{description}</p>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm">
                <Wind size={20} className="text-white/80" />
                <span className="text-sm font-medium">{data.windSpeed} km/h</span>
            </div>
        </div>
    );
};

export default CurrentWeather;
