import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch weather data
  app.get("/api/weather", async (req, res) => {
    const { city, lat, lon } = req.query;
    const rawApiKey = process.env.OPENWEATHER_API_KEY;
    const apiKey = rawApiKey?.trim();

    if (!apiKey) {
      return res.status(500).json({ error: "OpenWeather API key not configured in Secrets." });
    }

    let query = "";
    if (lat && lon) {
      query = `lat=${lat}&lon=${lon}`;
    } else if (city) {
      query = `q=${encodeURIComponent(city as string)}`;
    } else {
      return res.status(400).json({ error: "City name or coordinates are required." });
    }

    // Masked log for debugging
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`Attempting weather fetch for "${query}" using key: ${maskedKey}`);

    try {
      // 1. Fetch current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`
      );
      
      if (!weatherRes.ok) {
        const errorData = await weatherRes.json();
        return res.status(weatherRes.status).json({ error: errorData.message || "Failed to fetch weather." });
      }
      
      const weatherData = await weatherRes.json();

      // 2. Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${apiKey}&units=metric`
      );
      
      let forecastData = null;
      if (forecastRes.ok) {
        forecastData = await forecastRes.json();
      }

      res.json({
        current: weatherData,
        forecast: forecastData,
      });
    } catch (error) {
      console.error("Weather API Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // API Route to fetch city suggestions
  app.get("/api/geo", async (req, res) => {
    const { q } = req.query;
    const rawApiKey = process.env.OPENWEATHER_API_KEY;
    const apiKey = rawApiKey?.trim();

    if (!apiKey) {
      return res.status(500).json({ error: "OpenWeather API key not configured." });
    }

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required." });
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q as string)}&limit=5&appid=${apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: errorData.message || "Failed to fetch suggestions." });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Geo API Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
