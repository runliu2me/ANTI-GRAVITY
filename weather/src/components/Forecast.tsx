
import React from 'react';
import { DailyForecast, getWeatherIcon, getWeatherDescription } from '@/lib/weather';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ForecastProps {
    data: DailyForecast[];
}

const Forecast: React.FC<ForecastProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-12">
            {data.map((day) => {
                const Icon = getWeatherIcon(day.weatherCode);
                return (
                    <div key={day.time} className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center justify-between text-white shadow-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:-translate-y-1">
                        <div className="text-center">
                            <p className="text-xl font-medium drop-shadow-sm">{format(new Date(day.time), 'EEEE', { locale: zhCN })}</p>
                            <p className="text-sm opacity-70 mb-2">{format(new Date(day.time), 'M月d日', { locale: zhCN })}</p>
                        </div>

                        <Icon size={48} className="my-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />

                        <div className="flex items-end space-x-4 w-full justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xs opacity-60 uppercase tracking-wider">最高</span>
                                <span className="font-bold text-2xl">{Math.round(day.maxTemp)}°</span>
                            </div>
                            <div className="w-px h-8 bg-white/20 mx-2"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs opacity-60 uppercase tracking-wider">最低</span>
                                <span className="opacity-90 text-xl font-medium">{Math.round(day.minTemp)}°</span>
                            </div>
                        </div>
                        <p className="text-sm mt-4 opacity-80 bg-black/10 px-3 py-1 rounded-full">{getWeatherDescription(day.weatherCode)}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default Forecast;
