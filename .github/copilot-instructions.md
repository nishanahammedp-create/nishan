# Copilot Instructions for ALERT 360 Disaster Alert System

## Project Overview

**ALERT 360** is a full-stack disaster alert and emergency management system tailored for Kerala. It comprises:
- **Frontend**: Vanilla HTML/CSS/JS with advanced animations and a Kerala-focused location database
- **Backend**: Express.js REST API with MongoDB, JWT authentication, and geospatial queries
- **Architecture**: Microservices pattern with role-based access control and modular controllers

## Architecture & Key Components

### Backend Structure (`backend/src/`)

**Request Flow**: Routes → Middleware (auth, error) → Controllers → Models → Database

- **Routes** (`routes/`): 7 route files mapping `GET/POST/PUT/DELETE` to endpoints. Public endpoints (list alerts, emergency dispatch) require NO auth. Admin/moderator operations require `authMiddleware` + `adminMiddleware`.
- **Controllers** (`controllers/`): Business logic layer. Pattern: extract `req.query/body`, validate, query Model, call helper utilities, return standard response format (`{ success, message, data, pagination }`).
- **Models** (`models/`): Mongoose schemas with validation, indexes, and timestamps. Critical: Alert model uses geospatial (`2dsphere` index) for location-based queries; User model password hashing via bcryptjs.
- **Middleware** (`middleware/auth.js`): JWT token extraction from `Authorization: Bearer <token>` header. Roles: `user`, `admin`, `moderator`.

**Key Models**:
- **Alert**: Title, description, type (weather/earthquake/flood/fire/tsunami/accident), severity (info/warning/danger), source (official/sensor/satellite/ai), location with coordinates, status (active/resolved/cancelled).
- **User**: Name, email (unique), phone, location, preferences (alert filters, search radius), emergency contacts, role-based access.
- **Event**: Event tracking with timestamps and metadata.
- **Location**: Geographic data for alert radius calculations.

### Frontend Structure

