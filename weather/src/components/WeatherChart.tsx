
'use client';

import React from 'react';
import { DailyForecast } from '@/lib/weather';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface WeatherChartProps {
    data: DailyForecast[];
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
    const chartData = data.map(day => ({
        name: format(new Date(day.time), 'EEE', { locale: zhCN }),
        max: Math.round(day.maxTemp),
        min: Math.round(day.minTemp),
    }));

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-lg border border-white/20">
            <h3 className="text-white text-lg font-medium mb-4 pl-2 border-l-4 border-white/50">未来 7 天气温趋势</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#fca5a5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.7)"
                            tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.7)"
                            tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            axisLine={false}
                            tickLine={false}
                            unit="°"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '12px', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number | string | Array<number | string> | undefined) => {
                                if (typeof value === 'number') {
                                    return [`${value}°`, ''];
                                }
                                if (value === undefined) return ['--', ''];
                                return [value, ''];
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="max"
                            stroke="#fca5a5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMax)"
                            name="最高温"
                        />
                        <Area
                            type="monotone"
                            dataKey="min"
                            stroke="#93c5fd"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMin)"
                            name="最低温"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeatherChart;
