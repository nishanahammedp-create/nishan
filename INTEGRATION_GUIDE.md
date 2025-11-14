# Frontend to Backend Integration Guide

This guide explains how to integrate the ALERT 360 frontend with the backend API.

## Quick Start

### 1. Update Frontend API Base URL

In your frontend JavaScript files, set the API base URL:

```javascript
// app.js or config.js
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Or use environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
```

### 2. Update Frontend Services

Replace mock data calls with actual API calls:

```javascript
// OLD: Mock data
appState.alerts = mockAlerts;

// NEW: API call
async function fetchAlerts() {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    const data = await response.json();
    appState.alerts = data.data;
    renderAlerts();
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
}
```

## API Integration Examples

### User Authentication

```javascript
// Register
async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Login
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Get Profile
async function getUserProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### Alerts

```javascript
// Get all alerts
async function getAlerts() {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  return response.json();
}

// Get alerts by location
async function getAlertsByLocation(lat, lon, radius = 50) {
  const response = await fetch(
    `${API_BASE_URL}/alerts/location?latitude=${lat}&longitude=${lon}&radius=${radius}`
  );
  return response.json();
}

// Create alert (admin only)
async function createAlert(alertData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(alertData)
  });
  return response.json();
}

// Update alert
async function updateAlert(alertId, updates) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  return response.json();
}

// Resolve alert
async function resolveAlert(alertId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### Events

```javascript
// Get all events
async function getEvents() {
  const response = await fetch(`${API_BASE_URL}/events`);
  return response.json();
}

// Get events by location
async function getEventsByLocation(lat, lon, radius = 50) {
  const response = await fetch(
    `${API_BASE_URL}/events/location?latitude=${lat}&longitude=${lon}&radius=${radius}`
  );
  return response.json();
}

// Create event
async function createEvent(eventData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  return response.json();
}
```

### User Preferences

```javascript
// Update preferences
async function updatePreferences(preferences) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ preferences })
  });
  return response.json();
}

// Add emergency contact
async function addEmergencyContact(contact) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/emergency-contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(contact)
  });
  return response.json();
}
```

## Frontend Update Examples

### Modify app.js

```javascript
// Add API base URL
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Update initApp function
async function initApp() {
  loadSettings();
  setupEventListeners();
  
  // Fetch from API instead of using mock data
  await fetchAndRenderAlerts();
  await fetchAndRenderEvents();
  
  renderEmergencyContacts();
  renderSafetyTips();
  updateStats();
  updateLocationInfo();
  checkAlertLevel();
  
  // Real-time updates
  setInterval(fetchAndRenderAlerts, 30000);
  setInterval(updateStats, 10000);
}

// New function to fetch and render alerts
async function fetchAndRenderAlerts() {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    const data = await response.json();
    appState.alerts = data.data || [];
    renderAlerts();
    updateStats();
  } catch (error) {
    console.error('Error fetching alerts:', error);
  }
}

// New function to fetch and render events
async function fetchAndRenderEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    const data = await response.json();
    appState.events = data.data || [];
    renderEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}
```

## CORS Configuration

Make sure backend CORS is configured for your frontend domain:

```javascript
// backend/src/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'https://yourdomain.com'],
  credentials: true
}));
```

Or set in `.env`:
```
CORS_ORIGIN=http://localhost:3000
```

## Local Development Setup

1. **Terminal 1: Start Backend**
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

2. **Terminal 2: Serve Frontend**
```bash
# Open index.html in browser or use a local server
python -m http.server 8000
# Open http://localhost:8000
```

## Error Handling

Always handle API errors in frontend:

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    showToast(`Error: ${error.message}`);
    throw error;
  }
}
```

## Testing API with Postman

1. Download Postman
2. Create collection for ALERT 360
3. Add requests:
   - GET /health
   - POST /users/register
   - POST /users/login (get token)
   - GET /alerts (add token to Authorization)
   - GET /alerts/location
   - POST /alerts (admin)

## Troubleshooting

### CORS Error
- Check backend CORS configuration
- Ensure frontend URL is in allowed origins
- Restart backend after changing CORS settings

### 401 Unauthorized
- Token is missing or expired
- Re-login to get new token
- Check localStorage for token

### 404 Not Found
- Verify API endpoint URL
- Check that backend server is running
- Verify correct HTTP method (GET, POST, etc.)

### Database Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify database exists

## Next Steps

1. ✅ Start backend server
2. ✅ Update frontend API URLs
3. ✅ Implement authentication
4. ✅ Add API service layer
5. ✅ Test all endpoints
6. ✅ Deploy to production

For more information, see the backend README.md
