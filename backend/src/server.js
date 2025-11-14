require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const alertRoutes = require('./routes/alertRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const mapRoutes = require('./routes/mapRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message)
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images, uploads)
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/map', mapRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/locations', locationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
