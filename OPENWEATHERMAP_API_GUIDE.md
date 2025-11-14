# OpenWeatherMap API Integration Guide

## Overview

ALERT 360 now includes **real-time weather data and 24-hour forecasts** powered by the OpenWeatherMap API. This guide walks you through obtaining an API key and activating the weather feature.

---

## Step 1: Get Your Free OpenWeatherMap API Key

### Option A: Free Tier (Recommended for Testing)

1. Visit: [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click **"Sign Up"** or **"Create Account"**
3. Fill in your details:
   - Email address
   - Password
   - Name
   - Company (optional)
4. **Verify your email** by clicking the link in the confirmation email
5. Log in to your OpenWeatherMap account
6. Go to **API Keys** section (in the Account menu)
7. Copy the **Default API Key** (it starts with alphanumeric characters like: `abc123def456...`)
8. Save this key somewhere safe - you'll need it in Step 2

### Option B: Premium Plans

For production use or higher data limits, you can upgrade to:
- **Professional**: 1,000,000 API calls/month
- **Enterprise**: Custom limits

---

## Step 2: Add API Key to ALERT 360

### Method 1: Using Settings Modal (Recommended)

1. Open **ALERT 360** in your browser
2. Click the **⚙️ Settings button** in the header
3. Scroll down to the **"Weather API (OpenWeatherMap)"** section
4. You'll see:
   ```
   To fetch real weather and forecast data globally, paste your OpenWeatherMap API key below. 
   Get a free key at openweathermap.org
   ```
5. Paste your API key in the input field labeled **"OpenWeatherMap API Key"**
6. Click **"Save API Key"** button
7. A toast notification will confirm: `"OpenWeatherMap API key saved"`

### Method 2: Manual Browser Storage

If the input field isn't working, you can manually add it to browser storage:

1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Paste this command (replace YOUR_API_KEY with your actual key):
   ```javascript
   localStorage.setItem('owmApiKey', 'YOUR_API_KEY');
   ```
4. Press Enter
5. Refresh the page (F5)

---

## Step 3: Fetch Weather Data

Once your API key is saved:

### Automatic Method:
1. Open **Settings** (⚙️)
2. Scroll to **Weather API** section
3. Click **"Fetch Now"** button
4. Weather data will load in the **🧭 Weather & Forecast** section

### Manual Method:
1. Expand the **🧭 Weather & Forecast** section
2. Make sure your location is set (visible in Location Bar at top)
3. Click **"Update Weather"** button
4. Weather data for your location will display

---

## What Weather Data Is Available?

### Current Conditions Display:
- 🌡️ **Temperature** (current and "feels like")
- 💧 **Humidity** percentage
- 💨 **Wind Speed** (in km/h)
- 🌪️ **Wind Gust** speed
- ☁️ **Cloud Coverage** percentage
- 🌡️ **Atmospheric Pressure** (mb)
- 👁️ **Visibility** (in km)
- 🌍 **Weather Description** (e.g., "Partly Cloudy", "Light Rain")

### 24-Hour Forecast:
- Hourly temperature breakdown
- Weather emoji for each hour
- Rainfall predictions
- Wind conditions

---

## Troubleshooting

### ❌ "OpenWeatherMap API key missing. Add it in Settings."

**Solution:** 
- Go to Settings (⚙️) 
- Paste your API key in the Weather API field
- Click "Save API Key"

### ❌ "Location not found"

**Solution:**
- Check the location name in your Location Bar
- Use city name format: "New York, USA" or just "New York"
- Try a major city name instead of a small town

### ❌ "Unable to fetch weather. Check API key and network."

**Solutions:**
1. Verify your API key is correct (copy-paste it again from OpenWeatherMap account)
2. Check your internet connection
3. Make sure the API key is for **Free Tier** (some premium keys have different endpoints)
4. Wait a few minutes - OpenWeatherMap can take 10-15 minutes to activate new keys

### ❌ No forecast data showing

**Possible causes:**
- API key still activating (wait 15 minutes after creation)
- Using a location that OpenWeatherMap doesn't recognize
- Network connectivity issue

**Solution:** Try a major world city like "London, UK" or "Tokyo, Japan" to test

---

## API Endpoints Used

ALERT 360 uses these OpenWeatherMap API endpoints:

1. **Geocoding API** (Free)
   - Converts location names to coordinates
   - URL: `https://api.openweathermap.org/geo/1.0/direct`

2. **Weather API 2.5** (Free)
   - Current weather data
   - URL: `https://api.openweathermap.org/data/2.5/weather`

3. **Forecast API** (Free)
   - 5-day forecast data
   - URL: `https://api.openweathermap.org/data/2.5/forecast`

All are included in the **Free Tier** of OpenWeatherMap.

---

## Free Tier Limits

- **API Calls:** 1,000 per day (60 per minute)
- **Data:** Current weather, 5-day forecasts, historical data
- **Support:** Community forum only
- **No credit card required**

If you exceed limits, weather fetches will fail gracefully with a toast notification.

---

## Features Enabled by This Integration

✅ Real-time weather data for any location worldwide  
✅ 24-hour detailed forecast  
✅ Temperature, humidity, wind, and visibility tracking  
✅ Weather emoji indicators (☀️ ⛈️ 🌧️ ❄️ etc.)  
✅ Hourly breakdown for emergency planning  
✅ Automatic weather emoji mapping  
✅ Persistent API key storage (saved locally in browser)

---

## Security Notes

- ✅ API keys are stored **locally in your browser** only (localStorage)
- ✅ Keys are **never sent to external servers** (only to OpenWeatherMap)
- ⚠️ Do not share your API key publicly or commit it to code repositories
- ⚠️ If compromised, regenerate the key in your OpenWeatherMap account

---

## Example Weather Response

When you fetch weather for "London, UK", ALERT 360 displays:

```
📍 London, UK                          Updated: 2:34:12 PM

☀️ 
12°C
Feels like 10°C
Partly Cloudy

💧 Humidity: 72%          💨 Wind Speed: 15 km/h
🌪️ Wind Gust: 22 km/h   ☁️ Cloud Coverage: 40%
🌡️ Pressure: 1013 mb     👁️ Visibility: 10.0 km

24-Hour Forecast
14:00  ☀️ 13°C  0mm
15:00  ☀️ 14°C  0mm
16:00  ⛅ 13°C  0mm
17:00  ⛅ 12°C  1mm
...
```

---

## Next Steps

1. ✅ Sign up for OpenWeatherMap API key
2. ✅ Save your API key in ALERT 360 Settings
3. ✅ Click "Update Weather" or "Fetch Now"
4. ✅ View real-time weather and forecasts
5. ✅ Use weather data for disaster planning

---

## Support

- **OpenWeatherMap Docs:** https://openweathermap.org/api
- **ALERT 360 Repository:** Check README.md for additional help
- **API Status:** https://openweathermap.org/api/status

---

**Last Updated:** November 14, 2025  
**Status:** ✅ Fully Implemented and Tested
