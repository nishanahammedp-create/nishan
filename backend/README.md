# ALERT 360 Backend API

Complete Node.js/Express backend for ALERT 360 disaster alert system with MongoDB, authentication, and real-time alert management.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication
- ✅ User management and profiles
- ✅ Alert management system
- ✅ Event tracking
- ✅ Geospatial queries for location-based alerts
- ✅ Error handling and logging
- ✅ Role-based access control
- ✅ CORS support

## Prerequisites

- Node.js v14+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Create `.env` file** (copy from `.env.example`)
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/alert360
JWT_SECRET=your_secret_key
```

4. **Start MongoDB** (if using local instance)
```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

## Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Alerts
```
GET    /api/v1/alerts              - Get all alerts
GET    /api/v1/alerts/:id          - Get alert by ID
GET    /api/v1/alerts/location     - Get alerts by location (lat, lon, radius)
POST   /api/v1/alerts              - Create alert (admin)
PUT    /api/v1/alerts/:id          - Update alert (admin)
DELETE /api/v1/alerts/:id          - Delete alert (admin)
PATCH  /api/v1/alerts/:id/resolve  - Resolve alert
```

### Users
```
POST   /api/v1/users/register      - Register new user
POST   /api/v1/users/login         - Login user
GET    /api/v1/users/profile       - Get user profile
PUT    /api/v1/users/profile       - Update profile
PUT    /api/v1/users/preferences   - Update preferences
```

### Emergency Contacts
```
POST   /api/v1/users/emergency-contacts    - Add contact
DELETE /api/v1/users/emergency-contacts/:contactId - Delete contact
```

### Events
```
GET    /api/v1/events              - Get all events
GET    /api/v1/events/:id          - Get event by ID
GET    /api/v1/events/location     - Get events by location
POST   /api/v1/events              - Create event
PUT    /api/v1/events/:id          - Update event
DELETE /api/v1/events/:id          - Delete event
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── constants.js       # App constants
│   ├── models/
│   │   ├── Alert.js           # Alert model
│   │   ├── Event.js           # Event model
│   │   ├── User.js            # User model
│   │   └── Location.js        # Location model
│   ├── controllers/
│   │   ├── alertController.js # Alert business logic
│   │   ├── userController.js  # User business logic
│   │   └── eventController.js # Event business logic
│   ├── routes/
│   │   ├── alertRoutes.js     # Alert endpoints
│   │   ├── userRoutes.js      # User endpoints
│   │   └── eventRoutes.js     # Event endpoints
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── errorHandler.js    # Error handling
│   ├── utils/
│   │   ├── logger.js          # Logging utility
│   │   └── helpers.js         # Helper functions
│   └── server.js              # Main server file
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## Example API Requests

### Register User
```bash
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "city": "Mumbai",
  "country": "India"
}
```

### Login
```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Get Alerts
```bash
GET /api/v1/alerts?page=1&limit=20&type=weather
Authorization: Bearer <token>
```

### Get Alerts by Location
```bash
GET /api/v1/alerts/location?latitude=19.0760&longitude=72.8777&radius=50
Authorization: Bearer <token>
```

### Create Alert (Admin Only)
```bash
POST /api/v1/alerts
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "title": "Heavy Rain Alert",
  "description": "Heavy rainfall expected",
  "type": "weather",
  "severity": "warning",
  "location": {
    "name": "Mumbai, India",
    "coordinates": {
      "type": "Point",
      "coordinates": [72.8777, 19.0760]
    },
    "radius": 50
  },
  "message": "Stay safe and avoid travel"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include token in request header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days by default (configurable in `.env`).

## Error Handling

All errors follow standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Logging

Logs are stored in `logs/` directory:
- `app.log` - General logs
- `error.log` - Error logs

## Database Setup

### Local MongoDB
```bash
# Install MongoDB Community
# Then start the service and create database

mongosh
> use alert360
> db.users.insertOne({test: true})
```

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

## Development

### Environment Variables
- `NODE_ENV=development` - Includes error stack traces
- `LOG_LEVEL=info` - Change to 'debug' for verbose logging

### Nodemon Auto-Reload
The `npm run dev` command uses Nodemon to watch for file changes and automatically restart the server.

## Testing

```bash
npm test
```

## Deployment

### Heroku
```bash
git push heroku main
heroku config:set MONGODB_URI=<your_mongodb_uri>
```

### AWS/Other Platforms
- Set environment variables on your hosting platform
- Ensure Node.js version compatibility
- Configure MongoDB access

## Security Best Practices

1. ✅ Use strong JWT_SECRET (minimum 32 characters)
2. ✅ Enable HTTPS in production
3. ✅ Use environment variables for secrets
4. ✅ Validate all input data
5. ✅ Use helmet.js for secure headers
6. ✅ Implement rate limiting
7. ✅ Keep dependencies updated

## Future Enhancements

- [ ] WebSocket support for real-time alerts
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile push notifications
- [ ] Advanced analytics
- [ ] Machine learning predictions
- [ ] Map integration
- [ ] Social sharing features

## Support

For issues and questions, please open an issue in the repository.

## License

MIT License - See LICENSE file for details
