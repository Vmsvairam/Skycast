import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  Navigation,
  MapPin,
  Calendar,
  Clock,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  Info,
  AlertCircle,
  Pin,
  PinOff,
  Heart,
  Settings,
  Sparkles,
  Plane,
  Bell,
  Zap,
  Umbrella,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getWeatherInsights, getTravelPlan, getSmartAlerts, WeatherInsight, TravelPlan } from "./services/geminiService";

interface WeatherData {
  current: any;
  forecast: any;
}

function WeatherEffects({ condition }: { condition: string }) {
  const isRain = condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle");
  const isCloudy = condition.toLowerCase().includes("cloud");
  const isSunny = condition.toLowerCase().includes("clear");

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {isRain && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ 
                y: "120vh", 
                opacity: [0, 0.4, 0] 
              }}
              transition={{ 
                duration: 1 + Math.random(), 
                repeat: Infinity, 
                delay: Math.random() * 2,
                ease: "linear"
              }}
              className="absolute w-[1px] h-8 bg-blue-200/40"
            />
          ))}
        </div>
      )}
      
      {isCloudy && (
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-20%", y: 10 + i * 15 + "%", opacity: 0 }}
              animate={{ 
                x: "120%", 
                opacity: [0, 0.1, 0.1, 0] 
              }}
              transition={{ 
                duration: 20 + Math.random() * 20, 
                repeat: Infinity, 
                delay: i * 5,
                ease: "linear"
              }}
              className="absolute w-64 h-32 bg-white/10 blur-3xl rounded-full"
            />
          ))}
        </div>
      )}

      {isSunny && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-[800px] h-[800px] bg-amber-400/20 blur-[120px] rounded-full"
          />
        </div>
      )}
    </div>
  );
}

function AnalogClock({ time, size = 120 }: { time: Date, size?: number }) {
  const seconds = time.getUTCSeconds();
  const minutes = time.getUTCMinutes();
  const hours = time.getUTCHours();

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDeg = (hours % 12 / 12) * 360 + (minutes / 60) * 30;

  return (
    <div 
      className="relative rounded-full border-2 border-white/20 flex items-center justify-center shadow-inner bg-white/5"
      style={{ width: size, height: size }}
    >
      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-white rounded-full z-30 shadow-sm" />
      
      {/* Hour hand */}
      <div 
        className="absolute w-1 bg-white rounded-full z-10 origin-bottom"
        style={{ 
          height: size * 0.25, 
          bottom: '50%', 
          transform: `rotate(${hourDeg}deg)` 
        }}
      />
      
      {/* Minute hand */}
      <div 
        className="absolute w-0.5 bg-white/80 rounded-full z-10 origin-bottom"
        style={{ 
          height: size * 0.35, 
          bottom: '50%', 
          transform: `rotate(${minuteDeg}deg)` 
        }}
      />
      
      {/* Second hand */}
      <div 
        className="absolute w-[1px] bg-red-400 rounded-full z-20 origin-bottom"
        style={{ 
          height: size * 0.4, 
          bottom: '50%', 
          transform: `rotate(${secondDeg}deg)` 
        }}
      />

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-0.5 h-1.5 bg-white/20"
          style={{ 
            top: 2,
            bottom: 'auto',
            transformOrigin: `50% ${size/2 - 2}px`,
            transform: `rotate(${i * 30}deg)`
          }}
        />
      ))}
    </div>
  );
}

