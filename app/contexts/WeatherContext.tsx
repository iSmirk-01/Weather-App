"use client";

import { useState, createContext, useContext, useEffect } from "react";
import useDebounce from "../functions/useDebounce";

type Suggestions = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  id: number;
  region: string;
};

type WeatherData = {
  location: {
    name: string;
    country: string;
  };
  current: {
    condition: {
      text: string;
      icon: string;
    };
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    wind_mph: number;
    wind_dir: string;
    humidity: number;
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
        maxwind_mph: number;
        maxwind_kph: number;
        uv: number;
      };
      hour: {
        time: string;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        wind_mph: number;
        wind_kph: number;
        humidity: number;
        feelslike_c: number;
        feelslike_f: number;
      }[];
    }[];
  };
} | null;

interface HourlyWeather {
  time: string;
  temp_c: number;
  temp_f: number;
  humidity: number;
  condition: {
    text: string;
    icon: string;
  };
}

interface WeatherContextType {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  weather: WeatherData | null;
  suggestions: Suggestions[];
  fetchWeather: (lat?: number, lon?: number) => void;
  next8HoursData: HourlyWeather[];
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState<string>("");
  const debouncedSuggestion = useDebounce(query, 500);
  const [weather, setWeather] = useState<WeatherData>(null);
  const [suggestions, setSuggestions] = useState<Suggestions[]>([]);
  const [next8HoursData, setNext8HourData] = useState<HourlyWeather[] | []>([]);
  const key = process.env.NEXT_PUBLIC_API_KEY;

  // fetch weather by suggestions and default to new_york
  const fetchWeather = async (
    lat: number = 40.73061,
    lon: number = -73.935242
  ) => {
    try {
      const response = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=4&aqi=no&alerts=no`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //fetch suggestions by user input
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    if (debouncedSuggestion) {
      const fetchSuggestions = async () => {
        try {
          const res = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${key}&q=${debouncedSuggestion}`
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    }
  }, [debouncedSuggestion, key, query]);

  //function that gets the next 8 hours of current day
  const getNext8HoursWeather = (): HourlyWeather[] => {
    if (!weather || !weather.forecast) {
      return [];
    }

    const formatDateExact = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        
        return `${year}-${month}-${day} ${hours}:00`;
    };
    
    //gets current date and increase by 1 hour
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    //formats the date to match api
    const currentTime = formatDateExact(currentDate);

    const todayForecast = weather.forecast.forecastday[0];

    //uses current currentTime to find the currents index
    const currentHourIndex = todayForecast.hour.findIndex((hour) =>
      hour.time.startsWith(currentTime)
    );

    if (currentHourIndex === -1) {
      console.warn("Current hour not found in API data.");
      return [];
    }

    // uses slice to get the next 8 hours
    return todayForecast.hour.slice(currentHourIndex, currentHourIndex + 8);
  };
// fetches next8hours once weather api state loads
  useEffect(() => {
    if (weather) {
      const data = getNext8HoursWeather();
      setNext8HourData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather]);

  return (
    <WeatherContext.Provider
      value={{
        query,
        setQuery,
        weather,
        suggestions,
        fetchWeather,
        next8HoursData,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within WeatherProvider");
  }
  return context;
};
