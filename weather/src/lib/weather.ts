
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Moon, Sun } from 'lucide-react';

export interface DailyForecast {
  time: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  windSpeed: number;
}

export const getWeatherIcon = (code: number, isDay: boolean = true) => {
  if (code === 0) return isDay ? Sun : Moon;
  if ([1, 2, 3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;

  return Cloud;
};

export const getWeatherDescription = (code: number) => {
  const descriptions: Record<number, string> = {
    0: '晴朗',
    1: '主要晴朗',
    2: '多云',
    3: '阴天',
    45: '有雾',
    48: '沉积霜雾',
    51: '毛毛雨 (小)',
    53: '毛毛雨 (中)',
    55: '毛毛雨 (大)',
    56: '冻雨 (小)',
    57: '冻雨 (大)',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨 (小)',
    67: '冻雨 (大)',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '阵雨 (小)',
    81: '阵雨 (中)',
    82: '阵雨 (大)',
    85: '阵雪 (小)',
    86: '阵雪 (大)',
    95: '雷雨',
    96: '雷雨伴有冰雹',
    99: '大雷雨伴有冰雹',
  };
  return descriptions[code] || '未知天气';
};

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    const current: CurrentWeather = {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      windSpeed: data.current.wind_speed_10m,
    };

    const daily: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
      time,
      weatherCode: data.daily.weather_code[index],
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
    })).slice(1, 8);

    return { current, daily };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};