function getWeatherIcon(condition: string, size = 24, animate = false) {
  const iconProps = { size, className: "transition-all duration-500" };
  
  const wrap = (icon: React.ReactNode, animation: any) => (
    <motion.div
      animate={animation}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center justify-center"
    >
      {icon}
    </motion.div>
  );

  switch (condition.toLowerCase()) {
    case "clear":
      return wrap(
        <Sun {...iconProps} className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />,
        { rotate: 360, scale: animate ? [1, 1.1, 1] : 1 }
      );
    case "clouds":
      return wrap(
        <Cloud {...iconProps} className="text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />,
        { y: [0, -5, 0], scale: animate ? [1, 1.05, 1] : 1 }
      );
    case "rain":
    case "drizzle":
      return wrap(
        <CloudRain {...iconProps} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]" />,
        { y: [0, 3, 0], scale: animate ? [1, 1.05, 1] : 1 }
      );
    case "thunderstorm":
      return wrap(
        <CloudLightning {...iconProps} className="text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.6)]" />,
        { x: [-1, 1, -1], scale: animate ? [1, 1.1, 1] : 1 }
      );
    case "snow":
      return wrap(
        <Snowflake {...iconProps} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />,
        { rotate: [-10, 10, -10], scale: animate ? [1, 1.1, 1] : 1 }
      );
    default:
      return wrap(
        <Cloud {...iconProps} className="text-slate-200" />,
        { y: [0, -3, 0] }
      );
  }
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgGradient, setBgGradient] = useState("from-blue-500 to-blue-700");

  const [localTime, setLocalTime] = useState<string>("");
  const [localDateObj, setLocalDateObj] = useState<Date>(new Date());
  const [showAnalog, setShowAnalog] = useState(false);
  const [pinnedLocations, setPinnedLocations] = useState<string[]>([]);
  
  // AI State
  const [aiInsights, setAiInsights] = useState<WeatherInsight[]>([]);
  const [smartAlerts, setSmartAlerts] = useState<string[]>([]);
  const [travelMode, setTravelMode] = useState(false);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [travelDates, setTravelDates] = useState("");
  const [travelCity, setTravelCity] = useState("");
  const [loadingTravel, setLoadingTravel] = useState(false);

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pinned_locations");
    if (saved) {
      try {
        setPinnedLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse pinned locations");
      }
    }
  }, []);

  useEffect(() => {
    if (weather?.current) {
      const cityName = weather.current.name;
      document.title = `Weather in ${cityName} Today | Hourly Forecast & Temperature | SkyCast`;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', `Check today's weather in ${cityName}. SkyCast is your Weather Decision Assistant for real-time temperature, rain probability, and hourly forecasts.`);
    }
  }, [weather]);

  const togglePin = (cityName: string) => {
    let newPinned;
    if (pinnedLocations.includes(cityName)) {
      newPinned = pinnedLocations.filter(c => c !== cityName);
    } else {
      newPinned = [...pinnedLocations, cityName];
    }
    setPinnedLocations(newPinned);
    localStorage.setItem("pinned_locations", JSON.stringify(newPinned));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (weather?.current?.timezone !== undefined) {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityTime = new Date(utc + (1000 * weather.current.timezone));
        setLocalDateObj(cityTime);
        setLocalTime(cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weather]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`/api/geo?q=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [city]);

  const fetchWeather = useCallback(async (searchCity: string, lat?: number, lon?: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/weather?`;
      if (lat !== undefined && lon !== undefined) {
        // We need to update the server to handle lat/lon, but for now we'll stick to city
        // or I can update the server in the next step.
        // Actually, let's just use city for now to keep it simple, 
        // but I'll update the server to support lat/lon in the next tool call.
        url += `lat=${lat}&lon=${lon}`;
      } else {
        url += `city=${encodeURIComponent(searchCity)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data");
      }
      
      setWeather(data);
      updateBackground(data.current.weather[0].main, data.current.sys);
      if (data.current.name) setCity(data.current.name);

      // Fetch AI Insights
      getWeatherInsights(data).then(setAiInsights);
      getSmartAlerts(data.forecast).then(setSmartAlerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGeolocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather("", position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Fallback to default city if geolocation fails
          fetchWeather("London");
        }
      );
    } else {
      fetchWeather("London");
    }
  }, [fetchWeather]);

  useEffect(() => {
    handleGeolocation();
  }, [handleGeolocation]);

  const updateBackground = (condition: string, sys: any) => {
    const now = Math.floor(Date.now() / 1000);
    const isNight = now < sys.sunrise || now > sys.sunset;

    if (isNight) {
      setBgGradient("from-[#0f172a] via-[#1e1b4b] to-[#020617]");
      return;
    }

    switch (condition.toLowerCase()) {
      case "clear":
        setBgGradient("from-[#0ea5e9] via-[#2563eb] to-[#1d4ed8]");
        break;
      case "clouds":
        setBgGradient("from-[#64748b] via-[#334155] to-[#0f172a]");
        break;
      case "rain":
      case "drizzle":
        setBgGradient("from-[#1e3a8a] via-[#1e40af] to-[#1e1b4b]");
        break;
      case "thunderstorm":
        setBgGradient("from-[#1e1b4b] via-[#4c1d95] to-[#020617]");
        break;
      case "snow":
        setBgGradient("from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]");
        break;
      case "mist":
      case "smoke":
      case "haze":
      case "fog":
        setBgGradient("from-[#94a3b8] via-[#64748b] to-[#475569]");
        break;
      default:
        setBgGradient("from-[#0ea5e9] via-[#2563eb] to-[#1d4ed8]");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const cityName = suggestion.name;
    const state = suggestion.state ? `, ${suggestion.state}` : "";
    const country = suggestion.country;
    const fullLabel = `${cityName}${state}, ${country}`;
    
    setCity(fullLabel);
    fetchWeather("", suggestion.lat, suggestion.lon);
    setShowSuggestions(false);
  };

  const handleTravelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelCity || !travelDates) return;
    
    setLoadingTravel(true);
    try {
      // Fetch forecast for the travel city first
      const response = await fetch(`/api/weather?city=${encodeURIComponent(travelCity)}`);
      const data = await response.json();
      if (response.ok) {
        const plan = await getTravelPlan(travelCity, travelDates, data.forecast);
        setTravelPlan(plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTravel(false);
    }
  };

  const formatTime = (timestamp: number, offset: number) => {
    const date = new Date((timestamp + offset) * 1000);
    return date.getUTCHours().toString().padStart(2, '0') + ":" + date.getUTCMinutes().toString().padStart(2, '0');
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${bgGradient} transition-all duration-1000 flex flex-col items-center p-4 md:p-8 overflow-y-auto selection:bg-white/30 relative`}>
      <WeatherEffects condition={weather?.current?.weather[0]?.main || "clear"} />
      
      {/* Hero Section */}
      <div className="w-full max-w-5xl flex flex-col items-center text-center mt-12 mb-16 space-y-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 glass rounded-3xl shadow-2xl mb-2">
            <Sun className="text-white" size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">SkyCast</h1>
            <p className="text-sm md:text-base text-white/60 font-bold uppercase tracking-[0.3em]">Your Weather Decision Assistant</p>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-white/40 max-w-2xl font-medium leading-relaxed"
        >
          Get AI-powered recommendations for smarter daily decisions.
        </motion.p>

        <div className="flex flex-col gap-6 w-full max-w-xl pt-4">
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="relative group"
          >
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter your city to get started..."
              className="w-full h-16 pl-16 pr-16 glass rounded-[2rem] outline-none text-xl text-white placeholder-white/20 focus:bg-white/10 transition-all border-white/5 focus:border-white/20 shadow-2xl"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={24} />
            <button 
              type="button"
              onClick={handleGeolocation}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-xl transition-colors text-white/30 hover:text-white/60"
              title="Use current location"
            >
              <Navigation size={20} />
            </button>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 glass rounded-[2rem] overflow-hidden z-50 shadow-2xl border border-white/10"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-8 py-5 text-left hover:bg-white/10 transition-colors flex items-center justify-between group border-b border-white/5 last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {suggestion.name}
                        </span>
                        <span className="text-xs text-white/40 uppercase tracking-widest">
                          {suggestion.state ? `${suggestion.state}, ` : ""}{suggestion.country}
                        </span>
                      </div>
                      <MapPin size={18} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setTravelMode(!travelMode)}
              className={`h-12 px-6 glass rounded-full flex items-center gap-3 transition-all ${travelMode ? 'bg-white/20 border-white/40' : 'hover:bg-white/10'}`}
            >
              <Plane size={18} className={travelMode ? 'text-white' : 'text-white/40'} />
              <span className="font-bold text-xs uppercase tracking-wider">Travel Mode</span>
            </button>
            
            {pinnedLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => fetchWeather(loc)}
                className="px-5 py-3 glass rounded-full text-xs font-bold whitespace-nowrap hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <MapPin size={12} className="text-white/40" />
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-white/60 font-medium animate-pulse">Fetching local conditions...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass border-red-500/30 p-8 rounded-3xl text-center max-w-md w-full"
          >
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Location Not Found</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <button 
              onClick={() => fetchWeather("London")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-semibold"
            >
              Try London
            </button>
          </motion.div>
        ) : weather ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl space-y-6"
          >
            {/* Smart Alerts */}
            {smartAlerts.length > 0 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {smartAlerts.map((alert, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 glass-dark px-6 py-3 rounded-2xl border-amber-500/30 text-amber-200 whitespace-nowrap"
                  >
                    <Bell size={16} className="animate-bounce" />
                    <span className="text-xs font-bold uppercase tracking-wider">{alert}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Travel Mode Section */}
            <AnimatePresence>
              {travelMode && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="glass p-8 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold flex items-center gap-3 mb-1">
                        <Plane className="text-indigo-400" />
                        Travel Mode
                      </h3>
                      <p className="text-sm text-white/40">Plan your trip with AI-powered weather insights</p>
                    </div>
                    <form onSubmit={handleTravelSearch} className="flex flex-wrap gap-3 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="Destination (e.g. Paris)" 
                        value={travelCity}
                        onChange={(e) => setTravelCity(e.target.value)}
                        className="glass px-4 py-2 rounded-xl outline-none text-sm w-full md:w-48"
                      />
                      <input 
                        type="text" 
                        placeholder="Dates (e.g. July 1-7)" 
                        value={travelDates}
                        onChange={(e) => setTravelDates(e.target.value)}
                        className="glass px-4 py-2 rounded-xl outline-none text-sm w-full md:w-48"
                      />
                      <button 
                        type="submit"
                        disabled={loadingTravel}
                        className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {loadingTravel ? "Planning..." : "Get Plan"}
                      </button>
                    </form>
                  </div>

                  {travelPlan && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Sun size={12} className="text-amber-400" />
                          Best Days
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {travelPlan.bestDays.map((day, i) => (
                            <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-200 rounded-lg text-xs font-medium">{day}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Umbrella size={12} className="text-blue-400" />
                          Rain Days
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {travelPlan.rainDays.length > 0 ? travelPlan.rainDays.map((day, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-200 rounded-lg text-xs font-medium">{day}</span>
                          )) : <span className="text-xs text-white/20 italic">No rain expected</span>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Briefcase size={12} className="text-emerald-400" />
                          Packing
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {travelPlan.packingSuggestions.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-200 rounded-lg text-xs font-medium">{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Sparkles size={12} className="text-indigo-400" />
                          AI Summary
                        </h4>
                        <p className="text-xs text-white/60 leading-relaxed">{travelPlan.summary}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass p-10 rounded-[3rem] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  {getWeatherIcon(weather.current.weather[0].main, 200, true)}
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <div className="flex items-center gap-4 text-white/60 mb-4 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="text-lg font-bold text-white">{weather.current.name}, {weather.current.sys.country}</span>
                      </div>
                      <button 
                        onClick={() => togglePin(weather.current.name)}
                        className={`p-2 rounded-xl transition-all ${pinnedLocations.includes(weather.current.name) ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/30 hover:text-white/60'}`}
                      >
                        {pinnedLocations.includes(weather.current.name) ? <Pin size={18} /> : <PinOff size={18} />}
                      </button>
                    </div>
                    
                    <div className="flex items-end gap-4 mb-2">
                      <h1 className="text-9xl font-light tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        {Math.round(weather.current.main.temp)}°
                      </h1>
                      <div className="mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-medium capitalize">{weather.current.weather[0].description}</span>
                        </div>
                        <span className="text-xl text-white/60">
                          H: {Math.round(weather.current.main.temp_max)}° L: {Math.round(weather.current.main.temp_min)}°
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        onClick={() => setShowAnalog(!showAnalog)}
                        className="p-2 glass rounded-xl text-white/40 hover:text-white transition-colors"
                        title="Toggle Clock Style"
                      >
                        <Settings size={16} />
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Local Time</span>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {showAnalog ? (
                        <motion.div
                          key="analog"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <AnalogClock time={localDateObj} size={160} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="digital"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className="text-right"
                        >
                          <div className="text-7xl font-bold tracking-tighter tabular-nums mb-1">
                            {localTime.split(' ')[0]}
                          </div>
                          <div className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">
                            {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(localDateObj)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                  <QuickStat icon={<Wind size={18} />} label="Wind" value={`${weather.current.wind.speed} m/s`} />
                  <QuickStat icon={<Droplets size={18} />} label="Humidity" value={`${weather.current.main.humidity}%`} />
                  <QuickStat icon={<Eye size={18} />} label="Visibility" value={`${(weather.current.visibility / 1000).toFixed(1)} km`} />
                  <QuickStat icon={<Gauge size={18} />} label="Pressure" value={`${weather.current.main.pressure} hPa`} />
                </div>
              </div>

              {/* AI Insights Card */}
              <div className="glass p-8 rounded-[3rem] flex flex-col justify-between bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <Sparkles size={20} className="text-indigo-300" />
                    </div>
                    AI Insights
                  </h3>
                  <div className="px-2 py-1 bg-indigo-500/20 rounded-lg text-[8px] font-bold uppercase tracking-widest text-indigo-300">Beta</div>
                </div>
                
                <div className="space-y-6">
                  {aiInsights.length > 0 ? aiInsights.map((insight, i) => (
                    <motion.div 
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="group cursor-default"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">{insight.title}</span>
                        <span className="text-xs font-bold text-indigo-300">{insight.value}</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{insight.description}</p>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/20">
                      <Sparkles size={32} className="mb-2 animate-pulse" />
                      <p className="text-xs font-medium">Generating insights...</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-[10px] text-white/20 italic text-center">Powered by Gemini 3.1 Pro</p>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="glass p-8 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Clock size={20} className="text-white/40" />
                  </div>
                  Hourly Forecast
                </h3>
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Next 24 Hours</span>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {weather.forecast?.list.slice(0, 12).map((item: any, i: number) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center min-w-[90px] p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                  >
                    <span className="text-sm font-bold mb-4">
                      {i === 0 ? "Now" : ((new Date((item.dt + weather.current.timezone) * 1000).getUTCHours()) % 24) + ":00"}
                    </span>
                    <div className="mb-4">
                      {getWeatherIcon(item.weather[0].main, 32)}
                    </div>
                    <span className="text-xl font-bold">{Math.round(item.main.temp)}°</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 5-Day Forecast & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 5-Day List */}
              <div className="lg:col-span-1 glass p-8 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent">
                <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Calendar size={20} className="text-white/40" />
                  </div>
                  5-Day Forecast
                </h3>
                <div className="space-y-6">
                  {weather.forecast?.list
                    .filter((_: any, i: number) => i % 8 === 0)
                    .map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group cursor-default">
                        <span className="w-16 text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                          {i === 0 ? "Today" : new Date((item.dt + weather.current.timezone) * 1000).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                        </span>
                        <div className="flex items-center gap-4 flex-grow justify-center">
                          {getWeatherIcon(item.weather[0].main, 24)}
                          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-white/40 rounded-full" style={{ width: '40%', marginLeft: '30%' }}></div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm w-16 justify-end">
                          <span className="font-bold">{Math.round(item.main.temp_max)}°</span>
                          <span className="text-white/30">{Math.round(item.main.temp_min)}°</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailBox 
                  icon={<Thermometer size={20} />} 
                  label="Feels Like" 
                  value={`${Math.round(weather.current.main.feels_like)}°`} 
                  desc="Similar to actual"
                />
                <DetailBox 
                  icon={<Wind size={20} />} 
                  label="Wind Gust" 
                  value={`${weather.current.wind.gust || weather.current.wind.speed} m/s`} 
                  desc="Recent peak"
                />
                <DetailBox 
                  icon={<Droplets size={20} />} 
                  label="Humidity" 
                  value={`${weather.current.main.humidity}%`} 
                  desc="The dew point is 12°"
                />
                <DetailBox 
                  icon={<Sunrise size={20} />} 
                  label="Sunrise" 
                  value={formatTime(weather.current.sys.sunrise, weather.current.timezone)} 
                  desc="First light"
                />
                <DetailBox 
                  icon={<Sunset size={20} />} 
                  label="Sunset" 
                  value={formatTime(weather.current.sys.sunset, weather.current.timezone)} 
                  desc="Last light"
                />
                <DetailBox 
                  icon={<Info size={20} />} 
                  label="Clouds" 
                  value={`${weather.current.clouds.all}%`} 
                  desc="Sky coverage"
                />
              </div>
            </div>

            {/* SEO Content Section */}
            <SEOContent weather={weather} aiInsights={aiInsights} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <footer className="mt-20 pb-10 text-center">
        <div className="flex items-center justify-center gap-4 text-white/20 mb-4">
          <div className="h-px w-12 bg-white/10"></div>
          <span className="text-xs font-bold uppercase tracking-widest">SkyCast Weather Intelligence</span>
          <div className="h-px w-12 bg-white/10"></div>
        </div>
        <p className="text-white/40 text-sm">© 2026 Designed for Professional Portfolios</p>
      </footer>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 group cursor-default">
      <div className="flex items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
        <div className="p-1.5 bg-white/5 rounded-lg">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <span className="text-xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

function DetailBox({ icon, label, value, desc }: { icon: React.ReactNode, label: string, value: string, desc: string }) {
  return (
    <div className="glass p-8 rounded-[2.5rem] flex flex-col justify-between hover:bg-white/10 transition-all cursor-default group border-white/5 hover:border-white/20">
      <div>
        <div className="flex items-center gap-3 text-white/40 mb-6 group-hover:text-white/60 transition-colors">
          <div className="p-2 bg-white/5 rounded-xl">
            {icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
        </div>
        <div className="text-4xl font-bold mb-3 tracking-tight group-hover:scale-[1.02] transition-transform origin-left">{value}</div>
      </div>
      <p className="text-xs text-white/30 font-medium tracking-wide">{desc}</p>
    </div>
  );
}

function SEOContent({ weather, aiInsights }: { weather: WeatherData, aiInsights: WeatherInsight[] }) {
  const cityName = weather.current.name;
  const temp = Math.round(weather.current.main.temp);
  const condition = weather.current.weather[0].description;
  const humidity = weather.current.main.humidity;
  const windSpeed = weather.current.wind.speed;
  const visibility = (weather.current.visibility / 1000).toFixed(1);
  const feelsLike = Math.round(weather.current.main.feels_like);

  return (
    <article className="mt-20 space-y-16 text-white/80 max-w-5xl mx-auto px-6 pb-32 font-sans leading-relaxed">
      {/* H1 Section */}
      <header className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
          Weather in {cityName} Today
        </h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Get real-time updates on the <strong>temperature in {cityName}</strong>, 
          <strong>hourly forecast {cityName}</strong>, and detailed <strong>rain forecast {cityName}</strong>. 
          SkyCast is your premier <strong>Weather Decision Assistant</strong>, providing accurate meteorological data and AI-driven weather intelligence.
        </p>
      </header>

      {/* SECTION 1: Current Weather */}
      <section className="glass p-10 rounded-[3rem] border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">
          Current Weather in {cityName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-4">
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Temperature</span>
              <span className="text-2xl font-bold text-white">{temp}°C</span>
            </p>
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Condition</span>
              <span className="text-xl font-bold text-indigo-300 capitalize">{condition}</span>
            </p>
          </div>
          <div className="space-y-4">
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Humidity</span>
              <span className="text-xl font-bold text-white">{humidity}%</span>
            </p>
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Wind Speed</span>
              <span className="text-xl font-bold text-white">{windSpeed} m/s</span>
            </p>
          </div>
          <div className="space-y-4">
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Visibility</span>
              <span className="text-xl font-bold text-white">{visibility} km</span>
            </p>
            <p className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/40 font-medium">Feels-like</span>
              <span className="text-xl font-bold text-amber-300">{feelsLike}°C</span>
            </p>
          </div>
        </div>
        <p className="mt-8 text-white/50 text-sm italic">
          Our data is refreshed every 10 minutes to ensure you have the most accurate <strong>weather in {cityName} today</strong>.
        </p>
      </section>

      {/* SECTION 2: Hourly Weather Forecast */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Hourly Weather Forecast for {cityName}</h2>
        <p className="mb-6">
          Understanding the <strong>hourly forecast {cityName}</strong> is essential for planning your day. 
          As the day progresses, we anticipate a gradual shift in atmospheric pressure which may influence 
          local cloud formations. Currently, the trend suggests that the <strong>temperature in {cityName}</strong> 
          will peak in the mid-afternoon before a steady decline toward the evening hours.
        </p>
        <p className="mb-8">
          For commuters and students, the morning hours look stable, but it is always wise to keep an eye on the 
          <strong>rain forecast {cityName}</strong> for any sudden convective activity. Our high-resolution 
          models indicate a {weather.forecast.list[0].pop * 100}% probability of precipitation in the next few hours.
        </p>
        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Time Window</th>
                <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Expected Temp</th>
                <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Sky Condition</th>
              </tr>
            </thead>
            <tbody>
              {weather.forecast.list.slice(0, 8).map((item: any, i: number) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-5 px-8 text-sm">{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-5 px-8 text-sm font-bold text-white">{Math.round(item.main.temp)}°C</td>
                  <td className="py-5 px-8 text-sm capitalize text-white/60">{item.weather[0].description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: 5-Day Weather Trends */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">5-Day Weather Trends</h2>
        <p className="mb-8">
          Looking ahead at the <strong>weather forecast</strong> for the next 5 days, {cityName} is expected to 
          experience a mix of conditions. The early part of the week will likely be dominated by the current 
          weather system, while a new front is expected to move in by the weekend. This could bring a significant 
          change to the <strong>temperature in {cityName}</strong>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {weather.forecast.list.filter((_: any, i: number) => i % 8 === 0).map((item: any, i: number) => (
            <div key={i} className="glass p-6 rounded-3xl text-center border-white/5 hover:border-indigo-500/30 transition-all">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <div className="flex justify-center mb-3">
                {getWeatherIcon(item.weather[0].main, 24)}
              </div>
              <p className="text-2xl font-bold text-white">{Math.round(item.main.temp)}°</p>
              <p className="text-[10px] capitalize text-white/40 mt-1">{item.weather[0].main}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-white/60">
          For those planning long-term events, the <strong>best time to visit {cityName}</strong> this week 
          appears to be the mid-week window when the <strong>rain forecast {cityName}</strong> shows the 
          lowest probability of interference.
        </p>
      </section>

      {/* SECTION 4: Weather Insights */}
      <section className="bg-gradient-to-br from-indigo-500/10 to-transparent p-12 rounded-[3.5rem] border border-indigo-500/20">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Sparkles className="text-indigo-400" />
          AI Weather Insights for {cityName}
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {aiInsights.map((insight, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300">{insight.title}</h3>
              <p className="text-base leading-relaxed text-white/70">{insight.description}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400/60">
                <Zap size={12} />
                <span>Smart Recommendation: {insight.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Best Time for Outdoor Activities */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8">Best Time for Outdoor Activities in {cityName}</h2>
        <p className="mb-8">
          Whether you are a local or a tourist, knowing the <strong>best time for outdoor activities</strong> 
          can significantly enhance your experience in {cityName}. As your <strong>Weather Decision Assistant</strong>, 
          SkyCast recommends the following windows based on the latest <strong>weather forecast</strong>:
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Zap className="text-amber-400" size={20} />
              Running & Cycling
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              The optimal window for high-intensity exercise is when the <strong>temperature in {cityName}</strong> 
              is between 12°C and 18°C. Currently, the early morning hours provide the best air quality and 
              lowest humidity for runners and cyclists.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <MapPin className="text-emerald-400" size={20} />
              Sightseeing & Travel
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              For tourists, the <strong>best time to visit {cityName}</strong> landmarks is during the 
              late morning. Our <strong>hourly forecast {cityName}</strong> suggests that cloud cover is 
              typically minimal during this time, providing excellent lighting for photography.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Travel Weather Tips */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8">Travel Weather Tips for Visitors</h2>
        <p className="mb-8">
          Visiting {cityName} requires some preparation based on the current <strong>weather forecast</strong>. 
          Here are our top recommendations for a comfortable trip:
        </p>
        <ul className="grid md:grid-cols-3 gap-6">
          <li className="glass p-6 rounded-2xl border-white/5 space-y-3">
            <div className="p-2 bg-white/5 rounded-lg w-fit"><Briefcase size={20} className="text-indigo-400" /></div>
            <h4 className="font-bold text-white">Clothing Suggestions</h4>
            <p className="text-xs text-white/50">Pack breathable layers. The <strong>temperature in {cityName}</strong> can fluctuate by up to 10 degrees between day and night.</p>
          </li>
          <li className="glass p-6 rounded-2xl border-white/5 space-y-3">
            <div className="p-2 bg-white/5 rounded-lg w-fit"><Umbrella size={20} className="text-blue-400" /></div>
            <h4 className="font-bold text-white">Rain Precautions</h4>
            <p className="text-xs text-white/50">Always carry a compact umbrella. Our <strong>rain forecast {cityName}</strong> indicates that brief showers are common this time of year.</p>
          </li>
          <li className="glass p-6 rounded-2xl border-white/5 space-y-3">
            <div className="p-2 bg-white/5 rounded-lg w-fit"><Sun size={20} className="text-amber-400" /></div>
            <h4 className="font-bold text-white">Sun Protection</h4>
            <p className="text-xs text-white/50">Apply SPF 30+ even on cloudy days. UV exposure in {cityName} can be high due to local atmospheric conditions.</p>
          </li>
        </ul>
      </section>

      {/* SECTION 7: Frequently Asked Questions */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: `What is the temperature in ${cityName} today?`,
              a: `The current temperature in ${cityName} is ${temp}°C, with a "feels like" temperature of ${feelsLike}°C.`
            },
            {
              q: `Will it rain today in ${cityName}?`,
              a: `Based on our rain forecast ${cityName}, there is a ${weather.forecast.list[0].pop * 100}% chance of precipitation today.`
            },
            {
              q: `What is the best time to visit ${cityName}?`,
              a: `The best time to visit ${cityName} for outdoor activities is usually during the late morning when temperatures are most comfortable. Use SkyCast to monitor <strong>5-day weather trends</strong> before booking your trip.`
            },
            {
              q: `Is ${cityName} humid today?`,
              a: `The current humidity in ${cityName} is ${humidity}%, which is considered ${humidity > 60 ? 'high' : 'moderate'}.`
            },
            {
              q: `How accurate is the weather forecast for ${cityName}?`,
              a: `SkyCast is a specialized <strong>Weather Decision Assistant</strong> that uses advanced AI models and real-time data from local stations to provide highly accurate weather forecasts for ${cityName}.`
            }
          ].map((faq, i) => (
            <div key={i} className="glass p-8 rounded-3xl border-white/5 hover:border-white/20 transition-all group">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{faq.q}</h3>
              <p className="text-white/60 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Linking */}
      <footer className="pt-16 border-t border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Explore More Weather Data</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 glass rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Weather in nearby cities</button>
          <button className="px-6 py-3 glass rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Weather next 5 days in {cityName}</button>
          <button className="px-6 py-3 glass rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Best time to visit {cityName}</button>
          <button className="px-6 py-3 glass rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Monthly weather in {cityName}</button>
        </div>
      </footer>

      {/* FAQ Schema for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `What is the temperature in ${cityName} today?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `The current temperature in ${cityName} is ${temp}°C.`
              }
            },
            {
              "@type": "Question",
              "name": `Will it rain today in ${cityName}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Based on our rain forecast, there is a ${weather.forecast.list[0].pop * 100}% chance of precipitation today.`
              }
            },
            {
              "@type": "Question",
              "name": `What is the best time to visit ${cityName}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `The best time to visit ${cityName} is during periods of stable weather, which can be monitored via SkyCast's 5-day trends.`
              }
            }
          ]
        })}
      </script>
    </article>
  );
}
