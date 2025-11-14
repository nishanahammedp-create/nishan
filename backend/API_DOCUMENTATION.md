# ALERT 360 API Documentation

Complete API reference for ALERT 360 Disaster Alert System Backend.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this format:
```json
{
  "success": true/false,
  "message": "Operation message",
  "data": {},
  "pagination": {}
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/users/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "city": "Mumbai",
  "country": "India"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
**POST** `/users/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 👤 User Endpoints

### Get Profile
**GET** `/users/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": {
      "city": "Mumbai",
      "country": "India"
    },
    "preferences": {
      "notificationsEnabled": true,
      "soundAlert": true,
      "vibrationAlert": true,
      "searchRadius": 50
    }
  }
}
```

### Update Profile
**PUT** `/users/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+9876543210",
  "location": {
    "city": "New York",
    "country": "USA"
  }
}
```

**Response:** `200 OK`

### Update Preferences
**PUT** `/users/preferences`

Update notification and alert preferences.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "preferences": {
    "notificationsEnabled": true,
    "soundAlert": false,
    "vibrationAlert": true,
    "alertTypes": {
      "weather": true,
      "earthquake": true,
      "flood": true,
      "fire": false,
      "tsunami": true
    },
    "searchRadius": 100
  }
}
```

**Response:** `200 OK`

### Add Emergency Contact
**POST** `/users/emergency-contacts`

Add an emergency contact to user's profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Emergency Person",
  "phone": "+1111111111",
  "relation": "Family"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Emergency contact added",
  "data": [
    {
      "_id": "contact_id",
      "name": "Emergency Person",
      "phone": "+1111111111",
      "relation": "Family"
    }
  ]
}
```

### Delete Emergency Contact
**DELETE** `/users/emergency-contacts/:contactId`

Remove an emergency contact.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## 🚨 Alert Endpoints

### Get All Alerts
**GET** `/alerts`

Retrieve all alerts with optional filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20, max: 100)
- `type` (string) - Filter by type: weather, earthquake, flood, accident, fire, tsunami
- `severity` (string) - Filter by severity: info, warning, danger
- `status` (string) - Filter by status: active, resolved, cancelled

**Example:**
```
GET /alerts?page=1&limit=20&type=weather&severity=danger
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "alert_id",
      "title": "Heavy Rain Alert",
      "description": "Heavy rainfall expected",
      "type": "weather",
      "severity": "warning",
      "source": "official",
      "location": {
        "name": "Mumbai, India",
        "coordinates": {
          "type": "Point",
          "coordinates": [72.8777, 19.0760]
        },
        "radius": 50
      },
      "emoji": "🌧️",
      "message": "Stay safe and avoid travel",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Get Alerts by Location
**GET** `/alerts/location`

Get alerts near a specific location.

**Query Parameters:**
- `latitude` (number, required) - User latitude
- `longitude` (number, required) - User longitude
- `radius` (number) - Search radius in km (default: 50)

**Example:**
```
GET /alerts/location?latitude=19.0760&longitude=72.8777&radius=100
```

**Response:** `200 OK`

### Get Alert by ID
**GET** `/alerts/:id`

Get a specific alert by its ID.

**Parameters:**
- `id` (string) - Alert ID

**Response:** `200 OK`

### Create Alert
**POST** `/alerts`

Create a new alert (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Heavy Rain Alert",
  "description": "Heavy rainfall expected in the region",
  "type": "weather",
  "severity": "warning",
  "source": "official",
  "location": {
    "name": "Mumbai, India",
    "coordinates": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "radius": 50
  },
  "emoji": "🌧️",
  "message": "Stay safe and avoid travel",
  "metadata": {
    "temperature": 28,
    "windSpeed": 45,
    "humidity": 85
  }
}
```

**Response:** `201 Created`

### Update Alert
**PUT** `/alerts/:id`

Update an existing alert (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "severity": "danger",
  "status": "resolved",
  "message": "Updated message"
}
```

**Response:** `200 OK`

### Resolve Alert
**PATCH** `/alerts/:id/resolve`

Mark an alert as resolved.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Alert resolved successfully",
  "data": {
    "status": "resolved"
  }
}
```

### Delete Alert
**DELETE** `/alerts/:id`

