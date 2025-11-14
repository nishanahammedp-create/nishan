const Alert = require('../models/Alert');
const Event = require('../models/Event');
const Location = require('../models/Location');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

// Helper to convert a model document into a GeoJSON feature
function docToFeature(doc, type) {
  if (!doc || !doc.location || !doc.location.coordinates || !Array.isArray(doc.location.coordinates.coordinates)) {
    return null;
  }

  const coords = doc.location.coordinates.coordinates;
  const properties = { __type: type };

  // Common properties
  if (doc.title) properties.title = doc.title;
  if (doc.name) properties.name = doc.name;
  if (doc.type) properties.type = doc.type;
  if (doc.severity) properties.severity = doc.severity;
  if (doc.status) properties.status = doc.status;
  if (doc.description) properties.description = doc.description;
  if (doc.source) properties.source = doc.source;
  if (doc.metadata) properties.metadata = doc.metadata;
  // Support common image fields used for pictorial popups
  if (doc.imageUrl) properties.imageUrl = doc.imageUrl;
  if (doc.metadata && doc.metadata.imageUrl) properties.imageUrl = doc.metadata.imageUrl;
  if (doc.metadata && doc.metadata.images && Array.isArray(doc.metadata.images) && doc.metadata.images.length) properties.imageUrl = doc.metadata.images[0];
  if (doc.city) properties.city = doc.city;
  if (doc.country) properties.country = doc.country;

  // Dates
  if (doc.startDate) properties.startDate = doc.startDate;
  if (doc.endDate) properties.endDate = doc.endDate;

  properties.id = doc._id;

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords
    },
    properties
  };
}

// GET /api/v1/map/geojson
// Returns a FeatureCollection containing alerts, events and locations
exports.getGeoJSON = async (req, res, next) => {
  try {
    const include = (req.query.include || 'alerts,events,locations').split(',').map(s => s.trim().toLowerCase());

    const features = [];

    if (include.includes('alerts')) {
      const alerts = await Alert.find({}).lean();
      alerts.forEach(a => {
        const f = docToFeature(a, 'alert');
        if (f) {
          // expose useful alert props
          f.properties.title = a.title || a.type;
          f.properties.severity = a.severity;
          f.properties.status = a.status;
          f.properties.description = a.description;
          features.push(f);
        }
      });
    }

    if (include.includes('events')) {
      const events = await Event.find({}).lean();
      events.forEach(e => {
        const f = docToFeature(e, 'event');
        if (f) {
          f.properties.title = e.title;
          f.properties.startDate = e.startDate;
          f.properties.endDate = e.endDate;
          features.push(f);
        }
      });
    }

    if (include.includes('locations')) {
      const locations = await Location.find({}).lean();
      locations.forEach(l => {
        // Location schema may have coordinates at location.coordinates or coordinates directly
        const fakeDoc = { location: l, name: l.city || l.name, city: l.city, country: l.country, metadata: { riskLevel: l.riskLevel }, _id: l._id };
        const f = docToFeature(fakeDoc, 'location');
        if (f) {
          f.properties.title = l.city || l.name;
          f.properties.riskLevel = l.riskLevel;
          features.push(f);
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      type: 'FeatureCollection',
      features
    });
  } catch (error) {
    logger.error(`Map geojson error: ${error.message}`);
    next(error);
  }
};

// GET /api/v1/map/view
// Returns a simple HTML page containing a Leaflet map that fetches /map/geojson
exports.getMapViewer = (req, res) => {
  const centerLat = req.query.lat || '20.5937';
  const centerLng = req.query.lng || '78.9629';
  const zoom = req.query.zoom || '5';

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALERT 360 - Map Viewer</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html,body,#map { height: 100%; margin:0; padding:0 }
    .info { position:absolute; top:10px; right:10px; z-index:1000; background:white; padding:8px; border-radius:4px; box-shadow:0 0 6px rgba(0,0,0,0.2) }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="info">ALERT 360 Map Viewer — <small>shows alerts, events & locations</small></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // fetch geojson and add to map
    fetch('/api/v1/map/geojson')
      .then(r => r.json())
      .then(data => {
        const geojson = L.geoJSON(data, {
          pointToLayer: function(feature, latlng) {
            const props = feature.properties || {};
            let color = '#3388ff';
            if (props.__type === 'alert') {
              if (props.severity === 'danger') color = '#d73027';
              else if (props.severity === 'warning') color = '#fdae61';
              else color = '#2b83ba';
            } else if (props.__type === 'event') {
              color = '#2ecc71';
            } else if (props.__type === 'location') {
              color = '#9b59b6';
            }
            const marker = L.circleMarker(latlng, { radius: 8, fillColor: color, color: '#fff', weight:1, fillOpacity:0.9 });
            return marker;
          },
          onEachFeature: function(feature, layer) {
            const p = feature.properties || {};
            let html = '<div style="min-width:160px">';
              if (p.title) html += `<h4 style="margin:0 0 6px 0">${p.title}</h4>`;
            if (p.__type) html += `<div><strong>Type:</strong> ${p.__type}</div>`;
            if (p.severity) html += `<div><strong>Severity:</strong> ${p.severity}</div>`;
            if (p.status) html += `<div><strong>Status:</strong> ${p.status}</div>`;
            if (p.description) html += `<div style="margin-top:6px">${p.description}</div>`;
            if (p.imageUrl) html += `<div style="margin-top:8px"><img src="${p.imageUrl}" alt="image" style="max-width:220px;max-height:140px;border-radius:4px;display:block"/></div>`;
            if (p.startDate) html += `<div><strong>Start:</strong> ${p.startDate}</div>`;
            if (p.endDate) html += `<div><strong>End:</strong> ${p.endDate}</div>`;
            if (p.riskLevel) html += `<div><strong>Risk:</strong> ${p.riskLevel}</div>`;
            html += `<div style="margin-top:6px"><small>ID: ${p.id}</small></div>`;
            html += '</div>';
            layer.bindPopup(html);
          }
        }).addTo(map);
        if (data.features && data.features.length) {
          map.fitBounds(geojson.getBounds().pad(0.2));
        }
      })
      .catch(err => {
        console.error('Error loading geojson', err);
      });
  </script>
</body>
</html>`;

  res.status(HTTP_STATUS.OK).send(html);
};
