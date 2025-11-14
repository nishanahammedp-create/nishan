# 🚀 Complete Backend Setup Guide

## ✅ Pre-Requisites

Before starting, ensure you have:
- **Node.js** v14+ ([Download](https://nodejs.org/))
- **MongoDB** running locally or on MongoDB Atlas
- **npm** or **yarn**
- **Git** (optional, for version control)

---

## 📋 Step 1: Verify Backend Files

Run the verification script to check if all files are in place:

```bash
cd backend
node verify-setup.js
```

You should see a green checkmark (✓) next to all items.

---

## 🔧 Step 2: Install Dependencies

Install all required Node.js packages:

```bash
cd backend
npm install
```

This will install:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers
- **morgan** - HTTP logging
- **axios** - HTTP client
- **dotenv** - Environment variables
- **nodemon** - Development auto-restart (dev only)

Installation typically takes 2-3 minutes.

---

## 🗄️ Step 3: Setup MongoDB

### Option A: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Mac: `brew install mongodb-community`
   - Linux: https://docs.mongodb.com/manual/installation/

2. **Start MongoDB Service**
   ```bash
   # Windows
   mongod
   
   # Mac/Linux
   mongod
   ```

3. **Verify Connection**
   ```bash
   mongo
   # Should connect to test database
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create Free Account**: https://www.mongodb.com/cloud/atlas
2. **Create a Cluster**:
   - Click "Create a Cluster"
   - Choose "Shared Cluster" (free)
   - Select region and create
3. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect Your Application"
   - Copy MongoDB connection string
4. **Update .env** (see Step 4)

---

## ⚙️ Step 4: Configure Environment Variables

The `.env` file is already created. Update it with your settings:

```bash
# Open .env file
# Update these values:

# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/alert360
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alert360

# JWT (change this in production!)
JWT_SECRET=alert360_super_secret_jwt_key_2025_change_this_in_production
JWT_EXPIRE=7d

# API Keys (optional for weather features)
OPENWEATHER_API_KEY=your_openweather_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### Important: Getting API Keys (Optional)

**OpenWeather API:**
1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Generate API key
4. Add to `.env` file

**Google Maps API:**
1. Visit: https://console.cloud.google.com/
2. Create new project
3. Enable Geocoding API
4. Create API key
5. Add to `.env` file

---

## 🚀 Step 5: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

**You should see:**
```
Server running on port 5000
Environment: development
MongoDB connected: localhost
```

---

## ✅ Step 6: Test the Server

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-13T10:30:45.123Z"
}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "city": "Mumbai",
    "country": "India"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Test 4: Get Alerts
```bash
curl http://localhost:5000/api/v1/alerts
```

---

## 🔗 Step 7: Connect Frontend

Update your `app.js` file with the backend URL:

```javascript
// In app.js, add at the top:
const API_BASE_URL = 'http://localhost:5000/api/v1';

// For example, when registering:
fetch(`${API_BASE_URL}/users/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('User registered:', data);
  localStorage.setItem('token', data.token);
})
.catch(err => console.error('Error:', err));
```

---

## 📚 API Endpoints Quick Reference

### Authentication (Public)
```
POST /api/v1/users/register    - Register user
POST /api/v1/users/login       - Login user
```

### Users (Protected)
```
GET  /api/v1/users/profile           - Get profile
PUT  /api/v1/users/profile           - Update profile
PUT  /api/v1/users/preferences       - Update preferences
POST /api/v1/users/emergency-contacts - Add contact
```

### Alerts (Mixed)
```
GET  /api/v1/alerts                - Get all alerts (public)
GET  /api/v1/alerts/:id            - Get single alert (public)
GET  /api/v1/alerts/location       - Get by location (public)
POST /api/v1/alerts                - Create (protected - admin only)
PUT  /api/v1/alerts/:id            - Update (protected - admin only)
DELETE /api/v1/alerts/:id          - Delete (protected - admin only)
PATCH /api/v1/alerts/:id/resolve   - Resolve alert (protected)
```

### Events (Mixed)
```
GET  /api/v1/events                - Get all events (public)
GET  /api/v1/events/:id            - Get single event (public)
GET  /api/v1/events/location       - Get by location (public)
POST /api/v1/events                - Create (protected)
PUT  /api/v1/events/:id            - Update (protected)
DELETE /api/v1/events/:id          - Delete (protected - admin only)
```

### Weather (Public)
```
GET /api/v1/weather/current         - Current weather
GET /api/v1/weather/forecast        - Weather forecast
GET /api/v1/weather/air-quality     - Air quality
GET /api/v1/weather/geocode         - Geocode address
GET /api/v1/weather/reverse-geocode - Reverse geocode
```

---

## 🐛 Troubleshooting

### Problem: MongoDB Connection Error
**Error:** `MongoDB connection error`

**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Check MongoDB URI in `.env` file
3. For MongoDB Atlas, verify connection string format
4. Check internet connection

### Problem: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=5001
```