Delete an alert (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

## 📢 Event Endpoints

### Get All Events
**GET** `/events`

Retrieve all events.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page
- `type` (string) - Filter by event type
- `status` (string) - Filter by status: upcoming, ongoing, completed, cancelled

**Response:** `200 OK`

### Get Events by Location
**GET** `/events/location`

Get events near a specific location.

**Query Parameters:**
- `latitude` (number, required)
- `longitude` (number, required)
- `radius` (number) - Search radius in km (default: 50)

**Response:** `200 OK`

### Get Event by ID
**GET** `/events/:id`

Get a specific event.

**Response:** `200 OK`

### Create Event
**POST** `/events`

Create a new event.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Flood Risk Advisory",
  "description": "Flood risk in coastal areas",
  "type": "flood",
  "location": {
    "name": "Jakarta, Indonesia",
    "coordinates": {
      "type": "Point",
      "coordinates": [106.8270, -6.2088]
    }
  },
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-16T10:00:00Z",
  "source": "community"
}
```

**Response:** `201 Created`

### Update Event
**PUT** `/events/:id`

Update an event.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:** `200 OK`

### Delete Event
**DELETE** `/events/:id`

Delete an event (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`

---

## 🌤️ Weather Endpoints

### Get Current Weather
**GET** `/weather/current`

Get current weather at a location.

**Query Parameters:**
- `latitude` (number, required)
- `longitude` (number, required)
- `units` (string) - Temperature units: metric, imperial (default: metric)

**Example:**
```
GET /weather/current?latitude=19.0760&longitude=72.8777
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "temperature": 28.5,
    "feelsLike": 32.1,
    "humidity": 85,
    "pressure": 1010,
    "windSpeed": 15.5,
    "description": "overcast clouds",
    "icon": "04d",
    "location": {
      "name": "Mumbai, India",
      "coordinates": [72.8777, 19.0760]
    }
  }
}
```

### Get Weather Forecast
**GET** `/weather/forecast`

Get 5-day weather forecast.

**Query Parameters:**
- `latitude` (number, required)
- `longitude` (number, required)
- `units` (string) - Temperature units (default: metric)

**Response:** `200 OK`

### Get Air Quality
**GET** `/weather/air-quality`

Get air quality data for a location.

**Query Parameters:**
- `latitude` (number, required)
- `longitude` (number, required)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "aqi": 3,
    "aqiLevel": "Moderate",
    "components": {
      "pm25": 45.2,
      "pm10": 89.5,
      "o3": 0.045,
      "no2": 0.032,
      "so2": 0.015,
      "co": 0.450
    }
  }
}
```

### Geocode Location
**GET** `/weather/geocode`

Convert address to coordinates.

**Query Parameters:**
- `address` (string, required) - Location address

**Example:**
```
GET /weather/geocode?address=Mumbai, India
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "name": "Mumbai, India",
      "coordinates": [72.8777, 19.0760],
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  ]
}
```

### Reverse Geocode
**GET** `/weather/reverse-geocode`

Convert coordinates to address.

**Query Parameters:**
- `latitude` (number, required)
- `longitude` (number, required)

**Response:** `200 OK`

---

## ✅ Health Check

### Check Server Status
**GET** `/health`

Check if server is running.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production environments.

---

## Pagination

Paginated endpoints use these parameters:
- `page` - Page number (starts from 1)
- `limit` - Items per page (1-100)

Response includes pagination info:
```json
{
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 20,
    "pages": 25
  }
}
```

---

## Error Response Example

```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

## Testing Endpoints

### Using cURL

```bash
# Get alerts
curl -X GET "http://localhost:5000/api/v1/alerts"

# Login
curl -X POST "http://localhost:5000/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Create alert (with token)
curl -X POST "http://localhost:5000/api/v1/alerts" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alert Title",
    "description": "Alert description"
  }'
```

### Using Postman

1. Import API collection
2. Set `token` variable from login response
3. Use `{{token}}` in Authorization header
4. Test endpoints

---

For more information, see README.md or INTEGRATION_GUIDE.md

---

## 🗺️ Map Endpoints

### Get GeoJSON
**GET** `/map/geojson`

Returns a GeoJSON FeatureCollection combining alerts, events and locations.

Query parameters:
- `include` (optional) - comma-separated list of data to include (e.g. `alerts,events,locations`). Default: all.

Response: `200 OK` with GeoJSON FeatureCollection. Each feature contains `properties` with useful fields like `id`, `title`, `type`, `severity`, `status`, `description`, `startDate`, `endDate`, `riskLevel`. If available, `properties.imageUrl` will contain a URL to an image (served under `/public/uploads/...` or an absolute URL), which viewer popups will show as a thumbnail.

Example:
```
curl "http://localhost:5000/api/v1/map/geojson?include=alerts,events"
```

### Map Viewer (HTML)
**GET** `/map/view`

Returns a simple HTML page with an interactive Leaflet map that fetches `/map/geojson` and displays markers.

Query parameters:
- `lat` (optional) - initial center latitude
- `lng` (optional) - initial center longitude
- `zoom` (optional) - initial zoom level

Open in browser:
```
http://localhost:5000/api/v1/map/view
```