- **app.js**: 1900+ lines; centralized state management via `appState` object (alerts, events, settings, user location, dark mode, offline communication peers).
- **index.html**: Semantic HTML with bottom navigation tabs (Alerts, SOS, Safety Tips, Settings).
- **styles.css**: Extensive animations: shimmer effects, pulsing badges, floating icons, gradient transitions. Color scheme: red (#ff6b6b), green (#51cf66), orange (#ffa94d), blue (#4dabf7).

**State Pattern**: `appState` is the single source of truth. UI is rendered via vanilla DOM manipulation (no frameworks).

### Database Configuration

MongoDB connection in `backend/src/config/database.js`. Requires `.env` with `MONGODB_URI`. Default: `mongodb://localhost:27017/alert360`. Geospatial queries use `$near` with `$maxDistance` in meters (convert km input via `radius * 1000`).

## Developer Workflows

### Running Backend

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start

# Check server health
curl http://localhost:5000/health
```

Environment must have `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `PORT` in `.env`.

### Testing Alerts API

```bash
# Get all alerts (public)
curl http://localhost:5000/api/v1/alerts

# Get alerts by location (public)
curl "http://localhost:5000/api/v1/alerts/location?latitude=10.3&longitude=76.2&radius=50"

# Create alert (admin only)
curl -X POST http://localhost:5000/api/v1/alerts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Heavy Rain","description":"...","type":"weather","severity":"warning","location":{"name":"Kochi","coordinates":{"type":"Point","coordinates":[76.2,10.3]}}}'

# Emergency dispatch (public endpoint, sends to nearby admin offices)
curl -X POST http://localhost:5000/api/v1/alerts/emergency \
  -H "Content-Type: application/json" \
  -d '{"title":"Emergency","message":"Flood warning","latitude":10.3,"longitude":76.2}'
```

## Project-Specific Conventions

### Response Format (Standard Across All Endpoints)

```javascript
{
  "success": true/false,
  "message": "Human-readable status",
  "data": { /* payload */ },
  "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 } // if applicable
}
```

Use `sendResponse()` helper from `utils/helpers.js` for consistency.

### Error Handling

- **Validation Errors**: Return 400 with specific field errors.
- **Auth Errors**: 401 for missing/invalid tokens, 403 for insufficient roles.
- **Database Errors**: Caught globally in `errorHandler` middleware. Mongoose validation errors return 400; duplicate keys (`code 11000`) return 400; JWT errors return 401.

**Pattern**: Controllers wrap logic in `try/catch`, call `next(error)` to trigger error middleware.

### Authentication Pattern

1. User registers/logs in → receives JWT token
2. Client stores token in `localStorage`
3. Subsequent requests include header: `Authorization: Bearer <token>`
4. `authMiddleware` verifies token, attaches `req.userId` and `req.userRole`
5. `adminMiddleware` checks `req.userRole === 'admin'`

Token payload: `{ id, role }`. Expiry default: 7 days (configurable via `JWT_EXPIRE`).

### Geospatial Queries

Alert location is stored as GeoJSON: `coordinates: [longitude, latitude]` (note: longitude first!). Queries use MongoDB `$near`:

```javascript
const alerts = await Alert.find({
  'location.coordinates': {
    $near: {
      $geometry: { type: 'Point', coordinates: [lon, lat] },
      $maxDistance: radiusKm * 1000 // Convert to meters
    }
  }
});
```

Always ensure the 2dsphere index exists: `alertSchema.index({ 'location.coordinates': '2dsphere' })`.

### Frontend-Backend Integration

Frontend fetches from `http://localhost:5000/api/v1/<resource>`. Token stored in `localStorage` and sent via:

```javascript
headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
```

Public endpoints (alerts list, emergency dispatch) work without auth. Admin operations require token.

### Constants & Enums

All constants centralized in `backend/src/config/constants.js`:

```javascript
ALERT_TYPES: { WEATHER, EARTHQUAKE, FLOOD, ACCIDENT, FIRE, TSUNAMI }
SEVERITY_LEVELS: { INFO, WARNING, DANGER }
ALERT_SOURCES: { OFFICIAL, SENSOR, SATELLITE, AI }
STATUS: { SUCCESS, ERROR, PENDING }
HTTP_STATUS: { OK: 200, CREATED: 201, BAD_REQUEST: 400, ... }
CACHE_DURATION: { SHORT: 300s, MEDIUM: 1800s, LONG: 3600s }
```

Use these in controllers instead of magic strings.

### Helper Utilities

`backend/src/utils/helpers.js` provides:
- `generateToken(id, role)`: JWT generation
- `isValidEmail(email)`: Email regex validation
- `calculateDistance(lat1, lon1, lat2, lon2)`: Haversine formula (returns km)
- `getPaginationParams(page, limit)`: Returns `{ skip, limit, page }`, capped at limit=100
- `sendResponse(res, statusCode, success, message, data)`: Standardized JSON responses

### Logging

`backend/src/utils/logger.js`: Simple logger with `.info()` and `.error()` methods. Used in controllers for error tracking and in `server.js` for startup info. Morgan logs HTTP requests to logger stream.

### Frontend Animations & Styling

- **Colors**: Inline in `styles.css` as hex values; map to CSS custom properties or directly.
- **Animations**: Defined via `@keyframes` (shimmer, pulse, float, drift). Applied to elements via `animation` property.
- **Responsive**: Mobile-first; bottom navigation fixed at bottom for easy thumb access on mobile.

**Critical**: When modifying UI, preserve existing animation classes to maintain the "living theme" aesthetic.

### Location Database

Frontend contains a `worldLocations` array with 150+ cities including all 14 Kerala districts (Thiruvananthapuram, Kollam, Kochi, etc.). Used for search suggestions. If adding new locations, append to this array.

## Integration Points & Dependencies

### External Services

1. **OpenWeatherMap API** (referenced in docs, not yet fully integrated): For real-time weather data.
2. **MongoDB**: Production should use MongoDB Atlas (cloud) or self-hosted instance.
3. **JWT**: No external service; all auth is stateless token-based.

### CORS Configuration

Enabled in `server.js`:
```javascript
cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
})
```

For production, set `CORS_ORIGIN` to frontend URL to prevent unauthorized requests.

### Static File Serving

Images and uploads served from `backend/public/uploads/` via `app.use('/public', express.static(...))`. When adding file upload features, ensure upload logic validates file types and size.

## Common Development Tasks

### Adding a New API Endpoint

1. Create controller method in `backend/src/controllers/<resource>Controller.js`
2. Define route in `backend/src/routes/<resource>Routes.js`, applying auth middleware as needed
3. Use `sendResponse()` for response, handle errors via `try/catch` + `next(error)`
4. Add constants for any new enums in `constants.js`

### Adding a New Model

1. Create schema file in `backend/src/models/<Model>.js` with validation and indexes
2. Add corresponding controller in `controllers/`
3. Add routes in `routes/<model>Routes.js`
4. Import routes in `server.js` and register via `app.use('/api/v1/<resource>', routes)`

### Debugging

- Backend logs available via `npm run dev` console output
- Check MongoDB connection: `curl http://localhost:5000/health`
- Use browser DevTools Network tab to inspect API requests/responses
- Enable dev mode in `.env`: `NODE_ENV=development` for detailed error messages

### Database Seeding

Currently no seed file exists. To add mock data, create `backend/seeds.js` using models:

```javascript
const Alert = require('./src/models/Alert');
await Alert.create({ title: '...', ... });
```

Run via: `node backend/seeds.js`

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express app setup, middleware, routes registration |
| `backend/src/config/database.js` | MongoDB connection |
| `backend/src/config/constants.js` | Enums and constants |
| `backend/src/controllers/alertController.js` | Alert CRUD + location query logic |
| `backend/src/middleware/auth.js` | JWT verification and role checking |
| `backend/src/models/Alert.js` | Alert schema with geospatial index |
| `backend/src/utils/helpers.js` | Utility functions (token, distance, pagination) |
| `app.js` | Frontend state and logic |
| `index.html` | Frontend structure |
| `styles.css` | Frontend animations and theming |

---

**Last Updated**: November 2025  
**Status**: Production-ready backend; frontend in active development  
**Primary Tech Stack**: Node.js, Express, MongoDB, Mongoose, JWT, Vanilla JS