### Problem: JWT Secret Not Set
**Error:** `Error: jwt secret is not set`

**Solution:**
- Ensure `JWT_SECRET` is set in `.env` file
- Restart server after changing `.env`

### Problem: CORS Error in Frontend
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Update `CORS_ORIGIN` in `.env` to match frontend URL
2. Make sure frontend URL is: `http://localhost:3000` (if running locally)
3. Restart backend server

### Problem: Cannot Find Module Errors
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: 401 Unauthorized on Protected Routes
**Error:** `No token provided` or `Invalid token`

**Solution:**
1. Ensure token is included in Authorization header
2. Format: `Authorization: Bearer <token>`
3. Token may have expired (JWT_EXPIRE=7d)
4. Login again to get new token

### Problem: Database Validation Errors
**Error:** `ValidationError: email is required`

**Solution:**
- Check request body has all required fields
- See API_DOCUMENTATION.md for required fields
- Verify data types match schema

---

## 📊 File Structure Verification

Your backend should look like this:

```
backend/
├── src/
│   ├── server.js                 ← Main entry point
│   ├── config/
│   │   ├── database.js           ← MongoDB connection
│   │   └── constants.js          ← App constants
│   ├── models/
│   │   ├── User.js               ← User schema
│   │   ├── Alert.js              ← Alert schema
│   │   ├── Event.js              ← Event schema
│   │   └── Location.js           ← Location schema
│   ├── controllers/
│   │   ├── userController.js     ← User logic
│   │   ├── alertController.js    ← Alert logic
│   │   ├── eventController.js    ← Event logic
│   │   └── weatherController.js  ← Weather logic
│   ├── routes/
│   │   ├── userRoutes.js         ← User endpoints
│   │   ├── alertRoutes.js        ← Alert endpoints
│   │   ├── eventRoutes.js        ← Event endpoints
│   │   └── weatherRoutes.js      ← Weather endpoints
│   ├── middleware/
│   │   ├── auth.js               ← JWT verification
│   │   └── errorHandler.js       ← Global error handler
│   └── utils/
│       ├── logger.js             ← Logging
│       └── helpers.js            ← Helper functions
├── logs/                         ← Created on first run
├── .env                          ← Your config (created)
├── .env.example                  ← Template
├── package.json                  ← Dependencies
├── verify-setup.js               ← Verification script
├── README.md                     ← Backend README
└── API_DOCUMENTATION.md          ← API reference
```

---

## 🎯 Deployment Checklist

- [ ] All files verified with `npm run verify-setup.js`
- [ ] Dependencies installed: `npm install`
- [ ] MongoDB running and accessible
- [ ] `.env` file configured with:
  - [ ] `MONGODB_URI` set correctly
  - [ ] `JWT_SECRET` changed from default
  - [ ] `NODE_ENV=production` for production
  - [ ] API keys added (if using weather features)
- [ ] Server starts without errors: `npm run dev`
- [ ] Health check responds: `curl http://localhost:5000/health`
- [ ] Can register user: `POST /api/v1/users/register`
- [ ] Can login user: `POST /api/v1/users/login`
- [ ] Frontend configured with correct API_BASE_URL

---

## 📞 Getting Help

1. **Check Logs**: Look in `logs/` directory for error logs
2. **API Documentation**: See `API_DOCUMENTATION.md`
3. **Integration Guide**: See `INTEGRATION_GUIDE.md`
4. **Quick Reference**: See `QUICK_REFERENCE.md`
5. **Code Comments**: Check source files for inline documentation

---

## 🎓 Next Steps

1. ✅ Setup backend (you're here)
2. → Connect frontend (see INTEGRATION_GUIDE.md)
3. → Test all endpoints (see API_DOCUMENTATION.md)
4. → Deploy to production (see production deployment guide)
5. → Setup monitoring and logging

---

**Backend is ready! Happy coding! 🚀**
