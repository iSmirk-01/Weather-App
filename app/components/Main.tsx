"use client";

import { useEffect, useRef, useState } from "react";
import { useWeather } from "../contexts/WeatherContext";
import { FaTemperatureHigh } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import { FaWind } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import { FaCloudRain } from "react-icons/fa";
import timeConverter from "../functions/timeConverter";
import TempIcon from "./TempIcon";
import Image from "next/image";

function Main() {
  const {
    query,
    setQuery,
    suggestions,
    weather,
    fetchWeather,
    next8HoursData,
  } = useWeather();
  const searchRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFah, setIsFah] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Close suggestions on outside click
  useEffect(() => {
    const currentSearchRef = searchRef.current;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        currentSearchRef &&
        !currentSearchRef.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

   document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  //click function that handles converting temps
  const handleClickSwitch = () => {
    setIsFah((prev) => !prev);
  };

  //once api state loads set loading to false
  useEffect(() => {
    if (weather) {
      setLoading(false);
    }
  }, [weather]);

  return (
    <div className="min-h-screen w-full bg-orange-500 flex flex-col items-center justify-center text-black">
      <div className="flex flex-col items-center w-full min-h-screen rounded gap-5">
        <header className="w-full flex flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold text-white pt-3">
            Weather App
          </h1>
          <div className="relative w-[60%]" ref={searchRef}>
            <input
              type="text"
              placeholder="Enter city name"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onFocus={() => setShowSuggestions(true)}
              value={query}
              className="border rounded shadow px-3 py-2 w-full outline-none text-center"
            />
            {/* Suggestions List */}
            {showSuggestions && (
              <ul className="absolute top-full left-0 bg-zinc-500 text-white rounded p-3 flex-col gap-3 shadow-md w-full z-20">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => {
                        fetchWeather(suggestion.lat, suggestion.lon);
                        setShowSuggestions(false);
                        setQuery("");
                      }}
                      className="cursor-pointer hover:bg-orange-300/50 p-2 rounded text-center"
                    >
                      {`${suggestion.name} - ${suggestion.region}`}
                    </li>
                  ))
                ) : (
                  <li className="text-center text-white">
                    No suggestions available
                  </li>
                )}
              </ul>
            )}
          </div>
        </header>
        {/* Current Weather */}
        <main className="flex relative flex-col items-center w-full min-h-screen bg-zinc-700 text-white p-5 rounded-t gap-10">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-lg font-semibold">
              {loading
                ? "Loading..."
                : `${weather?.location.name} - ${weather?.location.country}`}
            </h1>
            {/* toggle button */}
            <button
              onClick={handleClickSwitch}
              className="cursor-pointer bg-orange-500 hover:bg-orange-300 text-white px-4 py-2 rounded font-semibold"
            >
              Toggle °F/°C
            </button>
          </div>
          {/* Skeleton Loader for Weather */}
          {loading ? (
            <div className="w-full p-4 bg-gray-300 animate-pulse rounded">
              <div className="h-12 bg-gray-400 rounded w-3/4 mb-4"></div>
              <div className="h-24 bg-gray-400 rounded mb-4"></div>
              <div className="flex justify-between gap-4">
                <div className="h-8 bg-gray-400 rounded w-1/3"></div>
                <div className="h-8 bg-gray-400 rounded w-1/3"></div>
                <div className="h-8 bg-gray-400 rounded w-1/3"></div>
              </div>
            </div>
          ) : (
            // todays
            <ul className="flex flex-col items-center">
              <h1 className="font-bold text-2xl pb-10">Todays weather</h1>
              <li>
                <Image
                  width={50}
                  height={80}
                  src={`https:${weather?.current.condition.icon}`}
                  alt="Weather Icon"
                />
              </li>
              <li className="font-semibold text-lg">
                Weather is {weather?.current.condition.text}
              </li>
              <div className="flex flex-wrap justify-between w-full gap-4 p-3 text-lg">
                <div className="flex items-center gap-2">
                  <TempIcon
                    value="Temperature"
                    iconClass="text-red-500"
                    iconName={FaTemperatureHigh}
                  />
                  <li>
                    {isFah ? weather?.current.temp_f : weather?.current.temp_c}
                    {isFah ? "°F" : "°C"}
                  </li>
                </div>
                <div className="flex items-center gap-1">
                  <TempIcon
                    iconClass="text-blue-400 text-2xl"
                    value="Humidity"
                    iconName={WiHumidity}
                  />
                  <li>{weather?.current.humidity}%</li>
                </div>
                <div>
                  <div className="flex gap-1 items-center">
                    <TempIcon
                      value="Wind + direction"
                      iconClass=""
                      iconName={FaWind}
                    />
                    <li>{weather?.current.wind_mph} mph</li>
                    <li className="font-semibold">
                      {weather?.current.wind_dir.slice(1, 3)}
                    </li>
                  </div>
                </div>
              </div>
            </ul>
          )}
          <hr className="w-full border-gray-500" />
          {/* Hourly Weather */}
          <h1 className="flex text-2xl font-bold mt-">Todays Hourly Weather</h1>
          {loading ? (
            <div className="grid grid-cols-4 grid-rows-2 lg:grid-rows-2 lg:grid-cols-4 w-full gap-2 mt-5">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="p-7 bg-gray-300 animate-pulse rounded"
                >
                  <div className="h-16 bg-gray-400 rounded mb-3"></div>
                  <div className="h-8 bg-gray-400 rounded mb-3"></div>
                  <div className="h-6 bg-gray-400 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : next8HoursData && next8HoursData.length > 0 ? (
            // todays hourly
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
              {next8HoursData.map((hour, index: number) => (
                <ul
                  key={index}
                  className={
                    "flex flex-col p-7 justify-center items-center gap-2 border border-gray-500"
                  }
                >
                  <div className="flex flex-col">
                    <Image
                      src={`https:${hour.condition.icon}`}
                      alt="Condition icon"
                      width={50}
                      height={80}
                      className="self-center"
                    />
                    <li>Weather is {hour.condition.text}</li>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <TempIcon
                        iconClass="text-red-500"
                        value="Temperature"
                        iconName={FaTemperatureHigh}
                      />
                      <li>
                        {isFah ? hour.temp_f : hour.temp_c}{" "}
                        {isFah ? "°F" : "°C"}
                      </li>
                    </div>
                    <div className="flex items-center gap-1">
                      <TempIcon
                        iconClass="text-blue-300 text-2xl"
                        value="Humidity"
                        iconName={WiHumidity}
                      />
                      <li>{hour.humidity}%</li>
                    </div>
                  </div>
                  <div>
                    <li>{timeConverter(hour.time.split(" ")[1])}</li>
                  </div>
                </ul>
              ))}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center flex-col gap-10">
              <div className="font-bold text-lg">
                No Hours to display currently
              </div>
              <hr className="w-full border-gray-500" />
            </div>
          )}
          {/* 4 day forecast */}
          {loading ? (
            <div className="grid grid-cols-4 gap-5 w-full mt-9">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-300 animate-pulse rounded"
                >
                  <div className="h-16 bg-gray-400 rounded mb-3"></div>
                  <div className="h-8 bg-gray-400 rounded mb-3"></div>
                  <div className="h-6 bg-gray-400 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full p-4">
              <h1 className="font-semibold text-2xl text-center p-2">
                Next 4 days
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
                {weather?.forecast.forecastday.map((day, index) => (
                  <ul
                    key={index}
                    className="flex flex-col items-center p-4 w-full border border-gray-500"
                  >
                    <Image
                      src={`https:${day.day.condition.icon}`}
                      alt="Condition icon"
                      width={50}
                      height={80}
                    />
                    <li>{day.day.condition.text}</li>
                    <div className="flex gap-4 p-1">
                      <div className="flex items-center gap-2">
                        <TempIcon
                          iconName={FaTemperatureHigh}
                          value="Temperature"
                          iconClass="text-red-500"
                        />
                        <li>
                          {isFah ? day.day.avgtemp_f : day.day.avgtemp_c}{" "}
                          {isFah ? "°F" : "°C"}
                        </li>
                      </div>
                      <div className="flex items-center gap-2">
                        <TempIcon
                          iconClass="text-blue-500"
                          value="Chance of rain"
                          iconName={FaCloudRain}
                        />
                        <li>{day.day.daily_chance_of_rain}%</li>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TempIcon
                        iconClass="text-orange-500"
                        iconName={FaCalendarDays}
                        value="Day"
                      />
                      <li>{day.date.slice(8)}</li>
                    </div>
                  </ul>
                ))}
              </div>
            </div>
          )}
        </main>
        <footer className="text-center text-white/70 mt-4 p-4">
          © 2025 Federico Aguirre. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Main;
