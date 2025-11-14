# ⚡ QUICK START - Run Backend in 30 Seconds

## 🚀 Start Backend

### Terminal 1: Start MongoDB
```powershell
mongod
```
Wait until you see: `Listening on 127.0.0.1:27017`

### Terminal 2: Start Backend Server
```powershell
cd c:\Users\RAFEEQUE\OneDrive\Desktop\ALERTTTT360\backend
npm run dev
```
Wait until you see: `Server running on port 5000`

---

## ✅ Test It Works

### Terminal 3: Test Health Check
```powershell
curl http://localhost:5000/health
```

**Should return:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-13T10:30:45.123Z"
}
```

---

## 👤 Test User Registration

```powershell
curl -X POST http://localhost:5000/api/v1/users/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "city": "Mumbai",
    "country": "India"
  }'
```

**Should return token:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🔑 Test Login

```powershell
curl -X POST http://localhost:5000/api/v1/users/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 📋 Get All Alerts

```powershell
curl http://localhost:5000/api/v1/alerts
```

---

## 📚 Full Documentation

- **Setup Guide**: `BACKEND_STATUS_COMPLETE.md`
- **Complete Guide**: `backend/COMPLETE_SETUP_GUIDE.md`
- **API Reference**: `backend/API_DOCUMENTATION.md`
- **Integration**: `INTEGRATION_GUIDE.md`

---

## 🛑 Stop Backend

Press `Ctrl + C` in the terminal where `npm run dev` is running

---

**That's it! Backend is running! 🎉**

For more info, see `BACKEND_STATUS_COMPLETE.md`
