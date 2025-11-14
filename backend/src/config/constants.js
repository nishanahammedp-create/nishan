module.exports = {
  // Alert Types
  ALERT_TYPES: {
    WEATHER: 'weather',
    EARTHQUAKE: 'earthquake',
    FLOOD: 'flood',
    ACCIDENT: 'accident',
    FIRE: 'fire',
    TSUNAMI: 'tsunami'
  },

  // Alert Severity Levels
  SEVERITY_LEVELS: {
    INFO: 'info',
    WARNING: 'warning',
    DANGER: 'danger'
  },

  // Alert Sources
  ALERT_SOURCES: {
    OFFICIAL: 'official',
    SENSOR: 'sensor',
    SATELLITE: 'satellite',
    AI: 'ai'
  },

  // Response Status
  STATUS: {
    SUCCESS: 'success',
    ERROR: 'error',
    PENDING: 'pending'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Cache Duration (in seconds)
  CACHE_DURATION: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 1800,    // 30 minutes
    LONG: 3600       // 1 hour
  },

  // Search Radius (in km)
  DEFAULT_SEARCH_RADIUS: 50
};
